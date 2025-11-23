import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                stay: true,
                user: true,
                supplements: {
                    include: { supplement: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(bookings)
    } catch (error) {
        console.error('Error fetching admin bookings:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
