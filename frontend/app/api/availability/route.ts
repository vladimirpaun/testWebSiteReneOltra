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
    const guestCount = guests ? parseInt(guests) : 1

    try {
        // Find stays that are NOT booked during the requested period
        // A stay is booked if there is a booking where:
        // (bookingStart < requestEnd) AND (bookingEnd > requestStart)
        const availableStays = await prisma.stay.findMany({
            where: {
                capacity: {
                    gte: guestCount,
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
        })

        return NextResponse.json(availableStays)
    } catch (error) {
        console.error('Error fetching availability:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
