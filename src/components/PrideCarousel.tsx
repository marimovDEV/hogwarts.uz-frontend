import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Trophy,
    MapPin,
    ArrowRight,
    Star,
    Sparkles,
    Medal,
    Crown,
    Calendar,
    Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { homepageService } from '@/services/homepageService';

interface Winner {
    id: number;
    rank: number;
    student_name: string;
    region: string;
    score: number;
    max_score: number;
}

interface OlympiadResult {
    id: number;
    title: string;
    subject: string;
    displaySubject?: string;
    date: string;
    stage: string;
    participants_count: number;
    winners: Winner[];
}

// Helper functions
const getMedalStyle = (rank: number, t: any) => {
    switch (rank) {
        case 1: return { bg: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500', border: 'border-yellow-200/50', text: 'text-yellow-950', glow: 'shadow-[0_0_25px_rgba(250,204,21,0.6)]', icon: '🥇', label: t('common.gold') };
        case 2: return { bg: 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400', border: 'border-white/50', text: 'text-slate-900', glow: 'shadow-[0_0_25px_rgba(203,213,225,0.5)]', icon: '🥈', label: t('common.silver') };
        case 3: return { bg: 'bg-gradient-to-br from-orange-400 via-amber-600 to-amber-700', border: 'border-orange-300/50', text: 'text-white', glow: 'shadow-[0_0_25px_rgba(249,115,22,0.5)]', icon: '🥉', label: t('common.bronze') };
        default: return { bg: 'bg-gradient-to-br from-indigo-500 to-blue-700', border: 'border-blue-400/50', text: 'text-white', glow: 'shadow-blue-500/20', icon: '🏅', label: `${rank}-${t('common.ball')}` };
    }
};

const getSubjectTheme = (subjectKey: string) => {
    // Extract base subject key if it contains dot notation (e.g. "subjects.matematika" -> "matematika")
    const subject = subjectKey.includes('.') ? subjectKey.split('.')[1] : subjectKey;
    const s = String(subject || "").toLowerCase();

    switch (s) {
        case 'matematika': return { gradient: 'from-blue-600 via-indigo-600 to-violet-700', glow: 'rgba(79, 70, 229, 0.7)', accent: 'bg-indigo-600' };
        case 'fizika': return { gradient: 'from-fuchsia-600 via-purple-600 to-indigo-800', glow: 'rgba(192, 38, 211, 0.7)', accent: 'bg-fuchsia-600' };
        case 'informatika': return { gradient: 'from-emerald-500 via-teal-600 to-cyan-700', glow: 'rgba(16, 185, 129, 0.7)', accent: 'bg-emerald-600' };
        case 'ingliz_tili': return { gradient: 'from-rose-500 via-red-600 to-orange-600', glow: 'rgba(244, 63, 94, 0.7)', accent: 'bg-rose-600' };
        case 'kimyo': return { gradient: 'from-cyan-500 via-sky-600 to-blue-700', glow: 'rgba(6, 182, 212, 0.7)', accent: 'bg-cyan-600' };
        default: return { gradient: 'from-slate-700 via-gray-800 to-zinc-900', glow: 'rgba(100, 116, 139, 0.6)', accent: 'bg-slate-600' };
    }
};

const PrideCarousel = () => {
    const { t, i18n } = useTranslation();
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [olympiads, setOlympiads] = useState<OlympiadResult[]>([]);

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const data = await homepageService.getPrideResults();
                if (data && data.length > 0) {
                    setOlympiads(data);
                } else {
                    setOlympiads(mockOlympiads);
                }
            } catch (e) {
                console.error(e);
                setOlympiads(mockOlympiads);
            }
        };
        fetchWinners();
    }, []);

    // Mock data for better visuals if backend is empty
    const mockOlympiads: OlympiadResult[] = [
        {
            id: 1, title: "Respublika Matematika Olimpiadasi", subject: "Matematika", date: "2024-03-15", stage: "Respublika", participants_count: 1248,
            winners: [
                { id: 1, rank: 1, student_name: "Azizbek Toxirov", region: "Toshkent", score: 96, max_score: 100 },
                { id: 2, rank: 2, student_name: "Malika Karimova", region: "Samarqand", score: 93, max_score: 100 },
                { id: 3, rank: 3, student_name: "Javohir Aliyev", region: "Buxoro", score: 91, max_score: 100 }
            ]
        }
    ];

    useEffect(() => {
        if (isPaused || olympiads.length <= 1) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % olympiads.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isPaused, olympiads.length]);

    const activeOlympiad = olympiads[index] || mockOlympiads[0];

    return (
        <section className="relative py-16 md:py-24 bg-[#0B0F1A] overflow-hidden min-h-[700px] flex items-center">
            {/* Parallax Background Effect */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A] via-primary/5 to-[#0B0F1A]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <Badge variant="outline" className="px-6 py-1.5 text-sm border-primary/30 text-primary bg-primary/5 backdrop-blur-sm font-black uppercase tracking-widest">
                            <Crown className="w-4 h-4 mr-2" />
                            WINNERS WALL & PRESTIGE
                        </Badge>
                    </motion.div>
                    <h2 className="text-3xl md:text-6xl font-black text-white font-cinzel tracking-tight leading-tight">
                        G'oliblar <span className="text-primary italic gold-glow">Maydoni</span>
                    </h2>
                    <p className="text-xl text-secondary max-w-2xl mx-auto font-medium">
                        Oliy natijalarga erishgan va o'z bilimini dunyoga isbotlagan talabalarimiz.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Olympiad Info & CTA */}
                    <motion.div
                        key={activeOlympiad.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-10"
                    >
                        <div className="space-y-6">
                            <Badge className="bg-primary/20 text-primary border-primary/30 font-black px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px]">
                                {activeOlympiad.subject} • {activeOlympiad.stage}
                            </Badge>
                            <h3 className="text-3xl md:text-7xl font-black text-white font-cinzel leading-[1.1] tracking-tighter">
                                {activeOlympiad.title}
                            </h3>
                            <div className="flex items-center gap-6 text-secondary font-bold uppercase tracking-widest text-[10px]">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" /> {activeOlympiad.date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" /> {activeOlympiad.participants_count} Ishtirokchi
                                </div>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 space-y-6">
                            <div className="text-lg md:text-xl font-black text-white font-cinzel italic">
                                "Keyingi g'olib siz bo'lishingiz mumkin. Bugun tayyorgarlikni boshlang va o'z bilimingizni isbotlang!"
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/auth/register">
                                    <Button className="h-14 px-8 rounded-xl bg-primary text-background font-black shadow-lg hover:scale-105 transition-all">
                                        G'oliblar safiga qo'shilish
                                    </Button>
                                </Link>
                                <Link to={`/olympiad/${activeOlympiad.id}/results`}>
                                    <Button variant="outline" className="h-14 px-8 rounded-xl border-white/10 text-white font-black hover:bg-white/5 transition-all">
                                        Natijalarni ko'rish
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Podium / Top 3 */}
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {activeOlympiad.winners.slice(0, 3).map((winner, i) => {
                            const medal = getMedalStyle(winner.rank, t);
                            const isFirst = winner.rank === 1;
                            return (
                                <motion.div
                                    key={winner.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`group relative bg-[#111827] rounded-[1rem] md:rounded-[1.5rem] border border-white/5 p-4 md:p-6 flex items-center gap-4 md:gap-6 transition-all duration-300 hover:border-primary/40 ${isFirst ? 'scale-105 md:translate-x-4 border-primary/30 shadow-2xl z-10' : 'opacity-80'}`}
                                >
                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${medal.bg} flex items-center justify-center text-xl md:text-3xl shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                        {medal.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-lg md:text-xl font-bold text-white truncate tracking-tight ${isFirst ? 'text-xl md:text-2xl' : ''}`}>{winner.student_name}</div>
                                        <div className="text-[10px] font-bold text-secondary/60 tracking-widest uppercase mt-1">
                                            {winner.region} • <span className="text-primary">{winner.score} ball</span>
                                        </div>
                                    </div>
                                    {isFirst && (
                                        <div className="absolute -top-3 -right-3">
                                            <Badge className="bg-primary text-background font-bold rounded-full h-8 px-4 shadow-gold">
                                                CHAMPION
                                            </Badge>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrideCarousel;
