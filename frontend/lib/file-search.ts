import { ai } from '@/lib/genai-client'

// File Search Store management
export const fileSearchClient = ai

export async function getOrCreateFileSearchStore() {
    const storeName = 'camping-le-bon-repos-kb'

    try {
        // Try to get existing store
        const pager = await ai.fileSearchStores.list()
        for await (const store of pager) {
            if (store.displayName === storeName) {
                return store.name
            }
        }
    } catch (error) {
        console.error('Error listing file search stores:', error)
    }

    // Create new store if not found
    try {
        const fileSearchStore = await ai.fileSearchStores.create({
            config: { displayName: storeName }
        })
        return fileSearchStore.name
    } catch (error) {
        console.error('Error creating file search store:', error)
        throw error
    }
}

export async function uploadToFileSearch(file: File, fileName: string) {
    const fileSearchStoreName = await getOrCreateFileSearchStore()

    // Convert File to Buffer for Node.js
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Save temporarily to disk (needed for the API)
    const fs = await import('fs/promises')
    const path = await import('path')
    const os = await import('os')

    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, file.name)

    try {
        await fs.writeFile(tempFilePath, buffer)

        // Upload and import the file into the File Search store
        let operation = await ai.fileSearchStores.uploadToFileSearchStore({
            file: tempFilePath,
            fileSearchStoreName: fileSearchStoreName || '',
            config: {
                displayName: fileName,
                chunkingConfig: {
                    whiteSpaceConfig: {
                        maxTokensPerChunk: 500,
                        maxOverlapTokens: 50
                    }
                }
            }
        })

        // Wait until import is complete
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            operation = await ai.operations.get({ operation })
        }

        // Clean up temp file
        await fs.unlink(tempFilePath)

        return {
            success: true,
            fileSearchStoreName,
            fileName
        }
    } catch (error) {
        // Clean up temp file on error
        try {
            await fs.unlink(tempFilePath)
        } catch { }
        throw error
    }
}
