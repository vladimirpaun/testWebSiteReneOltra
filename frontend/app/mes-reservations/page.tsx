'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function MyBookingsPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [bookings, setBookings] = useState<any[]>([])
    const router = useRouter()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setBookings([])

        try {
            // In a real app, this would be an authenticated endpoint.
            // For this demo, we'll fetch all bookings for the email.
            // We need to create a new endpoint or use existing one with filter.
            // Let's assume we create a GET endpoint for this.
            // For now, let's mock it or use a server action if we were using them.
            // We will implement a simple GET /api/booking?email=...

            const res = await fetch(`/api/booking?email=${encodeURIComponent(email)}`)
            if (!res.ok) {
                if (res.status === 404) throw new Error('Aucune réservation trouvée pour cet email.')
                throw new Error('Erreur lors de la recherche.')
            }
            const data = await res.json()
            setBookings(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-serif font-bold mb-8 text-center">Mes Réservations</h1>

                <Card className="p-6 mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Input
                                label="Email utilisé lors de la réservation"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemple@email.com"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Rechercher'}
                        </Button>
                    </form>
                </Card>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <Card key={booking.id} className="p-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-serif font-bold text-lg">{booking.stay.name}</h3>
                                <p className="text-gray-600">
                                    Du {new Date(booking.startDate).toLocaleDateString()} au {new Date(booking.endDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Statut: <span className="font-medium text-primary">{booking.status}</span>
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => router.push(`/mes-reservations/${booking.id}`)}>
                                Modifier
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
