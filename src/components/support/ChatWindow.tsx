import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X, MoreVertical, CheckCheck, Loader2 } from "lucide-react";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";

interface Message {
    id: number;
    sender_id: string;
    sender_name: string;
    message: string;
    is_internal: boolean;
    is_admin: boolean;
    created_at: string;
}

interface ChatWindowProps {
    ticketId: string | null;
    topic: string;
    onClose: () => void;
    onBack: () => void;
    onTicketCreated?: (id: string) => void;
}

const ChatWindow = ({ ticketId, topic, onClose, onBack, onTicketCreated }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (ticketId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Poll every 5s
            return () => clearInterval(interval);
        }
    }, [ticketId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        if (!ticketId) return;
        try {
            const res = await axios.get(`${API_URL}/support/${ticketId}/`, { headers: getAuthHeader() });
            // API returns messages as part of the ticket object or we might need standard messages endpoint
            // Based on Serializer, it's in .messages
            if (res.data.messages) {
                setMessages(res.data.messages.filter((m: any) => m !== null)); // Filter out nulls (internal ones)
            }
        } catch (error) {
            console.error("Messages fetch error:", error);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || sending) return;

        setSending(true);
        try {
            const headers = getAuthHeader();
            if (!ticketId) {
                // Create new ticket
                const res = await axios.post(`${API_URL}/support/`, {
                    subject: inputText.substring(0, 50) + (inputText.length > 50 ? "..." : ""),
                    category: topic.charAt(0).toUpperCase() + topic.slice(1),
                    priority: "MEDIUM",
                    message: inputText
                }, { headers });

                if (res.data.success) {
                    onTicketCreated?.(res.data.ticket.id);
                    setInputText("");
                    // Messages will be fetched by the interval/effect once ticketId updates
                }
            } else {
                // Reply to existing ticket
                const res = await axios.post(`${API_URL}/support/${ticketId}/reply/`, {
                    message: inputText
                }, { headers });

                if (res.data.success) {
                    setInputText("");
                    fetchMessages();
                }
            }
        } catch (error) {
            console.error("Send error:", error);
        } finally {
            setSending(false);
        }
    };

    const getTopicLabel = (id: string) => {
        switch (id) {
            case 'course': return "Kurslar bo'yicha";
            case 'olympiad': return "Olimpiada";
            case 'payment': return "To'lov masalalari";
            default: return "Yordam";
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-slate-950/20">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 -ml-2">
                        <span className="text-xl">←</span>
                    </Button>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{getTopicLabel(topic)}</h3>
                        {ticketId && (
                            <span className="flex items-center gap-1 text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded w-fit font-medium">
                                ● Ticket #{ticketId}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400 dark:text-slate-500 hover:text-red-500">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !ticketId && (
                    <div className="text-center py-10 opacity-50 space-y-2">
                        <div className="text-sm">Xabaringizni yozing va biz yordam beramiz</div>
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${!msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative group ${!msg.is_admin
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-slate-100 rounded-bl-none'
                            }`}>
                            {msg.message}
                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70 ${!msg.is_admin ? 'text-blue-100' : 'text-gray-400 dark:text-slate-500'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {!msg.is_admin && <CheckCheck className="w-3 h-3" />}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Xabar yozing..."
                        disabled={sending}
                        className="flex-1 bg-gray-50 dark:bg-slate-800 border-0 rounded-xl px-4 text-sm text-foreground dark:text-slate-100 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all disabled:opacity-50"
                    />
                    <Button
                        onClick={handleSend}
                        size="icon"
                        disabled={sending || !inputText.trim()}
                        className={`rounded-xl shrink-0 transition-all ${inputText.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600'}`}
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
