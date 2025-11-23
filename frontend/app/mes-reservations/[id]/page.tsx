import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BookingModificationForm from '@/components/BookingModificationForm'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getBooking(id: string) {
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            stay: true,
            supplements: {
                include: { supplement: true }
            }
        }
    })
    return booking
}

async function getSupplements() {
    return await prisma.supplement.findMany()
}

export default async function BookingDetailsPage(props: PageProps) {
    const params = await props.params
    const booking = await getBooking(params.id)
    const allSupplements = await getSupplements()

    if (!booking) {
        notFound()
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold mb-2">Modifier ma réservation</h1>
                    <p className="text-gray-600">Référence: {booking.id}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <BookingModificationForm
                            booking={booking}
                            allSupplements={allSupplements}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-8">
                            <h3 className="font-serif font-bold text-xl mb-4">Récapitulatif actuel</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Hébergement</p>
                                    <p className="font-medium">{booking.stay.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Dates</p>
                                    <p className="font-medium">
                                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Prix Total</p>
                                    <p className="font-bold text-xl text-primary">{booking.totalPrice} €</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
