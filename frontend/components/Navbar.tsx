"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Button } from './ui/Button'
import { Menu, X } from 'lucide-react'

export function Navbar() {
    const [open, setOpen] = useState(false)

    const navLinks = [
        { href: '/', label: 'Accueil' },
        { href: '/hebergements', label: 'Hébergements' },
        { href: '/services', label: 'Services' },
        { href: '/contact', label: 'Contact' },
        { href: '/mes-reservations', label: 'Mes Réservations' },
        { href: '/admin', label: 'Admin' },
    ]

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 sm:h-20 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold font-serif text-[#1a1a1a]">
                            Rene<span className="text-[#c9a227]">Oltra</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-600 hover:text-[#c9a227] transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/hebergements">
                            <Button>Réserver</Button>
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <Button variant="ghost" size="sm" onClick={() => setOpen(prev => !prev)} aria-label="Ouvrir le menu">
                            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            <div
                className={`md:hidden bg-white border-t border-gray-100 shadow-sm transition-all duration-200 ${
                    open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
            >
                <div className="px-4 py-3 space-y-4">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="block text-gray-700 font-medium"
                            onClick={() => setOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/hebergements" onClick={() => setOpen(false)}>
                        <Button className="w-full">Réserver</Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
