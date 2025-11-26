import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, CreditCard, Settings } from 'lucide-react'

export default function AdminDashboard() {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-serif font-bold mb-8 text-gray-900">Tableau de Bord Administrateur</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Réservations</p>
                            <p className="text-2xl font-bold">Gérer</p>
                        </div>
                        <Link href="/admin/bookings" className="ml-auto">
                            <Button variant="outline" size="sm">Voir</Button>
                        </Link>
                    </Card>

                    <Card className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Clients</p>
                            <p className="text-2xl font-bold">Gérer</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto" disabled>Bientôt</Button>
                    </Card>

                    <Card className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Paiements</p>
                            <p className="text-2xl font-bold">Suivi</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto" disabled>Bientôt</Button>
                    </Card>

                    <Card className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                            <Settings className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Paramètres</p>
                            <p className="text-2xl font-bold">Config</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto" disabled>Bientôt</Button>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4">Activité Récente</h2>
                        <p className="text-gray-500 italic">Aucune activité récente.</p>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4">Statistiques Rapides</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Taux d'occupation</span>
                                <span className="font-bold">0%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Revenu mensuel</span>
                                <span className="font-bold">0 €</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
