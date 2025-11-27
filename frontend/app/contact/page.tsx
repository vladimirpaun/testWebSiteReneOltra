import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-serif font-bold mb-4">Contactez-nous</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Une question ? Une demande particulière ? Notre équipe est à votre disposition.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <h3 className="text-xl font-bold mb-6">Nos Coordonnées</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="h-6 w-6 text-[#c9a227] mt-1" />
                                    <div>
                                        <p className="font-semibold">Adresse</p>
                                        <p className="text-gray-600">123 Avenue de la Plage<br />34000 Montpellier, France</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="h-6 w-6 text-[#c9a227] mt-1" />
                                    <div>
                                        <p className="font-semibold">Téléphone</p>
                                        <p className="text-gray-600">+33 4 12 34 56 78</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Mail className="h-6 w-6 text-[#c9a227] mt-1" />
                                    <div>
                                        <p className="font-semibold">Email</p>
                                        <p className="text-gray-600">contact@reneoltra.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-200 h-64 rounded-xl flex items-center justify-center text-gray-500">
                            Carte Google Maps (Simulée)
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <h3 className="text-xl font-bold mb-6">Envoyez-nous un message</h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Prénom" placeholder="Jean" />
                                <Input label="Nom" placeholder="Dupont" />
                            </div>
                            <Input label="Email" type="email" placeholder="jean.dupont@example.com" />
                            <Input label="Sujet" placeholder="Demande d'information" />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c9a227] focus:border-transparent outline-none transition-all h-32"
                                    placeholder="Votre message..."
                                ></textarea>
                            </div>
                            <Button className="w-full">Envoyer le message</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
