import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet, CheckCircle, Loader2, Zap, Clock, Smartphone } from "lucide-react";
import { toast } from "sonner";
import api, { API_URL } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
    isOpen: boolean;
    onOpenChange?: (open: boolean) => void;
    onClose?: () => void;
    onSuccess?: (newBalance?: number) => void;
    requiredAmount?: number;
}

const PaymentModal = ({ isOpen, onOpenChange, onClose, onSuccess, requiredAmount }: PaymentModalProps) => {
    const [amount, setAmount] = useState(requiredAmount ? requiredAmount.toString() : "50000");
    const [loading, setLoading] = useState(false);

    // Simplifed state: Just show bot prompt
    const [botUrl, setBotUrl] = useState('https://t.me/ardentsoft_olimpiada_bot');
    const [step, setStep] = useState<'SELECT' | 'SUCCESS'>('SELECT');

    // Update amount if requiredAmount changes
    useEffect(() => {
        if (requiredAmount) {
            setAmount(requiredAmount.toString());
        }
    }, [requiredAmount]);

    // Fetch bot URL
    useEffect(() => {
        if (isOpen) {
            fetchBotConfig();
        }
    }, [isOpen]);

    const fetchBotConfig = async () => {
        try {
            const res = await api.get('/bot/config/');
            if (res.data.success && res.data.config && res.data.config.humo_bot_url) {
                setBotUrl(res.data.config.humo_bot_url);
            } else if (res.data.results && res.data.results.length > 0) {
                setBotUrl(res.data.results[0].humo_bot_url || 'https://t.me/ardentsoft_olimpiada_bot');
            }
        } catch (err) {
            console.error("Error fetching bot config", err);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (onOpenChange) onOpenChange(open);
        if (!open && onClose) onClose();
    };

    const handleGoToBot = () => {
        // Construct deep link if needed, e.g., ?start=pay_123
        // For now just open the bot
        let url = botUrl;
        // If we wanted to pass amount: 
        if (!url.includes('?start=')) {
            url += `?start=topup_${amount}`;
        }
        window.open(url, '_blank');
        setStep('SUCCESS');
    };

    const quickAmounts = ["10000", "50000", "150000", "500000"];

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md w-[95vw] sm:w-full p-0 overflow-hidden bg-slate-950 border-none rounded-[24px] sm:rounded-[32px] shadow-[0_0_50px_rgba(59,130,246,0.15)] ring-1 ring-white/10">
                <div className="relative p-4 sm:p-8">
                    {/* Background Neon Glows */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[80px] -mr-20 -mt-20 rounded-full" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-600/20 blur-[80px] -ml-20 -mb-20 rounded-full" />

                    <DialogHeader className="relative z-10 space-y-2 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-primary-dark flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <DialogTitle className="text-2xl font-black text-white tracking-tight">Balansni to'ldirish</DialogTitle>
                                <DialogDescription className="text-slate-400 font-medium font-bold">1 ArdCoin = 1 so'm</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        {step === 'SELECT' ? (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8 relative z-10"
                            >
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-start">
                                    <div className="bg-primary rounded-full p-2 mt-1 shrink-0">
                                        <Smartphone className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-white text-sm">Telegram orqali to'lov</h4>
                                        <p className="text-xs text-blue-200 leading-relaxed">
                                            Barcha to'lovlar Telegram botimiz orqali amalga oshiriladi. Bot orqali Payme yoki Click yordamida hisobingizni to'ldirishingiz mumkin.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">To'ldirish summasi (UZS)</Label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                                                UZS
                                            </div>
                                            <Input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                min="1000"
                                                className="h-16 pl-16 pr-4 bg-slate-900/50 border-slate-800 text-2xl font-black text-white rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {quickAmounts.map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => setAmount(amt)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${amount === amt
                                                    ? "bg-primary border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                                    }`}
                                            >
                                                {parseInt(amt).toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleGoToBot}
                                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary-dark hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg shadow-lg shadow-primary/25 transition-all group"
                                >
                                    <span>Botga o'tish</span>
                                    <Zap className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6 text-center py-4 relative z-10"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse" />
                                    <div className="relative w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center ring-4 ring-green-500/10 mx-auto">
                                        <CheckCircle className="w-12 h-12 text-green-500" />
                                    </div>
                                </div>
                                <div className="space-y-2 mx-auto">
                                    <h3 className="text-2xl font-black text-white tracking-tight">Botga yo'naltirildi!</h3>
                                    <p className="text-slate-400 font-medium">To'lovni bot orqali yakunlang. To'lov muvaffaqiyatli amalga oshirilgach, hisobingiz avtomatik yangilanadi.</p>
                                </div>
                                <Button onClick={() => handleOpenChange(false)} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold border border-slate-800 transition-all">
                                    Tushunarli
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog >
    );
};

export default PaymentModal;
