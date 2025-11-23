import { prisma } from '@/lib/prisma'
import { BookingForm } from '@/components/BookingForm'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{
        startDate: string
        endDate: string
        guests: string
    }>
}

async function getStay(id: string) {
    const stay = await prisma.stay.findUnique({
        where: { id },
    })
    return stay
}

async function getSupplements() {
    const supplements = await prisma.supplement.findMany()
    return supplements
}

export default async function StayDetailsPage(props: PageProps) {
    const params = await props.params
    const searchParams = await props.searchParams

    const stay = await getStay(params.id)
    const supplements = await getSupplements()

    if (!stay) {
        notFound()
    }

    const images = JSON.parse(stay.images || '[]')
    const imageUrl = images[0] || 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80'

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Hero Image */}
            <div className="h-[40vh] relative">
                <img
                    src={imageUrl}
                    alt={stay.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">{stay.name}</h1>
                    <p className="text-xl opacity-90">{stay.type} • {stay.capacity} Personnes</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <BookingForm
                    stay={stay}
                    supplements={supplements}
                    searchParams={searchParams}
                />
            </div>
        </div>
    )
}
