import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: params.id }
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Réservation non trouvée' },
                { status: 404 }
            )
        }

        // Update status to CANCELLED
        const updatedBooking = await prisma.booking.update({
            where: { id: params.id },
            data: {
                status: 'CANCELLED'
            }
        })

        return NextResponse.json({
            success: true,
            booking: updatedBooking,
            message: 'Réservation annulée avec succès'
        })

    } catch (error) {
        console.error('Error cancelling booking:', error)
        return NextResponse.json(
            { error: 'Erreur lors de l\'annulation' },
            { status: 500 }
        )
    }
}
