import { GoogleGenAI } from '@google/genai'
import fs from 'fs/promises'
import path from 'path'

// Initialize Google AI
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' })

// Types
export interface RagChunk {
    id: string
    docId: string
    text: string
    embedding: number[]
    metadata?: Record<string, any>
}

export interface RagDocument {
    id: string
    name: string
    uploadDate: string
    chunkCount: number
}

interface RagStoreData {
    documents: RagDocument[]
    chunks: RagChunk[]
}

const STORAGE_FILE = path.join(process.cwd(), 'rag-storage.json')

// Helper: Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0
    let normA = 0
    let normB = 0
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i]
        normA += vecA[i] * vecA[i]
        normB += vecB[i] * vecB[i]
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export class RagStore {
    private data: RagStoreData = { documents: [], chunks: [] }
    private loaded = false

    private async load() {
        if (this.loaded) return
        try {
            const content = await fs.readFile(STORAGE_FILE, 'utf-8')
            this.data = JSON.parse(content)
        } catch (e) {
            // File might not exist yet, start empty
            this.data = { documents: [], chunks: [] }
        }
        this.loaded = true
    }

    private async save() {
        await fs.writeFile(STORAGE_FILE, JSON.stringify(this.data, null, 2))
    }

    async addDocument(docName: string, chunks: RagChunk[]): Promise<string> {
        await this.load()

        const docId = crypto.randomUUID()
        const newDoc: RagDocument = {
            id: docId,
            name: docName,
            uploadDate: new Date().toISOString(),
            chunkCount: chunks.length
        }

        // Tag chunks with docId
        chunks.forEach(c => c.docId = docId)

        this.data.documents.push(newDoc)
        this.data.chunks.push(...chunks)

        await this.save()
        return docId
    }

    async search(query: string, limit = 5): Promise<RagChunk[]> {
        await this.load()

        // Embed query
        const embeddingRes = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: [{ role: 'user', parts: [{ text: query }] }]
        })
        const queryEmbedding = embeddingRes.embeddings?.[0]?.values

        if (!queryEmbedding) throw new Error('Failed to embed query')

        // Calculate similarity for all chunks
        const scoredChunks = this.data.chunks.map(chunk => ({
            chunk,
            score: cosineSimilarity(queryEmbedding, chunk.embedding)
        }))

        // Sort by score desc
        scoredChunks.sort((a, b) => b.score - a.score)

        return scoredChunks.slice(0, limit).map(sc => sc.chunk)
    }

    async getDocuments(): Promise<RagDocument[]> {
        await this.load()
        return this.data.documents
    }
}

export const ragStore = new RagStore()
