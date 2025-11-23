'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Calendar, Users } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [guests, setGuests] = useState('2')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (startDate && endDate) {
      router.push(`/hebergements?startDate=${startDate}&endDate=${endDate}&guests=${guests}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 leading-tight">
            Évadez-vous en <span className="text-[#c9a227]">Plein Air</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 font-light text-gray-200">
            Découvrez nos hébergements de luxe pour des vacances inoubliables au cœur de la nature.
          </p>

          {/* Search Form */}
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="block text-left text-sm font-medium text-gray-700 mb-1">Arrivée</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c9a227] outline-none text-gray-900"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-left text-sm font-medium text-gray-700 mb-1">Départ</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c9a227] outline-none text-gray-900"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-left text-sm font-medium text-gray-700 mb-1">Voyageurs</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c9a227] outline-none text-gray-900 appearance-none bg-white"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>{num} Pers.</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-1">
                <Button type="submit" className="w-full h-[50px]">
                  Rechercher
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Pourquoi nous choisir ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nous nous engageons à vous offrir une expérience exceptionnelle, alliant confort, nature et services haut de gamme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#c9a227]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Confort Premium</h3>
              <p className="text-gray-600">Des hébergements modernes et tout équipés pour votre plus grand confort.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#c9a227]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Cadre Naturel</h3>
              <p className="text-gray-600">Un environnement préservé entre mer et forêt pour une déconnexion totale.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#c9a227]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Services 5 Étoiles</h3>
              <p className="text-gray-600">Une équipe à votre écoute et des services personnalisés pour un séjour réussi.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
