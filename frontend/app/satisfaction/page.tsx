'use client'

import { useState } from 'react'
import { Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export default function SatisfactionPage() {
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState<Record<string, any>>({})

    // Helper for Star Rating
    const StarRating = ({ name, label, value, onChange }: { name: string, label: string, value: number, onChange: (val: number) => void }) => {
        const [hoverVal, setHoverVal] = useState(0)

        return (
            <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">{label}</label>
                <div
                    className="flex items-center space-x-2"
                    onMouseLeave={() => setHoverVal(0)}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverVal(star)}
                            onClick={() => onChange(star)}
                        >
                            <Star
                                className={cn(
                                    "w-8 h-8 transition-colors",
                                    (hoverVal || value) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                )}
                            />
                        </button>
                    ))}
                </div>
                <input type="hidden" name={name} value={value} />
            </div>
        )
    }

    // Helper for Toggle Buttons (Oui/Non)
    const ToggleGroup = ({ label, name, value, onChange, options = [{ label: 'Oui', value: 'oui' }, { label: 'Non', value: 'non' }] }: any) => (
        <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">{label}</label>
            <div className="flex space-x-4">
                {options.map((opt: any) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "px-6 py-2 border rounded-full transition-all duration-300",
                            value === opt.value
                                ? "bg-teal-600 text-white border-teal-600 shadow-md"
                                : "border-gray-300 text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Formulaire envoyé :", formData)
        setSubmitted(true)
    }

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="w-16 h-16 text-teal-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Merci !</h3>
                    <p className="text-gray-600 mb-6">Votre avis a été enregistré avec succès.</p>
                    <Button onClick={() => setSubmitted(false)} variant="outline">
                        Retour
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-sans">
            {/* Header */}
            <header className="bg-teal-700 text-white py-8 shadow-lg">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold mb-2">Camping CHM René Oltra</h1>
                    <p className="text-teal-100 text-lg">Partagez votre expérience</p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* La Réservation */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">La réservation</h2>
                        <StarRating
                            name="reservation_facilite"
                            label="Comment évaluez-vous la facilité du processus de réservation ?"
                            value={formData.reservation_facilite || 0}
                            onChange={(v) => updateField('reservation_facilite', v)}
                        />
                    </Card>

                    {/* La Réception */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">La réception</h2>
                        <StarRating
                            name="reception_accueil"
                            label="Comment évaluez-vous l’accueil à la réception lors de votre arrivée ?"
                            value={formData.reception_accueil || 0}
                            onChange={(v) => updateField('reception_accueil', v)}
                        />
                        <StarRating
                            name="reception_amabilite"
                            label="Comment évaluez-vous l’amabilité du personnel d’accueil ?"
                            value={formData.reception_amabilite || 0}
                            onChange={(v) => updateField('reception_amabilite', v)}
                        />
                    </Card>

                    {/* Le Camping & Installations */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Le camping & Installations</h2>
                        <StarRating
                            name="installations_entretien"
                            label="Comment évaluez-vous l’entretien général des installations communes ?"
                            value={formData.installations_entretien || 0}
                            onChange={(v) => updateField('installations_entretien', v)}
                        />

                        <ToggleGroup
                            label="Avez-vous eu besoin d’une intervention technique pendant votre séjour ?"
                            value={formData.intervention_technique_needed}
                            onChange={(v: string) => updateField('intervention_technique_needed', v)}
                        />

                        {formData.intervention_technique_needed === 'oui' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <StarRating
                                    name="technique_amabilite"
                                    label="Comment évaluez-vous l’amabilité du personnel technique ?"
                                    value={formData.technique_amabilite || 0}
                                    onChange={(v) => updateField('technique_amabilite', v)}
                                />
                            </div>
                        )}
                    </Card>

                    {/* Sanitaires communs */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Sanitaires communs</h2>
                        <StarRating
                            name="sanitaires_proprete"
                            label="Comment évaluez-vous la propreté des sanitaires ?"
                            value={formData.sanitaires_proprete || 0}
                            onChange={(v) => updateField('sanitaires_proprete', v)}
                        />
                        <StarRating
                            name="sanitaires_resolution"
                            label="Quelle note donneriez-vous à la rapidité de résolution des problèmes de propreté ?"
                            value={formData.sanitaires_resolution || 0}
                            onChange={(v) => updateField('sanitaires_resolution', v)}
                        />
                        <StarRating
                            name="sanitaires_amabilite"
                            label="Comment évaluez-vous l’amabilité du personnel de propreté ?"
                            value={formData.sanitaires_amabilite || 0}
                            onChange={(v) => updateField('sanitaires_amabilite', v)}
                        />
                    </Card>

                    {/* Espaces Verts */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Espaces Verts</h2>
                        <StarRating
                            name="verts_entretien"
                            label="Comment évaluez-vous l’entretien des espaces verts ?"
                            value={formData.verts_entretien || 0}
                            onChange={(v) => updateField('verts_entretien', v)}
                        />

                        <ToggleGroup
                            label="Avez-vous eu besoin d’une intervention sur les espaces verts ?"
                            value={formData.intervention_verts_needed}
                            onChange={(v: string) => updateField('intervention_verts_needed', v)}
                        />

                        {formData.intervention_verts_needed === 'oui' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <StarRating
                                    name="verts_amabilite"
                                    label="Comment évaluez-vous l’amabilité du personnel en charge des espaces verts ?"
                                    value={formData.verts_amabilite || 0}
                                    onChange={(v) => updateField('verts_amabilite', v)}
                                />
                            </div>
                        )}
                    </Card>

                    {/* Votre Séjour */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Votre Séjour</h2>

                        <ToggleGroup
                            label="Où avez-vous séjourné ?"
                            options={[{ label: 'En Location', value: 'location' }, { label: 'Emplacement', value: 'emplacement' }]}
                            value={formData.type_sejour}
                            onChange={(v: string) => updateField('type_sejour', v)}
                        />

                        <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Sécurité</h3>
                        <StarRating
                            name="securite_sentiment"
                            label="Comment évaluez-vous le sentiment de sécurité pendant votre séjour ?"
                            value={formData.securite_sentiment || 0}
                            onChange={(v) => updateField('securite_sentiment', v)}
                        />
                        <StarRating
                            name="securite_reactivite"
                            label="Quelle note donneriez-vous à la réactivité en cas d’incident ou d’urgence ?"
                            value={formData.securite_reactivite || 0}
                            onChange={(v) => updateField('securite_reactivite', v)}
                        />
                        <StarRating
                            name="securite_amabilite"
                            label="Comment évaluez-vous l’amabilité du personnel de sécurité ?"
                            value={formData.securite_amabilite || 0}
                            onChange={(v) => updateField('securite_amabilite', v)}
                        />
                    </Card>

                    {/* Communication */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Communication</h2>
                        <ToggleGroup
                            label="Avez-vous trouvé toutes les informations nécessaires sur l'application Cool'n'Camp ?"
                            value={formData.app_infos}
                            onChange={(v: string) => updateField('app_infos', v)}
                        />
                        <StarRating
                            name="infos_utiles"
                            label="Les informations (plan, brochures...) étaient-elles utiles et accessibles ?"
                            value={formData.infos_utiles || 0}
                            onChange={(v) => updateField('infos_utiles', v)}
                        />
                        <ToggleGroup
                            label="Les réseaux sociaux vous ont-ils semblé attractifs et représentatifs ?"
                            value={formData.social_attractifs}
                            onChange={(v: string) => updateField('social_attractifs', v)}
                        />
                    </Card>

                    {/* Animation */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Animation</h2>
                        <ToggleGroup
                            label="Vos enfants ont-ils participé aux clubs d’animation ?"
                            value={formData.club_enfants}
                            onChange={(v: string) => updateField('club_enfants', v)}
                        />

                        <ToggleGroup
                            label="Avez vous participé aux activités sportives ?"
                            value={formData.sport_participation}
                            onChange={(v: string) => updateField('sport_participation', v)}
                        />
                        {formData.sport_participation === 'oui' && (
                            <StarRating
                                name="sport_qualite"
                                label="Quelle note donneriez-vous à leur qualité et variété ?"
                                value={formData.sport_qualite || 0}
                                onChange={(v) => updateField('sport_qualite', v)}
                            />
                        )}

                        <ToggleGroup
                            label="Avez-vous assisté aux soirées, concerts et spectacles ?"
                            value={formData.soiree_participation}
                            onChange={(v: string) => updateField('soiree_participation', v)}
                        />
                        {formData.soiree_participation === 'oui' && (
                            <StarRating
                                name="soiree_qualite"
                                label="Quelle note donneriez-vous à leur qualité et variété ?"
                                value={formData.soiree_qualite || 0}
                                onChange={(v) => updateField('soiree_qualite', v)}
                            />
                        )}

                        <StarRating
                            name="animation_sympathie"
                            label="Quelle note donneriez-vous à la sympathie et au relationnel de l'équipe ?"
                            value={formData.animation_sympathie || 0}
                            onChange={(v) => updateField('animation_sympathie', v)}
                        />
                    </Card>

                    {/* Évaluation Globale */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Évaluation Globale</h2>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <StarRating
                                name="global_satisfaction"
                                label="Globalement, comment évaluez-vous votre séjour au camping CHM René Oltra ?"
                                value={formData.global_satisfaction || 0}
                                onChange={(v) => updateField('global_satisfaction', v)}
                            />
                        </div>
                        <StarRating
                            name="global_rapport_prix"
                            label="Rapport qualité/prix"
                            value={formData.global_rapport_prix || 0}
                            onChange={(v) => updateField('global_rapport_prix', v)}
                        />
                        <ToggleGroup
                            label="Recommanderiez-vous le camping ?"
                            value={formData.recommandation}
                            onChange={(v: string) => updateField('recommandation', v)}
                        />
                    </Card>

                    {/* Commerces et Services */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Commerces et services</h2>
                        <label className="block text-gray-700 font-medium mb-4">Avez-vous profité des services suivants ?</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Épicerie', 'Laverie', 'Croq’Méditerranée', 'Sun Beach', 'Oltra Fit', 'Troquet de René'].map(service => (
                                <label key={service} className="cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="hidden peer"
                                        checked={formData.services?.includes(service) || false}
                                        onChange={(e) => {
                                            const current = formData.services || []
                                            if (e.target.checked) {
                                                updateField('services', [...current, service])
                                            } else {
                                                updateField('services', current.filter((s: string) => s !== service))
                                            }
                                        }}
                                    />
                                    <div className="px-4 py-3 border rounded-lg text-center hover:bg-gray-50 transition-colors peer-checked:bg-teal-600 peer-checked:text-white peer-checked:border-teal-600">
                                        {service}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </Card>

                    {/* Votre Profil */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Votre profil</h2>
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Comment avez-vous connu notre établissement ?</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.source_connaissance || ''}
                                    onChange={(e) => updateField('source_connaissance', e.target.value)}
                                >
                                    <option value="">À compléter</option>
                                    <option value="internet">Recherche Internet / Réseaux sociaux</option>
                                    <option value="recommandation">Recommandation / Bouche à oreille</option>
                                    <option value="precedent">Précédent séjour</option>
                                    <option value="presse">Presse / Publicité</option>
                                    <option value="ot">Office de Tourisme</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Votre tranche d'âge :</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.age || ''}
                                    onChange={(e) => updateField('age', e.target.value)}
                                >
                                    <option value="">À compléter</option>
                                    <option value="-29">- de 29 ans</option>
                                    <option value="30-40">30 à 40 ans</option>
                                    <option value="40-59">40 à 59 ans</option>
                                    <option value="60+">60 ans et +</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Vous êtes client depuis :</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.client_depuis || ''}
                                    onChange={(e) => updateField('client_depuis', e.target.value)}
                                >
                                    <option value="">À compléter</option>
                                    <option value="1-2">1 à 2 ans</option>
                                    <option value="3-5">3 à 5 ans</option>
                                    <option value="6-10">6 à 10 ans</option>
                                    <option value="11-15">11 à 15 ans</option>
                                    <option value="16+">16 ans et +</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Votre Avis */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-teal-800 mb-4 border-b pb-2">Votre avis</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Ce que vous avez le plus apprécié :</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.apprecie || ''}
                                    onChange={(e) => updateField('apprecie', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Ce qui peut être amélioré :</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.ameliorations || ''}
                                    onChange={(e) => updateField('ameliorations', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Quelques mots sur votre séjour !</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={formData.commentaire_libre || ''}
                                    onChange={(e) => updateField('commentaire_libre', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="anon"
                                className="mt-1"
                                checked={formData.anonyme || false}
                                onChange={(e) => updateField('anonyme', e.target.checked)}
                            />
                            <label htmlFor="anon" className="text-sm text-gray-600">Vous acceptez que cet avis soit publié anonymement sur notre site internet</label>
                        </div>
                    </Card>

                    {/* Bouton Envoyer */}
                    <div className="text-center pt-4 pb-8">
                        <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transform transition hover:scale-105"
                        >
                            Envoyer mon avis
                        </button>
                    </div>

                    {/* Footer Legal */}
                    <footer className="text-xs text-gray-400 text-justify leading-relaxed border-t pt-4">
                        <p>Vous recevez cette communication dans le cadre d'une enquête. Si toutefois vous ne souhaitiez plus les recevoir par l'intermédiaire de notre partenaire, nous vous remercions de bien vouloir nous informer par écrit de votre volonté. La société Qualitelis est fermement engagée en faveur du respect de votre vie privée. Nous ne transmettons vos coordonnées à aucun tiers sans votre consentement.</p>
                    </footer>

                </form>
            </main>
        </div>
    )
}
