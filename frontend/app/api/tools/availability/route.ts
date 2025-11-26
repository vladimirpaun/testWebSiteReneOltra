import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { type_emplacement, date_debut, duree_jours } = body

        if (!type_emplacement || !date_debut || !duree_jours) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
        }

        const start = new Date(date_debut)
        const end = new Date(start)
        end.setDate(start.getDate() + parseInt(duree_jours))

        // Find stays of the requested type that are NOT booked
        const availableStays = await prisma.stay.findMany({
            where: {
                type: {
                    contains: type_emplacement, // Loose match for better UX
                },
                bookings: {
                    none: {
                        AND: [
                            { startDate: { lt: end } },
                            { endDate: { gt: start } },
                            { status: { not: 'CANCELLED' } },
                        ],
                    },
                },
            },
            take: 3 // Limit results for voice brevity
        })

        if (availableStays.length === 0) {
            return NextResponse.json({
                result: `Désolé, je n'ai trouvé aucun hébergement de type "${type_emplacement}" disponible pour ces dates.`
            })
        }

        // Calculate total price (simplified)
        const results = availableStays.map(stay => {
            const totalPrice = stay.basePrice * parseInt(duree_jours)
            return `${stay.name} (${stay.capacity} pers.) : ${totalPrice}€ pour ${duree_jours} nuits.`
        })

        return NextResponse.json({
            result: `Voici les disponibilités trouvées : ${results.join(' ')}`
        })

    } catch (error) {
        console.error('Error in availability tool:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
