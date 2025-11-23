'use client'

import { useState, useEffect, use } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Loader2, ArrowLeft, XCircle, CheckCircle, AlertTriangle, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminBookingDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params)
    const [booking, setBooking] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                // We can reuse the public API or create a specific admin one. 
                // Using the public one for simplicity as it returns what we need.
                // Actually, the public one fetches by email or specific ID if authorized.
                // Let's use the admin list API and filter, or better, fetch directly if we had a specific endpoint.
                // But wait, I didn't create a specific GET /api/admin/bookings/[id].
                // I can use the public GET /api/booking/[id] if I didn't add auth checks that block admin.
                // My public GET /api/booking/[id] is actually a PUT (modification).
                // I need a way to fetch single booking details.
                // I'll add a GET method to /api/booking/[id] or just use the list and find (inefficient but works for demo).
                // Better: Add GET to /api/booking/[id]/route.ts.

                // Let's try fetching from the list first for speed, as I implemented GET /api/admin/bookings
                const res = await fetch('/api/admin/bookings')
                if (res.ok) {
                    const data = await res.json()
                    const found = data.find((b: any) => b.id === params.id)
                    if (found) setBooking(found)
                    else setMessage({ type: 'error', text: 'Réservation non trouvée' })
                }
            } catch (error) {
                console.error('Error fetching booking:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchBooking()
    }, [params.id])

    const handleCancel = async () => {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return

        setProcessing(true)
        setMessage(null)

        try {
            const res = await fetch(`/api/booking/${params.id}/cancel`, {
                method: 'POST'
            })

            if (!res.ok) throw new Error('Erreur lors de l\'annulation')

            setMessage({ type: 'success', text: 'Réservation annulée avec succès' })
            // Refresh local state
            setBooking((prev: any) => ({ ...prev, status: 'CANCELLED' }))
        } catch (error) {
            setMessage({ type: 'error', text: 'Impossible d\'annuler la réservation' })
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-gray-500">Réservation introuvable</p>
                <Link href="/admin/bookings">
                    <Button variant="outline">Retour à la liste</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/admin/bookings" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à la liste
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Détails de la Réservation</h1>
                            <p className="text-gray-500">Réf: {booking.id}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-bold text-sm
                            ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'}`}>
                            {booking.status}
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Client
                        </h2>
                        <div className="space-y-2">
                            <p><span className="font-medium">Nom:</span> {booking.user.name}</p>
                            <p><span className="font-medium">Email:</span> {booking.user.email}</p>
                            <p><span className="font-medium">Téléphone:</span> {booking.user.phone || 'N/A'}</p>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-primary" />
                            Séjour
                        </h2>
                        <div className="space-y-2">
                            <p><span className="font-medium">Hébergement:</span> {booking.stay.name}</p>
                            <p><span className="font-medium">Arrivée:</span> {new Date(booking.startDate).toLocaleDateString()}</p>
                            <p><span className="font-medium">Départ:</span> {new Date(booking.endDate).toLocaleDateString()}</p>
                            <p><span className="font-medium">Prix Total:</span> {booking.totalPrice} €</p>
                        </div>
                    </Card>
                </div>

                <Card className="p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">Suppléments</h2>
                    {booking.supplements.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                            {booking.supplements.map((bs: any) => (
                                <li key={bs.id}>
                                    {bs.supplement.name} (x{bs.quantity}) - {bs.supplement.price * bs.quantity} €
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">Aucun supplément sélectionné.</p>
                    )}
                </Card>

                <div className="flex justify-end gap-4">
                    {booking.status !== 'CANCELLED' && (
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            {processing ? <Loader2 className="animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            Annuler la réservation
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
