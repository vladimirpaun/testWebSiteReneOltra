import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { stayId, startDate, endDate, guestDetails, supplements, totalPrice } = body

        // Simple validation
        if (!stayId || !startDate || !endDate || !guestDetails) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create or find user (simplified logic for now)
        // In a real app, we'd handle authentication properly
        let user = await prisma.user.findUnique({
            where: { email: guestDetails.email },
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: guestDetails.email,
                    password: 'hashed_password_placeholder', // In real app, hash this!
                    firstName: guestDetails.firstName,
                    lastName: guestDetails.lastName,
                    phone: guestDetails.phone,
                    address: guestDetails.address,
                    city: guestDetails.city,
                    country: guestDetails.country,
                },
            })
        }

        // Create Booking
        const booking = await prisma.booking.create({
            data: {
                userId: user.id,
                stayId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: 'CONFIRMED', // Auto-confirm for demo
                totalPrice,
                supplements: {
                    create: supplements.map((s: any) => ({
                        supplementId: s.id,
                        quantity: s.quantity,
                    })),
                },
            },
            include: {
                stay: true,
                supplements: {
                    include: {
                        supplement: true,
                    },
                },
            },
        })

        return NextResponse.json(booking)
    } catch (error) {
        console.error('Error creating booking:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || searchParams.get('email') || searchParams.get('ref')

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    try {
        // If the query looks like an email, search by email; otherwise treat it as a booking reference.
        const looksLikeEmail = query.includes('@')

        if (looksLikeEmail) {
            const user = await prisma.user.findUnique({
                where: { email: query },
                include: {
                    bookings: {
                        include: {
                            stay: true,
                            supplements: {
                                include: { supplement: true }
                            }
                        },
                        orderBy: { startDate: 'desc' }
                    }
                }
            })

            if (!user) {
                return NextResponse.json([], { status: 200 })
            }

            return NextResponse.json(user.bookings)
        }

        // Search by booking id/reference
        const booking = await prisma.booking.findUnique({
            where: { id: query },
            include: {
                stay: true,
                supplements: {
                    include: { supplement: true }
                }
            }
        })

        if (!booking) {
            return NextResponse.json([], { status: 200 })
        }

        return NextResponse.json([booking])
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
