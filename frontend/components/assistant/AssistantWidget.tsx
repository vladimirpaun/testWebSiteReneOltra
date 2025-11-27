'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Mic, Loader2, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/Input'
import LiveAssistant from './LiveAssistant'

interface Message {
    role: 'user' | 'model'
    text: string
    timestamp: Date
}

export function AssistantWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLiveMode, setIsLiveMode] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: 'Bonjour ! Je suis René, votre assistant virtuel. Comment puis-je vous aider ?', timestamp: new Date() }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: new Date() }])
        setIsLoading(true)

        try {
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
                })
            })

            const data = await response.json()

            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: 'model', text: data.text, timestamp: new Date() }])

        } catch (error) {
            console.error('Error:', error)
            setMessages(prev => [...prev, { role: 'model', text: "Désolé, j'ai rencontré une erreur.", timestamp: new Date() }])
        } finally {
            setIsLoading(false)
        }
    }

    if (isLiveMode) {
        return <LiveAssistant onClose={() => setIsLiveMode(false)} />
    }

    return (
        <>
            {/* Toggle Buttons */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 flex flex-col gap-4 items-end z-50">
                    <Button
                        onClick={() => setIsLiveMode(true)}
                        className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
                    >
                        <Mic className="w-7 h-7 text-white animate-pulse" />
                        <span className="absolute right-full mr-4 bg-white text-gray-800 px-3 py-1 rounded-lg shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Mode Vocal (Live)
                        </span>
                    </Button>

                    <Button
                        onClick={() => setIsOpen(true)}
                        className="rounded-full w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
                    >
                        <MessageSquare className="w-8 h-8 text-white" />
                    </Button>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Sparkles size={20} className="text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">René</h3>
                                <p className="text-blue-100 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    En ligne
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setIsOpen(false); setIsLiveMode(true); }}
                                className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                                title="Passer en mode vocal"
                            >
                                <Mic size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                            >
                                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                            >
                                <X size={18} />
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4 bg-gray-50" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        <span className="text-xs text-gray-500">René réfléchit...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Posez votre question..."
                                className="flex-1 rounded-full border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md w-10 h-10 shrink-0"
                            >
                                <Send size={18} />
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
