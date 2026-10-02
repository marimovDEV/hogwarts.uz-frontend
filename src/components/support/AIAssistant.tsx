import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, User, Send, ThumbsUp, ThumbsDown, Loader2, X } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/services/api";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AIAssistantFAQ {
    id: number;
    question_uz: string;
    question_ru: string;
    answer_uz: string;
    answer_ru: string;
    category: string;
    action_label_uz: string | null;
    action_label_ru: string | null;
    action_link: string | null;
}

interface Message {
    id?: number;
    type: 'user' | 'bot';
    content: string;
    source?: 'FAQ' | 'LLM';
    action?: { label: string, link: string };
    faq_id?: number;
    message_id?: number;
    rated?: 'up' | 'down' | null;
}

interface AIAssistantProps {
    onTalkToAdmin: () => void;
    onClose?: () => void;
}

const AIAssistant = ({ onTalkToAdmin, onClose }: AIAssistantProps) => {
    const [faqs, setFaqs] = useState<AIAssistantFAQ[]>([]);
    const [history, setHistory] = useState<Message[]>([]);
    const [language, setLanguage] = useState<'uz' | 'ru'>('uz');
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lang = localStorage.getItem('i18nextLng') || 'uz';
        setLanguage(lang.startsWith('ru') ? 'ru' : 'uz');

        fetchFaqs();

        setHistory([{
            type: 'bot',
            content: lang.startsWith('ru')
                ? "Здравствуйте! Я Hogwords AI — ваш помощник. Выберите вопрос или напишите мне."
                : "Assalomu alaykum! Men Hogwords AI yordamchingizman. Quyidagi savollardan birini tanlang yoki savolingizni yozing."
        }]);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const fetchFaqs = async () => {
        try {
            const res = await axios.get(`${API_URL}/ai-assistant-faq/`);
            setFaqs(res.data.results || res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleQuery = async (queryText: string) => {
        if (!queryText.trim()) return;

        setHistory(prev => [...prev, { type: 'user', content: queryText }]);
        setInput("");
        setLoading(true);

        try {
            let sessionId = localStorage.getItem('ai_session_id');
            if (!sessionId) {
                sessionId = Math.random().toString(36).substring(7);
                localStorage.setItem('ai_session_id', sessionId);
            }

            const res = await axios.post(`${API_URL}/ai-assistant-faq/query/`, {
                question: queryText,
                context_url: window.location.href,
                language: language,
                session_id: sessionId
            });

            const data = res.data;
            setHistory(prev => [
                ...prev,
                {
                    type: 'bot',
                    content: data.content,
                    source: data.type,
                    action: data.action,
                    faq_id: data.faq_id,
                    message_id: data.message_id
                }
            ]);
        } catch (error) {
            toast.error(language === 'uz' ? "Xatolik yuz berdi" : "Произошла ошибка");
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async (msgIndex: number, rating: 1 | -1) => {
        const msg = history[msgIndex];
        if (!msg.message_id) return;

        try {
            await axios.post(`${API_URL}/ai-assistant-faq/rate/`, {
                message_id: msg.message_id,
                rating: rating
            });

            setHistory(prev => prev.map((m, i) =>
                i === msgIndex ? { ...m, rated: rating === 1 ? 'up' : 'down' } : m
            ));

            toast.success(language === 'uz' ? "Rahmat!" : "Спасибо!");
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectQuestion = (faq: AIAssistantFAQ) => {
        handleQuery(language === 'uz' ? faq.question_uz : faq.question_ru);
    };

    return (
        <div className="flex flex-col h-full bg-card dark:bg-slate-900 transition-colors">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-900 p-5 text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-black/20 flex items-center justify-center border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-inner">
                        <Sparkles className="w-7 h-7 text-yellow-200" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Hogwords AI</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            <p className="text-[10px] text-blue-100 dark:text-blue-200 uppercase tracking-widest font-bold">Online Assistant</p>
                        </div>
                    </div>
                </div>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="sm:hidden text-white hover:bg-white/10 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                )}
            </div>

            {/* Chat History */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 dark:bg-slate-950/40">
                {history.map((msg, i) => (
                    <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[88%] shadow-sm rounded-2xl p-4 text-sm relative group ${msg.type === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 text-foreground dark:text-slate-100 rounded-tl-none border border-border dark:border-slate-700'
                            }`}>
                            {msg.content}

                            {msg.action && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-3 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                                    onClick={() => {
                                        if (msg.action?.link.startsWith('http')) {
                                            window.open(msg.action.link, '_blank');
                                        } else {
                                            window.location.href = msg.action?.link || "#";
                                        }
                                    }}
                                >
                                    {msg.action.label}
                                    <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                            )}

                            {msg.type === 'bot' && msg.message_id && (
                                <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                    <button
                                        onClick={() => handleRate(i, 1)}
                                        className={`p-1 rounded-full hover:bg-muted ${msg.rated === 'up' ? 'text-green-500' : 'text-muted-foreground'}`}
                                    >
                                        <ThumbsUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleRate(i, -1)}
                                        className={`p-1 rounded-full hover:bg-muted ${msg.rated === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}
                                    >
                                        <ThumbsDown className="w-3 h-3" />
                                    </button>
                                </div>
                            )}

                            {msg.source === 'LLM' && (
                                <div className="text-[8px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">AI Generated</div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl rounded-tl-none p-4 shadow-sm">
                            <Loader2 className="w-5 h-5 animate-spin text-primary dark:text-blue-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-5 pb-24 lg:pb-5 bg-card dark:bg-slate-900 border-t border-border dark:border-slate-800 space-y-4">
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar">
                    {faqs.map(faq => (
                        <button
                            key={faq.id}
                            onClick={() => handleSelectQuestion(faq)}
                            className="bg-slate-100 dark:bg-slate-800 border border-border dark:border-slate-700 px-3 py-1.5 rounded-full text-xs font-medium text-foreground dark:text-slate-200 hover:bg-primary hover:text-white dark:hover:bg-blue-600 transition-all shadow-sm active:scale-95 text-left"
                        >
                            {language === 'uz' ? faq.question_uz : faq.question_ru}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 relative z-10">
                    <Input
                        placeholder={language === 'uz' ? "Savolingizni yozing..." : "Напишите ваш вопрос..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuery(input)}
                        className="rounded-full bg-slate-50 dark:bg-slate-950 border-border dark:border-slate-700 focus-visible:ring-blue-500"
                    />
                    <Button
                        size="icon"
                        onClick={() => handleQuery(input)}
                        disabled={loading || !input.trim()}
                        className="rounded-full shrink-0 bg-blue-600 hover:bg-blue-700 shadow-md"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 mt-2 relative z-10"
                    onClick={onTalkToAdmin}
                >
                    <User className="w-3.5 h-3.5 mr-2" />
                    {language === 'uz' ? "Admin bilan bog'lanish" : "Связаться с админом"}
                </Button>
            </div>
        </div>
    );
};

export default AIAssistant;
