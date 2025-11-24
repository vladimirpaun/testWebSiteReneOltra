import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { idOrder, paymentType, value, payment } = body

        // Validate required fields
        if (!idOrder || !value) {
            return NextResponse.json(
                { error: 'idOrder and value are required' },
                { status: 400 }
            )
        }

        const booking = await prisma.booking.findUnique({
            where: { id: idOrder }
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            )
        }

        // Simulate payment processing
        // In a real app, we would integrate with a payment gateway here using 'payment' details.

        // Update booking status to CONFIRMED if it was PENDING
        if (booking.status === 'PENDING') {
            await prisma.booking.update({
                where: { id: idOrder },
                data: { status: 'CONFIRMED' }
            })
        }

        // Generate a fake payment ID
        const idPayment = `P${new Date().getFullYear()}${Math.floor(Math.random() * 1000000)}`

        return NextResponse.json({
            result: {
                error: 0,
                messError: null,
                idPayment: idPayment,
                idUser: booking.userId, // Assuming userId is what's expected
                paymentValue: parseFloat(value)
            }
        })

    } catch (error) {
        console.error('Error processing payment:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const idOrder = searchParams.get('idOrder')

    if (!idOrder) {
        return NextResponse.json(
            { error: 'idOrder is required' },
            { status: 400 }
        )
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: idOrder },
            include: {
                stay: true,
                supplements: { include: { supplement: true } },
                user: true
            }
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            )
        }

        // Map to cpg_PaymentStatus response structure
        return NextResponse.json({
            result: {
                error: 0,
                messError: null,
                idUser: booking.userId,
                status: booking.status === 'CONFIRMED' ? 10 : (booking.status === 'CANCELLED' ? 90 : 0), // Example status codes
                balance: 0.0, // Assuming fully paid for simplicity
                libcateg: booking.stay.name,
                begin: booking.startDate,
                end: booking.endDate,
                lastName: booking.user.lastName || '',
                firstName: booking.user.firstName || '',
                price: booking.totalPrice,
                email: booking.user.email,
                // Add other fields as needed
            }
        })

    } catch (error) {
        console.error('Error fetching payment status:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
