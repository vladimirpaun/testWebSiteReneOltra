import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const body = await request.json()
    const { changeType, startDate, endDate, guests, supplements } = body

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: params.id },
            include: { stay: true, supplements: true },
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        let newTotalPrice = booking.totalPrice
        let newStartDate = booking.startDate
        let newEndDate = booking.endDate

        // Simulate "stay" change (Dates)
        if (changeType === 'stay' && startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)

            // Check availability
            const conflictingBooking = await prisma.booking.findFirst({
                where: {
                    stayId: booking.stayId,
                    id: { not: params.id },
                    status: { not: 'CANCELLED' },
                    AND: [
                        { startDate: { lt: end } },
                        { endDate: { gt: start } },
                    ],
                },
            })

            if (conflictingBooking) {
                return NextResponse.json(
                    { error: 'Stay is not available for these dates' },
                    { status: 400 }
                )
            }

            newStartDate = start
            newEndDate = end

            const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            const oldNights = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24))
            const pricePerNight = booking.stay.basePrice

            newTotalPrice = newTotalPrice - (oldNights * pricePerNight) + (nights * pricePerNight)
        }

        // Simulate "rubrics" change (Supplements)
        if (changeType === 'rubrics' && supplements) {
            let supplementsPrice = 0
            for (const supp of supplements) {
                const supplement = await prisma.supplement.findUnique({
                    where: { id: supp.id },
                })
                if (supplement) {
                    supplementsPrice += supplement.price * (supp.quantity || 1)
                }
            }

            const nights = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24))
            newTotalPrice = (nights * booking.stay.basePrice) + supplementsPrice
        }

        return NextResponse.json({
            success: true,
            oldPrice: booking.totalPrice,
            newPrice: newTotalPrice,
            difference: newTotalPrice - booking.totalPrice,
            currency: 'EUR'
        })

    } catch (error) {
        console.error('Error simulating price:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
