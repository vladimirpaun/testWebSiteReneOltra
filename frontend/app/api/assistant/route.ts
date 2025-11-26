import { NextResponse } from 'next/server'
import { getGenerativeModel } from '@/lib/vertex-ai'
import { ai } from '@/lib/genai-client'
import { ragStore } from '@/lib/rag-store'

const HANDLED_FUNCTIONS = new Set(['gerer_disponibilite', 'obtenir_horaires_service'])

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { message, history = [] } = body

        // 1. Load System Instruction
        const configRes = await fetch(new URL('/api/assistant/config', request.url).toString())
        const config = await configRes.json()
        const systemInstruction = config.systemInstruction || ''
        const fileSearchStoreName = config.fileSearchStoreName || null

        // 2. Initialize Model config
        const modelConfig = getGenerativeModel(systemInstruction, fileSearchStoreName)

        console.log('Model config:', {
            model: modelConfig.model,
            hasFileSearch: !!fileSearchStoreName,
            fileSearchStoreName,
        })

        // Build conversation with history + current user turn (Content[]), injecting RAG context if present
        let userMessage = message as string
        let ragContext = ''

        try {
            const topChunks = await ragStore.search(userMessage, 5)
            if (topChunks.length > 0) {
                ragContext = topChunks.map(c => `- ${c.text}`).join('\n')
            }
        } catch (e) {
            console.error('RAG embed/retrieval error:', e)
        }

        const conversation = [
            ...(Array.isArray(history) ? history : []),
            ragContext
                ? {
                    role: 'user',
                    parts: [{ text: `${message}\n\nContextes retrouvés (RAG local) :\n${ragContext}` }]
                }
                : { role: 'user', parts: [{ text: message }] }
        ]

        // 3. Send message with Google AI
        let response = await ai.models.generateContent({
            model: modelConfig.model,
            contents: conversation,
            config: {
                systemInstruction: modelConfig.systemInstruction,
                tools: modelConfig.tools,
                temperature: modelConfig.generationConfig.temperature,
                maxOutputTokens: modelConfig.generationConfig.maxOutputTokens,
                topP: modelConfig.generationConfig.topP
            }
        })

        // Check for function calls (we only act on our own tools)
        const candidates = response.candidates || []
        if (candidates.length > 0) {
            const modelContent = candidates[0]?.content
            const parts = modelContent?.parts || []
            const functionCalls = parts.filter((p: any) => p.functionCall)
            const handledFunctionCalls = functionCalls.filter((p: any) => HANDLED_FUNCTIONS.has(p.functionCall.name))
            const ignoredFunctionCalls = functionCalls.filter((p: any) => !HANDLED_FUNCTIONS.has(p.functionCall.name))

            if (ignoredFunctionCalls.length > 0) {
                console.log('Skipping non-handled function calls (likely File Search/tool-internal):', ignoredFunctionCalls.map((p: any) => p.functionCall?.name))
            }

            // If any function calls exist, prepare follow-up (handled ones are executed, others receive noop response so model can continue)
            if (functionCalls.length > 0) {
                console.log('Function calls detected (handled + ignored):', functionCalls.length)

                const functionResponses = []
                for (const part of handledFunctionCalls) {
                    const fc = part.functionCall
                    if (!fc) continue
                    const name = fc.name
                    const args = fc.args || {}

                    console.log(`Executing tool: ${name}`, args)

                    let toolResult: any = { error: 'Unknown function' }

                    if (name === 'gerer_disponibilite') {
                        const toolRes = await fetch(new URL('/api/tools/availability', request.url).toString(), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(args)
                        })
                        toolResult = await toolRes.json()
                    } else if (name === 'obtenir_horaires_service') {
                        const toolRes = await fetch(new URL('/api/tools/hours', request.url).toString(), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(args)
                        })
                        toolResult = await toolRes.json()
                    }

                    functionResponses.push({
                        functionResponse: {
                            name: name,
                            response: toolResult
                        }
                    })
                }

                // For unhandled calls (e.g. File Search internal), send noop so model can continue and produce text
                for (const part of ignoredFunctionCalls) {
                    const fc = part.functionCall
                    if (!fc) continue
                    functionResponses.push({
                        functionResponse: {
                            name: fc.name,
                            response: { warning: 'Fonction non gérée côté serveur; poursuivez sans cet outil.' }
                        }
                    })
                }

                // Build follow-up conversation: prior conversation + model function call + function responses
                const followUpConversation = [
                    ...conversation,
                    modelContent,
                    { role: 'function', parts: functionResponses }
                ]

                response = await ai.models.generateContent({
                    model: modelConfig.model,
                    contents: followUpConversation,
                    config: {
                        systemInstruction: modelConfig.systemInstruction,
                        tools: modelConfig.tools,
                        ...modelConfig.generationConfig
                    }
                })
            }
        }

        // Get text from final response
        const finalTextRaw =
            response.text ||
            (response.candidates?.[0]?.content?.parts || [])
                .filter((p: any) => p.text)
                .map((p: any) => p.text)
                .join(' ')
        let finalText = (finalTextRaw || '').trim()
        if (!finalText && ragContext) {
            finalText = `Voici des passages trouvés dans la base locale :\n${ragContext}\n\nPouvez-vous préciser votre question ?`
        }
        if (!finalText) {
            finalText = "Désolé, je n'ai pas pu récupérer une réponse pour le moment. Pouvez-vous reformuler ou réessayer ?"
        }

        // Check for grounding metadata (File Search usage)
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata
        if (groundingMetadata) {
            console.log('✅ Grounding metadata found - File Search was used:', JSON.stringify(groundingMetadata, null, 2))
        } else {
            console.log('⚠️ No grounding metadata - File Search may not be active')
        }

        // Debug: log a compact view of candidates to understand why no text/grounding
        try {
            console.log('Response summary:', JSON.stringify({
                promptFeedback: response.promptFeedback,
                candidates: (response.candidates || []).map((c: any) => ({
                    finishReason: c.finishReason,
                    grounding: c.groundingMetadata,
                    parts: c.content?.parts?.map((p: any) => p.text || p.functionCall || Object.keys(p)[0])
                }))
            }, null, 2))
        } catch {
            // ignore logging errors
        }

        return NextResponse.json({ text: finalText })

    } catch (error) {
        console.error('Assistant Error:', error)
        return NextResponse.json({
            error: 'Failed to process request',
            details: error instanceof Error ? error.message : 'Unknown'
        }, { status: 500 })
    }
}
