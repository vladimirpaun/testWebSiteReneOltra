import Link from 'next/link'
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div>
                        <h3 className="text-2xl font-serif font-bold mb-6">
                            Rene<span className="text-[#c9a227]">Oltra</span>
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            Découvrez le luxe en plein air. Des hébergements d'exception pour des vacances inoubliables.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-[#c9a227]">Liens Rapides</h4>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link></li>
                            <li><Link href="/hebergements" className="text-gray-400 hover:text-white transition-colors">Hébergements</Link></li>
                            <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-[#c9a227]">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-400">
                                <MapPin className="h-5 w-5 text-[#c9a227]" />
                                123 Avenue de la Plage, France
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Phone className="h-5 w-5 text-[#c9a227]" />
                                +33 4 12 34 56 78
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Mail className="h-5 w-5 text-[#c9a227]" />
                                contact@reneoltra.com
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-[#c9a227]">Suivez-nous</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-[#c9a227] transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-[#c9a227] transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} ReneOltra. Tous droits réservés.
                </div>
            </div>
        </footer>
    )
}
