import { FunctionDeclaration } from '@google/genai'
import { ai } from '@/lib/genai-client'

// Instantiate the model with Google AI SDK / Vertex AI SDK (shared client)
export const getGenerativeModel = (systemInstruction: string, fileSearchStoreName?: string) => {
    const functionDeclarations: FunctionDeclaration[] = [
        {
            name: "gerer_disponibilite",
            description: "Récupère la disponibilité actuelle et les tarifs pour un type d'hébergement et une période demandée.",
            parameters: {
                type: "object" as const,
                properties: {
                    type_emplacement: {
                        type: "string" as const,
                        description: "Le type d'hébergement recherché (ex: Mobil-home, Emplacement, Chalet, etc.)"
                    },
                    date_debut: {
                        type: "string" as const,
                        description: "Date de début du séjour au format YYYY-MM-DD"
                    },
                    duree_jours: {
                        type: "integer" as const,
                        description: "Durée du séjour en nombre de nuits"
                    }
                },
                required: ["type_emplacement", "date_debut", "duree_jours"]
            }
        },
        {
            name: "obtenir_horaires_service",
            description: "Fournit les jours et heures d'ouverture pour les services spécifiques du camping.",
            parameters: {
                type: "object" as const,
                properties: {
                    nom_service: {
                        type: "string" as const,
                        description: "Le nom du service (ex: restaurant, réception, piscine, épicerie)"
                    }
                },
                required: ["nom_service"]
            }
        }
    ]

    const tools: any[] = [
        { functionDeclarations }
    ]

    // NOTE: File Search désactivé (RAG local utilisé) même si un store est présent

    return {
        model: 'gemini-2.5-flash',
        systemInstruction,
        tools,
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 1,
            topP: 0.95,
        }
    }
};
