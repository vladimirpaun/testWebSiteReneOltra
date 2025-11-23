import { Wifi, Car, Coffee, Utensils, Waves, Trees } from 'lucide-react'

export default function ServicesPage() {
    const services = [
        { icon: Wifi, title: 'Wi-Fi Haut Débit', description: 'Restez connecté partout dans le camping grâce à notre fibre optique.' },
        { icon: Car, title: 'Parking Sécurisé', description: 'Un emplacement de parking surveillé est inclus avec chaque réservation.' },
        { icon: Waves, title: 'Piscine Chauffée', description: 'Profitez de notre espace aquatique avec piscine chauffée et jacuzzi.' },
        { icon: Utensils, title: 'Restaurant Gastronomique', description: 'Découvrez les saveurs locales dans notre restaurant étoilé.' },
        { icon: Coffee, title: 'Petit-déjeuner', description: 'Service de petit-déjeuner frais livré directement à votre hébergement.' },
        { icon: Trees, title: 'Activités Nature', description: 'Randonnées guidées, location de vélos et sports nautiques.' },
    ]

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-serif font-bold mb-4">Nos Services</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Pour rendre votre séjour inoubliable, nous avons pensé à tout. Profitez d'une gamme complète de services haut de gamme.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-[#c9a227]/10 rounded-lg flex items-center justify-center mb-6">
                                <service.icon className="h-6 w-6 text-[#c9a227]" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                            <p className="text-gray-600">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
