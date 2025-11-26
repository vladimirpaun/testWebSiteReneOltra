'use client'

import React from 'react'
import Link from 'next/link'
import { X, Info, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Stay {
    id: string
    name: string
    type: string
    category: string
    price: number
    surface: number
    features: string[]
    zoneId: string | null
    number: number | null
}

interface MapSidebarProps {
    stay: Stay | null
    isOpen: boolean
    onClose: () => void
    searchParams: {
        startDate: string
        endDate: string
        guests: string
    }
}

export function MapSidebar({ stay, isOpen, onClose, searchParams }: MapSidebarProps) {
    const sidebarClass = isOpen && stay ? 'translate-x-0' : 'translate-x-full'

    if (!stay) {
        return (
            <div className={`fixed md:absolute right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 border-l border-slate-100 ${sidebarClass}`}>
            </div>
        )
    }

    return (
        <div className={`fixed md:absolute right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 border-l border-slate-100 ${sidebarClass}`}>
            <div className="flex flex-col h-full">
                {/* Header Panel */}
                <div className="relative h-48 bg-slate-200">
                    <img
                        src="/images/emplacement.jpg" // Default image for now
                        alt="Vue de l'emplacement"
                        className="w-full h-full object-cover"
                    />
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors shadow-lg"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                        <div className="text-white text-xs font-bold uppercase tracking-wider mb-1">
                            {stay.category}
                        </div>
                        <h2 className="text-white text-2xl font-bold">
                            {stay.name}
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">

                    <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-6">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Prix par nuit</p>
                            <p className="text-3xl font-bold text-[#005c99]">{stay.price}€</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                Disponible
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4 text-[#005c99]" />
                                Caractéristiques
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex justify-between text-sm">
                                    <span className="text-slate-500">Surface</span>
                                    <span className="font-medium text-slate-800">{stay.surface}m²</span>
                                </li>
                                <li className="flex justify-between text-sm">
                                    <span className="text-slate-500">Sol</span>
                                    <span className="font-medium text-slate-800">Sable / Herbe</span>
                                </li>
                                <li className="flex justify-between text-sm">
                                    <span className="text-slate-500">Exposition</span>
                                    <span className="font-medium text-slate-800">Ensoleillé</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-800 mb-3">Équipements inclus</h3>
                            <div className="flex flex-wrap gap-2">
                                {stay.features.map(feat => (
                                    <span key={feat} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-md border border-slate-200">
                                        {feat}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800">
                            <p className="font-bold mb-1">Note importante</p>
                            <p>L'arrivée se fait à partir de 14h. Le départ avant 11h. Carte nominative René Oltra obligatoire.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                    <Link
                        href={`/hebergements/${stay.id}?startDate=${searchParams.startDate}&endDate=${searchParams.endDate}&guests=${searchParams.guests}`}
                        className="w-full bg-[#005c99] text-white font-bold py-4 rounded-xl text-lg hover:bg-[#004a7a] transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                    >
                        <span>Réserver maintenant</span>
                        <CheckCircle className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
