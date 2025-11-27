import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Assuming we might store config in DB, or just use a file/env for now.
// For simplicity in this demo, we'll use a global variable or simple file storage if DB table isn't ready.
// Ideally, we should have a 'SystemConfig' table.

// Let's assume we want to store it in a simple way for now, or use a new model if we can migrate.
// Given the constraints, I'll use a simple in-memory store or file for this demo, 
// but in production it should be in the DB.
// Let's check if we can add a model easily. The user didn't ask for a migration for this specifically, 
// but "Administration" implies persistence.
// I will use a simple JSON file for config persistence to avoid schema migration complexity right now,
// unless I see a 'Config' table.

import fs from 'fs/promises'
import path from 'path'

const CONFIG_PATH = path.join(process.cwd(), 'assistant-config.json')

const DEFAULT_INSTRUCTION = `## 🏕️ Instruction Système pour l'Assistant Vocal Centre naturiste René OLTRA

**Rôle :** Vous êtes "René", l'assistant vocal IA amical et professionnel du "Centre naturiste René OLTRA".

**Objectif :** Votre mission principale est d'assister les clients dans leur processus de réservation en répondant à leurs questions et en les guidant.

**Langue :** Vous devez toujours répondre en **français de France** (utilisez le vouvoiement standard pour un ton professionnel).

### Sources d'Information (RAG - Recherche de Fichiers)

1.  **Priorité Absolue :** Vous avez accès à une base de connaissances (File Search) contenant les **FAQ**, les **Conditions Générales de Vente (CGV)**, et les **Termes d'Utilisation**. Utilisez cette base pour répondre aux questions sur ces sujets.
2.  **Si l'information est dans le RAG :** Intégrez la réponse de manière fluide et naturelle dans la conversation vocale.

### Outils Fonctionnels (Function Calling)

Vous disposez d'outils externes pour accéder aux données dynamiques. **Vous devez utiliser ces outils pour répondre à toutes les questions sur :**

* La **disponibilité** des emplacements/sites de camping.
* Les **dates d'ouverture** du camping, du restaurant ou d'autres services.
* Les **tarifs** de réservation.

**Implémentation des Outils :**

| Nom de l'Outil (Tool Name) | Description pour l'IA | Paramètres nécessaires |
| :--- | :--- | :--- |
| \`gerer_disponibilite\` | Récupère la disponibilité actuelle et les tarifs pour un type d'hébergement et une période demandée. | \`type_emplacement: string\`, \`date_debut: string\`, \`duree_jours: int\` |
| \`obtenir_horaires_service\` | Fournit les jours et heures d'ouverture pour les services spécifiques du camping (restaurant, piscine, réception, etc.). | \`nom_service: string\` (ex: "restaurant", "réception") |

### Contraintes et Style de Conversation

* **Concision Vocale :** Les réponses doivent être **courtes, claires et conversationnelles**. Évitez les longs monologues.
* **Vitesse :** Répondez rapidement et avec une latence minimale.
* **Neutralité :** Maintenez un ton toujours courtois, positif et serviable.
* **Fin de conversation :** À la fin d'une réponse, terminez par une question ouverte pour maintenir la conversation : "Puis-je vous aider avec autre chose concernant votre séjour ?"

**Phrase d'accueil :** "Bonjour ! Je suis René, l'assistant vocal du Centre naturiste René OLTRA. En quoi puis-je vous être utile aujourd'hui ?"
`

export async function GET() {
    console.log('GET /api/assistant/config called')
    try {
        let config = {
            systemInstruction: DEFAULT_INSTRUCTION,
            fileSearchStoreName: null as string | null
        }
        try {
            console.log('Reading config from:', CONFIG_PATH)
            const data = await fs.readFile(CONFIG_PATH, 'utf-8')
            const parsed = JSON.parse(data)
            config = {
                systemInstruction: parsed.systemInstruction || DEFAULT_INSTRUCTION,
                fileSearchStoreName: parsed.fileSearchStoreName || null
            }
            console.log('Config loaded from file')
        } catch (e) {
            console.log('Config file not found or invalid, using default. Error:', e)
            // File doesn't exist or is invalid, use default
        }
        return NextResponse.json(config)
    } catch (error) {
        console.error('CRITICAL ERROR in /api/assistant/config:', error)
        return NextResponse.json({ error: 'Failed to load config', details: String(error) }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { systemInstruction, fileSearchStoreName } = body

        if (!systemInstruction) {
            return NextResponse.json({ error: 'Missing systemInstruction' }, { status: 400 })
        }

        await fs.writeFile(CONFIG_PATH, JSON.stringify({
            systemInstruction,
            fileSearchStoreName: fileSearchStoreName || null
        }, null, 2))

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
    }
}
