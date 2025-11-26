'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, X, MessageSquare, Volume2, VolumeX } from 'lucide-react'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface LiveAssistantProps {
    onClose: () => void
}

export default function LiveAssistant({ onClose }: LiveAssistantProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [volume, setVolume] = useState(0)
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([])

    const wsRef = useRef<WebSocket | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const processorRef = useRef<ScriptProcessorNode | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const audioQueueRef = useRef<Int16Array[]>([])
    const isPlayingRef = useRef(false)

    // Initialize Audio Context
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000 // Gemini output sample rate
        })
        return () => {
            stopRecording()
            wsRef.current?.close()
            audioContextRef.current?.close()
        }
    }, [])

    const connect = () => {
        // In a real app, fetch ephemeral token from backend
        // For now, we'll use a direct connection proxy or similar approach
        // Since we can't easily do server-to-server WS in Next.js API routes without a custom server,
        // we will use a client-side approach with the API key (WARNING: NOT FOR PRODUCTION)
        // OR better: use the existing text chat for now if Live API is too complex to shim without a backend proxy.

        // Actually, let's try to use the new "Multimodal Live API" via WebSocket if possible.
        // The endpoint is wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=API_KEY

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY // Need to expose this or fetch from server
        if (!apiKey) {
            console.error('No API Key found')
            return
        }

        // Fetch system instruction first
        fetch('/api/assistant/config')
            .then(res => res.json())
            .then(config => {
                const systemInstruction = config.systemInstruction || "You are a helpful assistant."

                // Append specific voice instruction if not present
                const voiceInstruction = systemInstruction.includes("français de France")
                    ? systemInstruction
                    : systemInstruction + "\n\nIMPORTANT: Vous devez parler avec un accent français de France standard, pas québécois. Soyez très naturel et humain."

                const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`
                const ws = new WebSocket(url)

                ws.onopen = () => {
                    console.log('Connected to Live API')
                    setIsConnected(true)

                    // Send initial setup
                    const setupMsg = {
                        setup: {
                            model: "models/gemini-2.0-flash-exp",
                            generationConfig: {
                                responseModalities: ["AUDIO"],
                                speechConfig: {
                                    voiceConfig: {
                                        prebuiltVoiceConfig: {
                                            voiceName: "Aoede" // Often good for French/European
                                        }
                                    }
                                }
                            },
                            systemInstruction: {
                                parts: [{ text: voiceInstruction }]
                            },
                            tools: [
                                {
                                    functionDeclarations: [
                                        {
                                            name: "search_knowledge_base",
                                            description: "CRITICAL: You MUST use this tool for EVERY user question to check for information in the knowledge base. Do not answer from your own knowledge. Always check the RAG first.",
                                            parameters: {
                                                type: "object",
                                                properties: {
                                                    query: { type: "string" }
                                                },
                                                required: ["query"]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                    console.log('Sending setup:', setupMsg)
                    ws.send(JSON.stringify(setupMsg))
                }

                ws.onerror = (error) => {
                    console.error('WebSocket Error:', error)
                }

                ws.onmessage = async (event) => {
                    let data
                    try {
                        if (event.data instanceof Blob) {
                            data = JSON.parse(await event.data.text())
                        } else {
                            data = JSON.parse(event.data)
                        }
                        console.log('Received message:', data)
                    } catch (e) {
                        console.error('Error parsing message:', e)
                        return
                    }

                    // Handle Audio Output
                    if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                        const audioData = data.serverContent.modelTurn.parts[0].inlineData.data
                        playAudio(audioData)
                    }

                    // Handle Tool Call
                    if (data.toolCall) {
                        handleToolCall(data.toolCall)
                    }
                }

                ws.onclose = (event) => {
                    console.log('Disconnected from Live API', event.code, event.reason)
                    setIsConnected(false)
                    setIsRecording(false)
                }

                wsRef.current = ws
            })
            .catch(err => {
                console.error('Failed to fetch config:', err)
            })
    }

    const handleToolCall = async (toolCall: any) => {
        const functionCalls = toolCall.functionCalls
        const responses = []

        for (const call of functionCalls) {
            if (call.name === 'search_knowledge_base') {
                const args = call.args
                // Call our RAG endpoint
                const res = await fetch('/api/rag/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: args.query })
                })
                const data = await res.json()
                const context = data.chunks.join('\n\n')

                responses.push({
                    id: call.id,
                    name: call.name,
                    response: { result: context }
                })
            }
        }

        // Send tool response back
        wsRef.current?.send(JSON.stringify({
            toolResponse: {
                functionResponses: responses
            }
        }))
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1
                }
            })
            streamRef.current = stream

            if (!audioContextRef.current) return

            const source = audioContextRef.current.createMediaStreamSource(stream)
            const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)

            processor.onaudioprocess = (e) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

                const inputData = e.inputBuffer.getChannelData(0)

                // Convert Float32 to Int16 (PCM)
                const pcmData = new Int16Array(inputData.length)
                for (let i = 0; i < inputData.length; i++) {
                    pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF
                }

                // Convert to Base64
                const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)))

                // Echo cancellation: Don't send audio if assistant is speaking
                if (activeAudioSourcesRef.current > 0) {
                    return
                }

                // Send to Gemini
                wsRef.current.send(JSON.stringify({
                    realtimeInput: {
                        mediaChunks: [{
                            mimeType: "audio/pcm",
                            data: base64Audio
                        }]
                    }
                }))

                // Visualizer volume
                const sum = inputData.reduce((a, b) => a + Math.abs(b), 0)
                setVolume(Math.min(100, (sum / inputData.length) * 500))
            }

            source.connect(processor)
            processor.connect(audioContextRef.current.destination)

            processorRef.current = processor
            setIsRecording(true)

            if (!isConnected) connect()

        } catch (err) {
            console.error('Error accessing microphone:', err)
        }
    }

    const stopRecording = () => {
        if (processorRef.current && audioContextRef.current) {
            processorRef.current.disconnect()
            processorRef.current = null
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setIsRecording(false)
        setVolume(0)
    }

    const activeAudioSourcesRef = useRef(0)
    const nextStartTimeRef = useRef<number>(0)

    const playAudio = (base64Data: string) => {
        if (!audioContextRef.current) return

        try {
            const binaryString = atob(base64Data)
            const len = binaryString.length
            const bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }
            const int16Data = new Int16Array(bytes.buffer)

            // Convert Int16 PCM to Float32
            const float32Data = new Float32Array(int16Data.length)
            for (let i = 0; i < int16Data.length; i++) {
                // Normalize to [-1.0, 1.0]
                float32Data[i] = int16Data[i] / 32768.0
            }

            // Create buffer (1 channel, 24kHz as per Gemini Live API default)
            const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000)
            buffer.getChannelData(0).set(float32Data)

            // Create source
            const source = audioContextRef.current.createBufferSource()
            source.buffer = buffer
            source.connect(audioContextRef.current.destination)

            // Schedule playback
            const currentTime = audioContextRef.current.currentTime

            // Ensure we don't schedule in the past, but keep continuity
            if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime
            }

            source.start(nextStartTimeRef.current)
            nextStartTimeRef.current += buffer.duration

            // Track active sources for echo cancellation
            activeAudioSourcesRef.current += 1
            source.onended = () => {
                activeAudioSourcesRef.current = Math.max(0, activeAudioSourcesRef.current - 1)
            }

        } catch (e) {
            console.error('Error playing audio:', e)
        }
    }

    return (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-400 animate-pulse" : "bg-red-400")} />
                    <span className="font-medium">Gaston (Live)</span>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Visualizer Area */}
            <div className="h-48 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Animated waves */}
                <div className="flex items-center justify-center gap-1 h-20">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-3 bg-blue-500 rounded-full transition-all duration-75"
                            style={{
                                height: isRecording ? `${Math.max(10, volume * (Math.random() + 0.5))}%` : '10%',
                                opacity: isRecording ? 1 : 0.3
                            }}
                        />
                    ))}
                </div>

                <p className="mt-4 text-sm text-gray-500 font-medium">
                    {isRecording ? "Je vous écoute..." : "Appuyez pour parler"}
                </p>
            </div>

            {/* Controls */}
            <div className="p-4 bg-white border-t border-gray-100 flex justify-center">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                        isRecording
                            ? "bg-red-500 hover:bg-red-600 scale-110"
                            : "bg-blue-600 hover:bg-blue-700"
                    )}
                >
                    {isRecording ? <MicOff className="text-white w-8 h-8" /> : <Mic className="text-white w-8 h-8" />}
                </button>
            </div>
        </div>
    )
}
