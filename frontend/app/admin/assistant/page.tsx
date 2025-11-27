'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Loader2, Save, Upload } from 'lucide-react'

export default function AssistantAdminPage() {
    const [instruction, setInstruction] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadMessage, setUploadMessage] = useState('')

    useEffect(() => {
        fetch('/api/assistant/config')
            .then(res => res.json())
            .then(data => {
                if (data.systemInstruction) {
                    setInstruction(data.systemInstruction)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/assistant/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction: instruction })
            })
            if (!res.ok) throw new Error('Failed to save')
            alert('Configuration sauvegardée !')
        } catch (err) {
            alert('Erreur lors de la sauvegarde')
        } finally {
            setSaving(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        setUploadMessage('')

        const formData = new FormData()
        formData.append('file', e.target.files[0])

        try {
            const res = await fetch('/api/admin/documents', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')
            setUploadMessage(`Succès : ${data.message}`)

            // Save the File Search store name to config (so the model can use it)
            if (data.fileSearchStoreName) {
                await fetch('/api/assistant/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction: instruction,
                        fileSearchStoreName: data.fileSearchStoreName
                    })
                })
            }
        } catch (err) {
            setUploadMessage('Erreur lors de l\'upload')
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Administration Assistant Vocal "René"</h1>

            {/* System Instruction Editor */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Save className="w-5 h-5 text-blue-600" />
                    Instruction Système (System Prompt)
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Définissez ici le comportement, le ton et les règles de l'assistant.
                </p>
                <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="w-full h-96 p-4 border rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Enregistrer les modifications
                    </Button>
                </div>
            </div>

            {/* RAG Document Upload */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-green-600" />
                    Base de Connaissances (RAG)
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Ajoutez des documents (PDF, TXT, MD) pour enrichir les connaissances de l'assistant (FAQ, CGV, etc.).
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                    <input
                        type="file"
                        id="rag-upload"
                        className="hidden"
                        onChange={handleUpload}
                        accept=".txt,.md,.pdf"
                        disabled={uploading}
                    />
                    <label htmlFor="rag-upload" className="cursor-pointer flex flex-col items-center">
                        {uploading ? (
                            <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-2" />
                        ) : (
                            <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        )}
                        <span className="text-blue-600 font-medium">Cliquez pour uploader un fichier</span>
                        <span className="text-xs text-gray-400 mt-1">PDF, TXT, Markdown supportés</span>
                    </label>
                </div>
                {uploadMessage && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${uploadMessage.includes('Succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {uploadMessage}
                    </div>
                )}
            </div>
        </div>
    )
}
