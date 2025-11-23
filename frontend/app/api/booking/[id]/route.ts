import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json()
    const { changeType, startDate, endDate, guests, supplements } = body

    try {
        // 1. Fetch existing booking
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { stay: true, supplements: true },
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        let updatedData: any = {}
        let newTotalPrice = booking.totalPrice

        // 2. Handle "stay" change (Dates)
        if (changeType === 'stay' && startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)

            // Check availability for new dates (excluding current booking)
            const conflictingBooking = await prisma.booking.findFirst({
                where: {
                    stayId: booking.stayId,
                    id: { not: id }, // Exclude current booking
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

            updatedData.startDate = start
            updatedData.endDate = end

            // Recalculate base price
            const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            const oldNights = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24))
            const pricePerNight = booking.stay.basePrice

            newTotalPrice = newTotalPrice - (oldNights * pricePerNight) + (nights * pricePerNight)
        }

        // 3. Handle "friends" change (Guests)
        if (changeType === 'friends' && guests) {
            const guestCount = parseInt(guests)
            if (guestCount > booking.stay.capacity) {
                return NextResponse.json(
                    { error: `Maximum capacity is ${booking.stay.capacity} guests` },
                    { status: 400 }
                )
            }
            // Note: In this simple model, guest count doesn't affect price, but it could.
        }

        // 4. Handle "rubrics" change (Supplements)
        if (changeType === 'rubrics' && supplements) {
            // Remove old supplements
            await prisma.bookingSupplement.deleteMany({
                where: { bookingId: id },
            })

            // Actually, better approach: Recalculate total price from scratch based on new state
            // But we need to know the base price of the stay.

            let supplementsPrice = 0
            const newBookingSupplements = []

            for (const supp of supplements) {
                const supplement = await prisma.supplement.findUnique({
                    where: { id: supp.id },
                })
                if (supplement) {
                    supplementsPrice += supplement.price * (supp.quantity || 1)
                    newBookingSupplements.push({
                        supplementId: supplement.id,
                        quantity: supp.quantity || 1,
                    })
                }
            }

            // Update supplements relation
            updatedData.supplements = {
                create: newBookingSupplements
            }

            // Recalculate total price: (Nights * BasePrice) + NewSupplementsPrice
            const currentStart = updatedData.startDate || booking.startDate
            const currentEnd = updatedData.endDate || booking.endDate
            const nights = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24))

            newTotalPrice = (nights * booking.stay.basePrice) + supplementsPrice
        }

        updatedData.totalPrice = newTotalPrice

        // 5. Update Booking
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: updatedData,
            include: { supplements: { include: { supplement: true } } },
        })

        return NextResponse.json(updatedBooking)

    } catch (error) {
        console.error('Error updating booking:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
