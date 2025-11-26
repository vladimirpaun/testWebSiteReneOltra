import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { nom_service } = body

        const service = nom_service.toLowerCase()
        let response = ""

        if (service.includes('restaurant') || service.includes('bar')) {
            response = "Le restaurant 'Le Sud' est ouvert tous les jours de 12h à 14h30 et de 19h à 22h30."
        } else if (service.includes('piscine') || service.includes('aquatique')) {
            response = "L'espace aquatique est ouvert de 10h à 19h non-stop."
        } else if (service.includes('réception') || service.includes('accueil')) {
            response = "La réception vous accueille de 8h à 20h en haute saison, et de 9h à 18h en basse saison."
        } else if (service.includes('épicerie') || service.includes('supermarché')) {
            response = "L'épicerie est ouverte de 7h30 à 20h."
        } else {
            response = `Je n'ai pas les horaires spécifiques pour "${nom_service}". La réception est ouverte de 8h à 20h pour vous renseigner.`
        }

        return NextResponse.json({ result: response })

    } catch (error) {
        console.error('Error in hours tool:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
