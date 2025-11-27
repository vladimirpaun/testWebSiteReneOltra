import { NextResponse } from 'next/server'
import { ai } from '@/lib/genai-client'

export async function GET() {
    try {
        const documents = []
        const pager = await ai.files.list({})
        for await (const doc of pager) {
            documents.push({
                name: doc.name,
                displayName: doc.displayName,
                state: doc.state,
                sizeBytes: doc.sizeBytes,
                updateTime: doc.updateTime,
            })
        }
        return NextResponse.json({ documents })
    } catch (error) {
        console.error('Error listing documents:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}
