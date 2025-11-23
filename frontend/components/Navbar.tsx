import Link from 'next/link'
import { Button } from './ui/Button'
import { Menu } from 'lucide-react'

export function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold font-serif text-[#1a1a1a]">
                            Rene<span className="text-[#c9a227]">Oltra</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-600 hover:text-[#c9a227] transition-colors">
                            Accueil
                        </Link>
                        <Link href="/hebergements" className="text-gray-600 hover:text-[#c9a227] transition-colors">
                            Hébergements
                        </Link>
                        <Link href="/services" className="text-gray-700 hover:text-primary transition-colors">
                            Services
                        </Link>
                        <Link href="/contact" className="text-gray-700 hover:text-primary transition-colors">
                            Contact
                        </Link>
                        <Link href="/mes-reservations" className="text-gray-700 hover:text-primary transition-colors">
                            Mes Réservations
                        </Link>
                        <Link href="/admin" className="text-gray-700 hover:text-primary transition-colors font-medium">
                            Admin
                        </Link>
                        <Link href="/hebergements">
                            <Button>Réserver</Button>
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <Button variant="ghost" size="sm">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
