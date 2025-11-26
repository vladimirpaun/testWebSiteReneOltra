import { GoogleGenAI } from '@google/genai'

// File Search est uniquement disponible via l'API Gemini (clé API). On ne bascule en Vertex
// que si l'option est explicitement demandée.
const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true'

const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID || ''
const location = process.env.GOOGLE_CLOUD_LOCATION || process.env.GCP_LOCATION || 'us-central1'
const apiKey = process.env.GOOGLE_API_KEY || ''

// Shared Google GenAI client for the whole app (File Search + chat)
export const ai = new GoogleGenAI(
    useVertex
        ? {
            vertexai: true,
            project,
            location,
        }
        : {
            apiKey,
        }
)

export const aiMode = useVertex ? 'vertex' : 'api-key'
