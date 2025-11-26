import { NextResponse } from 'next/server'
import { ragStore } from '@/lib/rag-store'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { query, limit = 5 } = body

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        const chunks = await ragStore.search(query, limit)

        return NextResponse.json({
            chunks: chunks.map(c => c.text),
            metadata: chunks.map(c => ({ docId: c.docId, score: (c as any).score }))
        })

    } catch (error) {
        console.error('RAG Search error:', error)
        return NextResponse.json({
            error: 'Search failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
