'use client'

import React from 'react'

interface MapFiltersProps {
    currentFilter: string
    onFilterChange: (filter: string) => void
}

const FILTERS = ['all', 'Standard', 'Confort', 'Grand Confort', 'Premium', 'Plage', 'Cottage']

export function MapFilters({ currentFilter, onFilterChange }: MapFiltersProps) {
    return (
        <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-xl shadow-xl flex gap-2 overflow-x-auto max-w-[90vw] md:max-w-none">
            {FILTERS.map(f => (
                <button
                    key={f}
                    onClick={() => onFilterChange(f)}
                    className={`
                        px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shadow-sm
                        ${currentFilter === f
                            ? 'bg-[#005c99] text-white font-medium shadow-blue-500/30'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }
                    `}
                >
                    {f === 'all' ? 'Tout voir' : f}
                </button>
            ))}
        </div>
    )
}
