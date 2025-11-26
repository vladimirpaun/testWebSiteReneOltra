'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Sun, Umbrella, XCircle, CheckCircle } from 'lucide-react'
import { ZONES_CONFIG, VILLAGES } from './mapConfig'

interface Stay {
    id: string
    zoneId: string | null
    number: number | null
    status: 'available' | 'occupied'
    price: number
    type: string
    category: string
}

interface CampingMapProps {
    stays: Stay[]
    selectedStayId: string | null
    onSelectStay: (stay: Stay) => void
    filter: string
}

export function CampingMap({ stays, selectedStayId, onSelectStay, filter }: CampingMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!mapRef.current) return
        setIsDragging(true)
        setStartX(e.pageX - mapRef.current.offsetLeft)
        setScrollLeft(mapRef.current.scrollLeft)
    }

    const handleMouseLeave = () => {
        setIsDragging(false)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !mapRef.current) return
        e.preventDefault()
        const x = e.pageX - mapRef.current.offsetLeft
        const walk = (x - startX) * 2 // Scroll speed
        mapRef.current.scrollLeft = scrollLeft - walk
    }

    const getFilteredStays = () => {
        if (filter === 'all') return stays
        return stays.filter(s => s.category.toLowerCase().includes(filter.toLowerCase()))
    }

    const filteredStays = getFilteredStays()
    const zonesInFilter = ZONES_CONFIG.filter(z => filteredStays.some(s => s.zoneId === z.id))
    const villagesInFilter = VILLAGES.filter(v => filteredStays.some(s => s.zoneId === v.id))

    // Helper to find stay data for a specific spot
    const findStay = (zoneId: string, number: number) => {
        return stays.find(s => s.zoneId === zoneId && s.number === number)
    }

    return (
        <div
            ref={mapRef}
            className="flex-1 overflow-auto bg-[#e6f0f5] p-8 pt-20 relative cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
        >
            {/* Legend */}
            <div className="fixed bottom-6 left-6 bg-white p-4 rounded-xl shadow-xl z-10 border border-slate-100 hidden lg:block pointer-events-none">
                <h3 className="text-sm font-bold mb-3 text-slate-500 uppercase tracking-wider">Légende</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm ring-1 ring-emerald-600"></div>
                        <span>Disponible</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-rose-500 opacity-60 shadow-sm"></div>
                        <span className="text-slate-400">Occupé</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-sky-600 ring-2 ring-sky-300 shadow-sm"></div>
                        <span className="font-medium text-sky-700">Votre sélection</span>
                    </div>
                    <div className="flex items-center gap-3 pt-2 mt-2 border-t">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">Zone Premium</span>
                    </div>
                </div>
            </div>

            {/* THE MAP ITSELF */}
            <div className="min-w-[1000px] max-w-5xl mx-auto bg-[#d4e6d8] rounded-3xl p-8 shadow-2xl border-4 border-white/50 relative select-none">

                {/* Title on map */}
                <div className="absolute top-4 right-8 text-emerald-800/20 font-black text-6xl pointer-events-none">
                    PLAN
                </div>

                {/* Top Area: Reception etc */}
                <div className="flex justify-between mb-8">
                    <div className="bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        SORTIE / ACCUEIL
                    </div>
                    <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest">
                        RÉSERVE NATURELLE DU BAGNAS
                    </div>
                </div>

                {/* Rows Generation */}
                <div className="space-y-6">
                    {zonesInFilter.map((zone) => {
                        // Check if this zone has any visible spots in current filter
                        // Actually we should show the zone if it's in zonesInFilter, which is already filtered

                        return (
                            <div key={zone.id} className="relative group">
                                {/* Label de l'allée */}
                                <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#005c99] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10">
                                    {zone.id}
                                </div>

                                {/* La route/allée */}
                                <div className="bg-[#e2e8f0] h-16 rounded-xl flex items-center px-4 relative border-b-2 border-slate-300 shadow-inner">
                                    <span className="absolute left-2 text-slate-300 font-bold text-xs uppercase tracking-widest pointer-events-none">
                                        {zone.label} • {zone.category}
                                    </span>

                                    <div className="flex gap-2 w-full justify-between items-center pl-16">
                                        {Array.from({ length: zone.spots }, (_, i) => i + 1).map((num) => {
                                            const stay = findStay(zone.id, num)
                                            if (!stay) return <div key={num} className="w-8 h-10 opacity-0"></div> // Placeholder if missing

                                            // Filter check: if filter is active and this stay doesn't match, hide or dim?
                                            // The logic above `zonesInFilter` handles hiding entire zones.
                                            // But if we are in a zone that has mixed types (unlikely per config), or if we want to hide specific spots...
                                            // The `getFilteredStays` logic handles the list. If `stay` is not in `filteredStays`, we should probably hide it or show as disabled.
                                            const isVisible = filteredStays.some(s => s.id === stay.id)
                                            if (!isVisible && filter !== 'all') return <div key={num} className="w-8 h-10 opacity-0"></div>

                                            const isSelected = selectedStayId === stay.id
                                            const isOccupied = stay.status === 'occupied'

                                            let buttonClasses = `
                                                relative group/spot w-8 h-10 rounded-md transition-all duration-200 transform hover:scale-110 flex items-center justify-center border
                                                ${isOccupied
                                                    ? 'bg-rose-100 border-rose-200 cursor-not-allowed opacity-60 grayscale'
                                                    : isSelected
                                                        ? 'bg-sky-600 border-sky-700 shadow-lg shadow-sky-200 -translate-y-1 z-10'
                                                        : 'bg-emerald-400 border-emerald-500 hover:bg-emerald-500 hover:shadow-md cursor-pointer'
                                                }
                                            `

                                            return (
                                                <button
                                                    key={stay.id}
                                                    onClick={() => !isOccupied && onSelectStay(stay)}
                                                    disabled={isOccupied}
                                                    className={buttonClasses}
                                                >
                                                    {isOccupied ? (
                                                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                                    ) : isSelected ? (
                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-emerald-900 opacity-70">{stay.number}</span>
                                                    )}

                                                    {/* Tooltip Hover */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/spot:block w-32 bg-slate-800 text-white text-xs rounded-lg p-2 pointer-events-none z-50 text-center shadow-xl">
                                                        <div className="font-bold">N° {stay.number}</div>
                                                        <div className="opacity-80">{stay.price}€ / nuit</div>
                                                        {isOccupied && <div className="text-rose-300 mt-1">Occupé</div>}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Bottom Area: Villages & Mer */}
                <div className="mt-12 grid grid-cols-12 gap-6">
                    {/* Villages area */}
                    <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-orange-50 p-6 rounded-2xl border-2 border-orange-100">
                        <div className="col-span-full text-orange-800 font-bold uppercase text-sm tracking-widest mb-2 flex items-center gap-2">
                            <Umbrella className="w-4 h-4" /> Zone Villages / Cottages
                        </div>
                        {villagesInFilter.map(village => {
                            return (
                                <div key={village.id} className="bg-white p-3 rounded-xl shadow-sm border border-orange-100">
                                    <div className="text-xs font-bold text-orange-600 mb-2">{village.label}</div>
                                    <div className="flex flex-wrap gap-1">
                                        {Array.from({ length: village.spots }, (_, i) => i + 1).map((num) => {
                                            const stay = findStay(village.id, num)
                                            if (!stay) return null

                                            const isVisible = filteredStays.some(s => s.id === stay.id)
                                            if (!isVisible && filter !== 'all') return null

                                            const isSelected = selectedStayId === stay.id
                                            const isOccupied = stay.status === 'occupied'

                                            let buttonClasses = `
                                                w-8 h-8 rounded-full text-[10px] flex items-center justify-center font-bold transition-colors shadow-sm
                                                ${isOccupied
                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                                                    : isSelected
                                                        ? 'bg-sky-600 text-white ring-2 ring-sky-300 shadow-lg'
                                                        : 'bg-orange-200 text-orange-700 hover:bg-orange-300 cursor-pointer'
                                                }
                                            `

                                            return (
                                                <button
                                                    key={stay.id}
                                                    onClick={() => !isOccupied && onSelectStay(stay)}
                                                    disabled={isOccupied}
                                                    className={buttonClasses}
                                                >
                                                    {stay.number}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Sea Area */}
                    <div className="col-span-12 lg:col-span-4 bg-gradient-to-b from-blue-200 to-blue-400 rounded-2xl flex items-center justify-center p-6 text-center shadow-inner h-64 lg:h-auto">
                        <div className="text-white">
                            <h3 className="font-black text-2xl tracking-widest mb-2">PLAGE</h3>
                            <p className="text-blue-100 text-sm">Accès direct mer Méditerranée</p>
                            <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-full p-2 inline-block">
                                <Sun className="w-8 h-8 text-yellow-300 animate-spin-slow" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="h-20"></div> {/* Spacer for scrolling */}
        </div>
    )
}
