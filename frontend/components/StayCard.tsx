import Link from 'next/link'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Users, Maximize, Bed, Bath } from 'lucide-react'

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

interface StayCardProps {
    stay: Stay
    searchParams: {
        startDate: string
        endDate: string
        guests: string
    }
}

export function StayCard({ stay, searchParams }: StayCardProps) {
    const images = JSON.parse(stay.images || '[]')
    const imageUrl = images[0] || 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80'

    return (
        <Card className="flex flex-col md:flex-row h-full md:h-64 transition-transform hover:-translate-y-1 duration-300">
            <div className="md:w-1/3 relative h-48 md:h-full">
                <img
                    src={imageUrl}
                    alt={stay.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#c9a227] text-white px-3 py-1 text-sm font-semibold rounded-full">
                    {stay.type}
                </div>
            </div>

            <div className="p-6 flex flex-col justify-between flex-grow md:w-2/3">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold font-serif">{stay.name}</h3>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-[#c9a227]">{stay.basePrice}€</span>
                            <span className="text-sm text-gray-500 block">/ nuit</span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{stay.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{stay.capacity} Pers.</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Maximize className="h-4 w-4" />
                            <span>{stay.surface} m²</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{stay.rooms} Ch.</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{stay.bathrooms} Sdb.</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Link
                        href={`/hebergements/${stay.id}?startDate=${searchParams.startDate}&endDate=${searchParams.endDate}&guests=${searchParams.guests}`}
                    >
                        <Button size="sm">
                            Voir les détails
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    )
}
