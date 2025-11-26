import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { ragStore, RagChunk } from '@/lib/rag-store'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' })

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        console.log(`Processing file for local RAG: ${file.name}`)

        // Read file content
        const buffer = Buffer.from(await file.arrayBuffer())
        const text = buffer.toString('utf-8')

        // Simple chunking by paragraphs (can be improved)
        const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 20)
        const chunks: RagChunk[] = []

        // Embed each chunk
        for (const para of paragraphs) {
            try {
                const embeddingRes = await ai.models.embedContent({
                    model: 'text-embedding-004',
                    contents: [{ role: 'user', parts: [{ text: para }] }]
                })
                const values = embeddingRes.embeddings?.[0]?.values

                if (values) {
                    chunks.push({
                        id: crypto.randomUUID(),
                        docId: '', // Will be set by addDocument
                        text: para,
                        embedding: values
                    })
                }
            } catch (e) {
                console.error('Error embedding chunk:', e)
            }
        }

        if (chunks.length === 0) {
            return NextResponse.json({ error: 'No text content extracted or embedding failed' }, { status: 400 })
        }

        // Store in local RAG
        const docId = await ragStore.addDocument(file.name, chunks)

        return NextResponse.json({
            success: true,
            message: `Fichier "${file.name}" ingéré (${chunks.length} segments)`,
            docId
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({
            error: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
