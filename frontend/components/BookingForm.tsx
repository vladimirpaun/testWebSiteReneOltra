'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Loader2 } from 'lucide-react'

interface Supplement {
    id: string
    name: string
    price: number
    type: string
}

interface BookingFormProps {
    stay: any
    supplements: Supplement[]
    searchParams: {
        startDate: string
        endDate: string
        guests: string
    }
}

export function BookingForm({ stay, supplements, searchParams }: BookingFormProps) {
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Supplements, 2: Details, 3: Payment/Confirm
    const [selectedSupplements, setSelectedSupplements] = useState<Record<string, number>>({})
    const [guestDetails, setGuestDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
    })
    const [loading, setLoading] = useState(false)

    const startDate = new Date(searchParams.startDate)
    const endDate = new Date(searchParams.endDate)
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const stayTotal = stay.basePrice * nights

    const supplementsTotal = Object.entries(selectedSupplements).reduce((acc, [id, qty]) => {
        const supp = supplements.find(s => s.id === id)
        return acc + (supp ? supp.price * qty : 0)
    }, 0)

    const totalPrice = stayTotal + supplementsTotal

    const handleSupplementChange = (id: string, qty: number) => {
        setSelectedSupplements(prev => ({
            ...prev,
            [id]: qty
        }))
    }

    const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGuestDetails(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stayId: stay.id,
                    startDate: searchParams.startDate,
                    endDate: searchParams.endDate,
                    guestDetails,
                    supplements: Object.entries(selectedSupplements)
                        .filter(([_, qty]) => qty > 0)
                        .map(([id, qty]) => ({ id, quantity: qty })),
                    totalPrice
                })
            })

            if (!res.ok) throw new Error('Booking failed')

            const booking = await res.json()
            // Redirect to confirmation page (or show success message)
            alert('Réservation confirmée ! ID: ' + booking.id)
            router.push('/')
        } catch (error) {
            console.error(error)
            alert('Une erreur est survenue.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column: Steps */}
            <div className="lg:col-span-2 space-y-8">
                {step === 1 && (
                    <Card className="p-6">
                        <h2 className="text-2xl font-serif font-bold mb-6">Options & Suppléments</h2>
                        <div className="space-y-4">
                            {supplements.map(supp => (
                                <div key={supp.id} className="flex justify-between items-center p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">{supp.name}</h3>
                                        <p className="text-gray-500">{supp.price}€ / unité</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleSupplementChange(supp.id, Math.max(0, (selectedSupplements[supp.id] || 0) - 1))}
                                        >
                                            -
                                        </Button>
                                        <span className="w-8 text-center">{selectedSupplements[supp.id] || 0}</span>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleSupplementChange(supp.id, (selectedSupplements[supp.id] || 0) + 1)}
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button onClick={() => setStep(2)} className="w-full sm:w-auto">Continuer</Button>
                        </div>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="p-6">
                        <h2 className="text-2xl font-serif font-bold mb-6">Vos Coordonnées</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Prénom" name="firstName" value={guestDetails.firstName} onChange={handleGuestChange} required />
                            <Input label="Nom" name="lastName" value={guestDetails.lastName} onChange={handleGuestChange} required />
                            <Input label="Email" type="email" name="email" value={guestDetails.email} onChange={handleGuestChange} required />
                            <Input label="Téléphone" type="tel" name="phone" value={guestDetails.phone} onChange={handleGuestChange} required />
                            <Input label="Adresse" name="address" value={guestDetails.address} onChange={handleGuestChange} className="md:col-span-2" />
                            <Input label="Ville" name="city" value={guestDetails.city} onChange={handleGuestChange} />
                            <Input label="Pays" name="country" value={guestDetails.country} onChange={handleGuestChange} />
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between">
                            <Button variant="secondary" onClick={() => setStep(1)} className="w-full sm:w-auto">Retour</Button>
                            <Button onClick={() => setStep(3)} className="w-full sm:w-auto">Continuer vers le paiement</Button>
                        </div>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="p-6">
                        <h2 className="text-2xl font-serif font-bold mb-6">Paiement</h2>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <p className="text-sm text-gray-600 mb-2">Simulation de paiement sécurisé</p>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-5 bg-gray-300 rounded"></div>
                                <div className="w-8 h-5 bg-gray-300 rounded"></div>
                                <div className="w-8 h-5 bg-gray-300 rounded"></div>
                            </div>
                            <Input label="Numéro de carte (Simulé)" placeholder="0000 0000 0000 0000" disabled />
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between">
                            <Button variant="secondary" onClick={() => setStep(2)} className="w-full sm:w-auto">Retour</Button>
                            <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Payer et Réserver ({totalPrice}€)
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-1">
                <Card className="p-6 lg:sticky top-24">
                    <h3 className="text-xl font-serif font-bold mb-4">Récapitulatif</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Hébergement ({nights} nuits)</span>
                            <span className="font-semibold">{stayTotal}€</span>
                        </div>
                        {Object.entries(selectedSupplements).map(([id, qty]) => {
                            if (qty === 0) return null
                            const supp = supplements.find(s => s.id === id)
                            return (
                                <div key={id} className="flex justify-between">
                                    <span className="text-gray-600">{supp?.name} x{qty}</span>
                                    <span className="font-semibold">{supp ? supp.price * qty : 0}€</span>
                                </div>
                            )
                        })}
                        <div className="border-t pt-4 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-[#c9a227]">{totalPrice}€</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
