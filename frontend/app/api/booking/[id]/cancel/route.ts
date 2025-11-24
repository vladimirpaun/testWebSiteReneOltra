import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const booking = await prisma.booking.findUnique({ where: { id } })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error cancelling booking:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
