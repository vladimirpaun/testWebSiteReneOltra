import { ai } from '@/lib/genai-client'

export async function GET() {
    try {
        // List all File Search stores
        const stores = []
        for await (const store of ai.fileSearchStores.list()) {
            stores.push({
                name: store.name,
                displayName: store.displayName,
                createTime: store.createTime,
                updateTime: store.updateTime
            })
        }

        return Response.json({ stores })
    } catch (error) {
        console.error('Error listing stores:', error)
        return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}
