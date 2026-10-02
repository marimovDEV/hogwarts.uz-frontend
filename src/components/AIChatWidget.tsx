import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, Sparkles, MessageSquare } from "lucide-react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getBaseUrl } from "@/services/api";

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

const AIChatWidget = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: t('aiChat.greeting'), sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Handle Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    const handleSend = async (text?: string) => {
        const queryText = text || input;
        if (!queryText.trim() || loading) return;

        const newUserMsg: Message = { id: Date.now(), text: queryText, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        if (!text) setInput("");
        setLoading(true);

        try {
            let sessionId = localStorage.getItem('ai_session_id');
            if (!sessionId) {
                sessionId = Math.random().toString(36).substring(7);
                localStorage.setItem('ai_session_id', sessionId);
            }

            const lang = localStorage.getItem('i18nextLng') || 'uz';
            const normalizedLang = lang.startsWith('ru') ? 'ru' : 'uz';

            const response = await fetch(`${import.meta.env.VITE_API_URL || `${getBaseUrl()}/api`}/ai-assistant-faq/query/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: queryText,
                    context_url: window.location.href,
                    language: normalizedLang,
                    session_id: sessionId
                })
            });

            const data = await response.json();

            const botResponse: Message = {
                id: Date.now() + 1,
                text: data.content || t('aiChat.error'),
                sender: 'bot'
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: t('aiChat.error'),
                sender: 'bot'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        t('aiChat.suggestions.course'),
        t('aiChat.suggestions.pricing'),
        t('aiChat.suggestions.free'),
        t('aiChat.suggestions.certificate')
    ];

    return (
        <>
            {/* Overlay for closing when clicking outside (Desktop) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[40]"
                    />
                )}
            </AnimatePresence>

            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100) setIsOpen(false);
                            }}
                            className="mb-4 w-[calc(100vw-2rem)] md:w-[400px] max-h-[85vh] md:max-h-[600px] shadow-[0_32px_64px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#0B0F1A] relative"
                        >
                            {/* Mobile Swipe Handle */}
                            <div className="md:hidden flex justify-center py-3">
                                <div className="w-12 h-1.5 rounded-full bg-white/10" />
                            </div>

                            <Card className="border-0 bg-transparent h-[500px] md:h-[600px] flex flex-col relative">
                                {/* Header */}
                                <div className="p-6 pb-4 flex justify-between items-center bg-gradient-to-b from-[#111827] to-transparent relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group">
                                            <Sparkles className="w-6 h-6 animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white font-cinzel tracking-tight uppercase text-sm">{t('aiChat.title')}</h3>
                                            <div className="flex items-center gap-1.5">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{t('aiChat.status')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-full hover:bg-white/5 text-secondary transition-all"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-hidden relative">
                                    <ScrollArea className="h-full p-6 pt-2" ref={scrollRef}>
                                        <div className="space-y-6 pb-20">
                                            {messages.map((msg) => (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-3 text-sm font-medium leading-relaxed ${msg.sender === 'user'
                                                        ? 'bg-primary text-background rounded-tr-none shadow-gold font-bold'
                                                        : 'bg-white/5 border border-white/5 text-white rounded-tl-none backdrop-blur-sm'
                                                        }`}>
                                                        {msg.text}
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {loading && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex justify-start"
                                                >
                                                    <div className="bg-white/5 border border-white/5 rounded-[1.5rem] rounded-tl-none px-5 py-3 flex gap-1.5 items-center">
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </ScrollArea>

                                    {/* Suggestions Overlay */}
                                    {messages.length === 1 && !loading && (
                                        <div className="absolute bottom-4 left-6 right-6">
                                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 opacity-40">{t('aiChat.quickQuestions')}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {suggestions.map((s, i) => (
                                                    <motion.button
                                                        key={i}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="bg-white/5 border border-white/10 hover:border-primary/40 text-[10px] font-black text-white px-4 py-2 rounded-full transition-all shadow-sm uppercase tracking-widest"
                                                        disabled={loading}
                                                        onClick={() => handleSend(s)}
                                                    >
                                                        {s}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input Container */}
                                <div className="p-6 bg-[#111827] border-t border-white/5">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                        className="flex gap-3 items-center"
                                    >
                                        <div className="flex-1 relative">
                                            <Input
                                                placeholder={t('aiChat.placeholder')}
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                disabled={loading}
                                                className="h-12 px-6 rounded-full bg-white/5 border-white/10 text-white placeholder:text-secondary/40 focus:border-primary/50 transition-all font-medium pr-12"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={loading || !input.trim()}
                                            className="w-12 h-12 rounded-full shrink-0 bg-primary text-background shadow-gold hover:scale-110 transition-transform active:scale-95"
                                        >
                                            <Send className="w-5 h-5" />
                                        </Button>
                                    </form>
                                    <p className="text-center text-[9px] text-secondary/40 mt-4 uppercase tracking-[0.2em] font-black">Powered by Hogwords AI</p>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 border-2 ${isOpen
                        ? 'bg-[#111827] border-white/10 text-secondary'
                        : 'bg-primary border-primary/20 text-background shadow-gold'
                        }`}
                >
                    {isOpen ? <X className="w-6 h-6 md:w-7 md:h-7" /> : <Sparkles className="w-7 h-7 md:w-8 md:h-8 animate-pulse" />}
                </motion.button>
            </div>
        </>
    );
};

export default AIChatWidget;
