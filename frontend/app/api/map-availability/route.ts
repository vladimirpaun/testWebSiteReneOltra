import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const guests = searchParams.get('guests')

    if (!startDate || !endDate) {
        return NextResponse.json(
            { error: 'Start date and end date are required' },
            { status: 400 }
        )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    // const guestCount = guests ? parseInt(guests) : 1 // Optional: filter by capacity if needed, but map usually shows all

    try {
        // Fetch ALL stays
        const allStays = await prisma.stay.findMany({
            include: {
                bookings: {
                    where: {
                        AND: [
                            { startDate: { lt: end } },
                            { endDate: { gt: start } },
                            { status: { not: 'CANCELLED' } },
                        ],
                    },
                    select: {
                        id: true, // We only need to know if there are any bookings
                    }
                }
            }
        })

        // Map to format expected by frontend
        const mapStays = allStays.map(stay => ({
            id: stay.id,
            name: stay.name,
            type: stay.type,
            category: stay.type, // Using type as category for now
            price: stay.basePrice,
            capacity: stay.capacity,
            surface: stay.surface,
            zoneId: stay.zoneId,
            number: stay.number,
            status: stay.bookings.length > 0 ? 'occupied' : 'available',
            features: ['Electricité 10A', 'Eau', 'Wifi'], // Hardcoded for now, or add to DB
        }))

        return NextResponse.json(mapStays)
    } catch (error) {
        console.error('Error fetching map availability:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
