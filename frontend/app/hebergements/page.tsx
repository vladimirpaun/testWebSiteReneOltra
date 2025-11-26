'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { StayCard } from '@/components/StayCard'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { CampingMap } from '@/components/map/CampingMap'
import { MapSidebar } from '@/components/map/MapSidebar'
import { MapFilters } from '@/components/map/MapFilters'

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

    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
    const [stays, setStays] = useState<Stay[]>([])
    const [mapStays, setMapStays] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Map State
    const [selectedStay, setSelectedStay] = useState<any>(null)
    const [mapFilter, setMapFilter] = useState('all')

    useEffect(() => {
        const fetchStays = async () => {
            setLoading(true)
            try {
                // Fetch List Data
                const res = await fetch(`/api/availability?startDate=${startDate}&endDate=${endDate}&guests=${guests}`)
                if (!res.ok) throw new Error('Failed to fetch availability')
                const data = await res.json()
                setStays(data)

                // Fetch Map Data (we could optimize to only fetch when map is opened, but for now fetch both or lazy load)
                const mapRes = await fetch(`/api/map-availability?startDate=${startDate}&endDate=${endDate}&guests=${guests}`)
                if (mapRes.ok) {
                    const mapData = await mapRes.json()
                    setMapStays(mapData)
                }
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
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Header / Toggle Bar */}
            <div className="bg-white shadow-sm z-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-slate-800">Résultats de votre recherche</h1>
                        <p className="text-sm text-gray-500">
                            Du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')} • {guests} Voyageurs
                        </p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                                ? 'bg-white text-[#005c99] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Liste
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'map'
                                ? 'bg-white text-[#005c99] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Carte Interactive
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
                {viewMode === 'list' ? (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                ) : (
                    /* MAP VIEW */
                    <div className="absolute inset-0 flex flex-col h-[calc(100vh-140px)]">
                        {/* Note: h-screen minus header height approx */}
                        <div className="relative flex-1 flex overflow-hidden">
                            <MapFilters
                                currentFilter={mapFilter}
                                onFilterChange={setMapFilter}
                            />
                            <CampingMap
                                stays={mapStays}
                                selectedStayId={selectedStay?.id || null}
                                onSelectStay={setSelectedStay}
                                filter={mapFilter}
                            />
                            <MapSidebar
                                stay={selectedStay}
                                isOpen={!!selectedStay}
                                onClose={() => setSelectedStay(null)}
                                searchParams={{ startDate, endDate, guests }}
                            />
                        </div>
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
