'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { StayCard } from '@/components/StayCard'
import { Button } from '@/components/ui/Button'
import { Loader2 } from 'lucide-react'

interface Stay {
    id: string
    name: string
    type: string
    capacity: number
    surface: number
    rooms: number
    bathrooms: number
    description: string
    basePrice: number
    images: string
}

function ResultsContent() {
    const searchParams = useSearchParams()
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const guests = searchParams.get('guests') || '1'

    const [stays, setStays] = useState<Stay[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchStays = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/availability?startDate=${startDate}&endDate=${endDate}&guests=${guests}`)
                if (!res.ok) throw new Error('Failed to fetch availability')
                const data = await res.json()
                setStays(data)
            } catch (err) {
                setError('Une erreur est survenue lors de la recherche.')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        if (startDate && endDate) {
            fetchStays()
        } else {
            setLoading(false)
        }
    }, [startDate, endDate, guests])

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-[#c9a227] animate-spin mb-4" />
                <p className="text-gray-500">Recherche des meilleures offres...</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold mb-2">Résultats de votre recherche</h1>
                    <p className="text-gray-600">
                        Du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')} • {guests} Voyageurs
                    </p>
                </div>

                {error ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>Réessayer</Button>
                    </div>
                ) : stays.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500 mb-4">Aucun hébergement disponible pour ces dates.</p>
                        <Button variant="secondary" onClick={() => window.history.back()}>Modifier la recherche</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {stays.map((stay) => (
                            <StayCard
                                key={stay.id}
                                stay={stay}
                                searchParams={{ startDate, endDate, guests }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-[#c9a227] animate-spin mb-4" />
                <p className="text-gray-500">Chargement...</p>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    )
}
