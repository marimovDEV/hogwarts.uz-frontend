import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Bot } from "lucide-react";
import TicketWizard from "./TicketWizard";
import ChatWindow from "./ChatWindow";
import AIAssistant from "./AIAssistant";
import { AnimatePresence, motion } from "framer-motion";

const SupportWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'ai' | 'wizard' | 'chat'>('ai');
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const [activeTicketId, setActiveTicketId] = useState<string | null>(localStorage.getItem('active_support_ticket'));

    const handleTopicSelect = (topic: string) => {
        setActiveTopic(topic);
        setView('chat');
    };

    const handleTicketCreated = (id: string) => {
        setActiveTicketId(id);
        localStorage.setItem('active_support_ticket', id);
    };

    const reset = () => {
        setIsOpen(false);
        setTimeout(() => {
            if (!activeTicketId) {
                setView('ai');
                setActiveTopic(null);
            }
        }, 300);
    };

    return (
        <>
            {/* Trigger Button */}
            <div className="fixed bottom-24 right-4 z-[100]">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'bg-gray-900 rotate-90 scale-90' : 'bg-gradient-to-br from-hogwarts-gold to-amber-500 hover:scale-110'}`}
                >
                    {isOpen ? <X className="w-6 h-6 text-white" /> : (
                        activeTicketId ? <Sparkles className="w-6 h-6 text-white fill-current" /> : <Bot className="w-7 h-7 text-[#0F172A] fill-current" />
                    )}
                </Button>

                {/* Notification Badge */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </div>

            {/* Main Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-0 right-0 sm:bottom-24 sm:right-6 w-full sm:w-[400px] h-full sm:h-[600px] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-[90] flex flex-col"
                    >
                        {view === 'ai' && !activeTicketId ? (
                            <AIAssistant onTalkToAdmin={() => setView('wizard')} onClose={reset} />
                        ) : (view === 'ai' || view === 'chat') && activeTicketId ? (
                            <ChatWindow
                                ticketId={activeTicketId}
                                topic={activeTopic || 'general'}
                                onClose={reset}
                                onBack={() => {
                                    if (activeTicketId) {
                                        setView('wizard');
                                    } else {
                                        setView('ai');
                                    }
                                }}
                                onTicketCreated={handleTicketCreated}
                            />
                        ) : view === 'wizard' ? (
                            <div className="p-6 h-full overflow-y-auto">
                                <TicketWizard onSelectTopic={handleTopicSelect} />
                                {activeTicketId && (
                                    <Button
                                        variant="link"
                                        className="w-full mt-2 text-xs text-blue-600"
                                        onClick={() => setView('chat')}
                                    >
                                        Faol murojaatga qaytish (#{activeTicketId})
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <ChatWindow
                                ticketId={null}
                                topic={activeTopic || 'general'}
                                onClose={reset}
                                onBack={() => setView('wizard')}
                                onTicketCreated={handleTicketCreated}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SupportWidget;
