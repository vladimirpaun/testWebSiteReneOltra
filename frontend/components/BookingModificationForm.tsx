'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Loader2, Calendar, ShoppingBag, Ban } from 'lucide-react'

interface BookingModificationFormProps {
    booking: any
    allSupplements: any[]
}

export default function BookingModificationForm({ booking, allSupplements }: BookingModificationFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const isLocked = booking.status === 'CANCELLED'

    // State for modifications
    const [startDate, setStartDate] = useState(new Date(booking.startDate).toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(new Date(booking.endDate).toISOString().split('T')[0])
    const [guests, setGuests] = useState(booking.stay.capacity.toString()) // Default to max capacity or current? Assuming current isn't stored explicitly in booking but inferred.
    // Actually booking doesn't store guest count in our schema, only User details. 
    // But the API requirement mentions 'friends' change. 
    // For this demo, let's assume we just validate capacity against the stay.

    const [selectedSupplements, setSelectedSupplements] = useState<Record<string, number>>(
        booking.supplements.reduce((acc: any, curr: any) => ({
            ...acc,
            [curr.supplementId]: curr.quantity
        }), {})
    )

    const handleUpdateDates = async () => {
        if (isLocked) {
            setMessage({ type: 'error', text: 'Cette réservation est annulée. Les modifications sont désactivées.' })
            return
        }
        setLoading(true)
        setMessage(null)
        try {
            const res = await fetch(`/api/booking/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    changeType: 'stay',
                    startDate,
                    endDate
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erreur lors de la mise à jour')
            }

            setMessage({ type: 'success', text: 'Dates modifiées avec succès !' })
            router.refresh()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateSupplements = async () => {
        if (isLocked) {
            setMessage({ type: 'error', text: 'Cette réservation est annulée. Les modifications sont désactivées.' })
            return
        }
        setLoading(true)
        setMessage(null)
        try {
            const supplementsList = Object.entries(selectedSupplements)
                .filter(([_, qty]) => qty > 0)
                .map(([id, qty]) => ({ id, quantity: qty }))

            const res = await fetch(`/api/booking/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    changeType: 'rubrics',
                    supplements: supplementsList
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erreur lors de la mise à jour')
            }

            setMessage({ type: 'success', text: 'Options modifiées avec succès !' })
            router.refresh()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setLoading(false)
        }
    }

    const handleCancelBooking = async () => {
        const confirmCancel = confirm('Confirmer l’annulation de cette réservation ?')
        if (!confirmCancel) return

        setLoading(true)
        setMessage(null)
        try {
            const res = await fetch(`/api/booking/${booking.id}/cancel`, {
                method: 'POST'
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erreur lors de l’annulation')
            }

            setMessage({ type: 'success', text: 'Réservation annulée.' })
            router.refresh()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setLoading(false)
        }
    }

    const updateSupplementQuantity = (id: string, delta: number) => {
        setSelectedSupplements(prev => {
            const current = prev[id] || 0
            const next = Math.max(0, current + delta)
            return { ...prev, [id]: next }
        })
    }

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            {isLocked && (
                <div className="p-4 rounded-lg bg-amber-50 text-amber-800 border border-amber-100">
                    Réservation annulée : modification des dates et options désactivée.
                </div>
            )}

            {/* Dates Modification */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-primary h-6 w-6" />
                    <h2 className="text-xl font-serif font-bold">Modifier les dates</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                        label="Arrivée"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isLocked}
                    />
                    <Input
                        label="Départ"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isLocked}
                    />
                </div>
                <Button onClick={handleUpdateDates} disabled={loading || isLocked} className="w-full">
                    {loading ? <Loader2 className="animate-spin" /> : 'Mettre à jour les dates'}
                </Button>
            </Card>

            {/* Supplements Modification */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <ShoppingBag className="text-primary h-6 w-6" />
                    <h2 className="text-xl font-serif font-bold">Modifier les options</h2>
                </div>
                <div className="space-y-4 mb-6">
                    {allSupplements.map((supp) => (
                        <div key={supp.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div>
                                <p className="font-medium">{supp.name}</p>
                                <p className="text-sm text-gray-500">{supp.price} € / unité</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateSupplementQuantity(supp.id, -1)}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                    disabled={isLocked}
                                >-</button>
                                <span className="w-4 text-center">{selectedSupplements[supp.id] || 0}</span>
                                <button
                                    onClick={() => updateSupplementQuantity(supp.id, 1)}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                    disabled={isLocked}
                                >+</button>
                            </div>
                        </div>
                    ))}
                </div>
                <Button onClick={handleUpdateSupplements} disabled={loading || isLocked} className="w-full">
                    {loading ? <Loader2 className="animate-spin" /> : 'Mettre à jour les options'}
                </Button>
            </Card>

            {/* Cancel Booking */}
            <Card className="p-6 border-red-100">
                <div className="flex items-center gap-3 mb-4 text-red-700">
                    <Ban className="h-6 w-6" />
                    <h2 className="text-xl font-serif font-bold">Annuler la réservation</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    L’annulation marquera la réservation comme annulée. Cette action est irréversible.
                </p>
                <Button
                    variant="secondary"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    onClick={handleCancelBooking}
                    disabled={loading || isLocked}
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {isLocked ? 'Réservation déjà annulée' : 'Annuler ma réservation'}
                </Button>
            </Card>
        </div>
    )
}
