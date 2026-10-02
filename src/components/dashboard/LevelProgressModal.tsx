
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Trophy,
    Star,
    Zap,
    BookOpen,
    Target,
    Award,
    ChevronRight,
    Sparkles,
    Gift,
    Flame,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface UserLevelProgress {
    current: number;
    current_name: string;
    next: number;
    next_name: string;
    xp_current: number;
    xp_max: number;
    xp_left: number;
    progress_percent: number;
    reward: string;
    roadmap: Array<{
        level: number;
        name: string;
        reward: string;
        icon: string;
        reached: boolean;
    }>;
}

interface LevelProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        xp: number;
        level: number;
        level_progress?: UserLevelProgress;
        [key: string]: any;
    };
}

const LevelProgressModal: React.FC<LevelProgressModalProps> = ({ isOpen, onClose, user }) => {
    const { t } = useTranslation();
    const progress: UserLevelProgress = user?.level_progress || {
        current: 1,
        current_name: "Boshlovchi",
        next: 2,
        next_name: "Izlanuvchi",
        xp_current: 0,
        xp_max: 500,
        xp_left: 500,
        progress_percent: 0,
        reward: "Qatnashchi nishoni",
        roadmap: []
    };

    const roadmap = progress.roadmap?.length > 0 ? progress.roadmap : [
        { level: 1, name: "Boshlovchi", reward: "Boshlang'ich nishon", icon: "Award", reached: (user?.level || 1) >= 1 },
        { level: 3, name: "Faol O'quvchi", reward: "Faollik Badge", icon: "Star", reached: (user?.level || 1) >= 3 },
        { level: 5, name: "Tajribali", reward: "5,000 AC Bonus", icon: "Gift", reached: (user?.level || 1) >= 5 },
        { level: 7, name: "Professional", reward: "Maxsus Kurslar", icon: "Unlock", reached: (user?.level || 1) >= 7 },
        { level: 10, name: "Usta (Master)", reward: "Afsonaviy Sertifikat 👑", icon: "Crown", reached: (user?.level || 1) >= 10 },
    ];

    const earningTips = [
        { icon: BookOpen, title: "Darsni tugatish", xp: "+10 XP", color: "text-primary", bg: "bg-primary/10" },
        { icon: Target, title: "Testdan o'tish", xp: "+20 XP", color: "text-green-500", bg: "bg-green-500/10" },
        { icon: Trophy, title: "Olimpiada ishtiroki", xp: "+50 XP", color: "text-primary", bg: "bg-primary/20" },
        { icon: Flame, title: "Kunlik streak", xp: "+10 XP", color: "text-primary", bg: "bg-primary/10" },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-none shadow-2xl rounded-[32px]">
                <div className="relative">
                    {/* Background Header Decoration */}
                    <div className="absolute top-0 inset-x-0 h-48 bg-primary/10 opacity-20 blur-3xl -z-10" />

                    <div className="p-8">
                        <DialogHeader className="mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-4 ring-card">
                                        <Star className="w-8 h-8 text-white fill-white" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full ring-2 ring-card">
                                        LVL {progress.current}
                                    </div>
                                </div>
                                <div className="text-left">
                                    <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
                                        {progress.current_name}
                                    </DialogTitle>
                                    <DialogDescription className="text-muted-foreground font-medium">
                                        Sizning ta'lim yo'lingizdagi joriy darajangiz
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-8">
                            {/* Progress Section */}
                            <div className="bg-muted/30 p-6 rounded-[24px] border border-border/50 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Tajriba (XP)</p>
                                        <h3 className="text-2xl font-black text-foreground">
                                            {user?.xp || 0} <span className="text-muted-foreground text-sm font-medium">/ {(user?.xp || 0) + progress.xp_left} XP</span>
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-primary font-black text-lg">{progress.progress_percent}%</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Keyingisiga {progress.xp_left} XP qoldi</p>
                                    </div>
                                </div>

                                <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress.progress_percent}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-gold"
                                    />
                                </div>

                                <div className="mt-6 flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Gift className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Keyingi mukofot</p>
                                            <p className="text-sm font-bold text-foreground">{progress.reward}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Daraja {progress.next}</p>
                                        <p className="text-xs font-bold text-primary">{progress.next_name}</p>
                                    </div>
                                </div>
                            </div>

                            <ScrollArea className="h-[350px] pr-4">
                                <div className="space-y-8 pb-6">
                                    {/* How to earn section */}
                                    <section>
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-yellow-500" />
                                            {t('dashboard.level.howToEarn', "XP qanday yig'iladi?")}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {earningTips.map((tip, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                                                    <div className={`w-10 h-10 rounded-xl ${tip.bg} flex items-center justify-center shrink-0`}>
                                                        <tip.icon className={`w-5 h-5 ${tip.color}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-foreground leading-tight">{tip.title}</p>
                                                        <p className={`text-[10px] font-black ${tip.color}`}>{tip.xp}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Roadmap section */}
                                    <section>
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-primary" />
                                            {t('dashboard.level.roadmap', "Darajalar xaritasi")}
                                        </h4>
                                        <div className="space-y-3 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border -z-10" />

                                            {roadmap.map((item, i) => (
                                                <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${item.level === progress.current
                                                    ? "bg-primary/10 border-primary ring-1 ring-primary/20 scale-[1.02]"
                                                    : item.reached
                                                        ? "bg-muted/50 border-border opacity-70"
                                                        : "bg-transparent border-border/50 opacity-50"
                                                    }`}>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${item.level === progress.current
                                                        ? "bg-primary text-background"
                                                        : item.reached
                                                            ? "bg-green-500/20 text-green-500"
                                                            : "bg-white/5 text-white/20 border border-white/5"
                                                        }`}>
                                                        {item.reached ? <Check className="w-4 h-4" /> : <span className="text-[10px] font-bold">{item.level}</span>}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-bold text-foreground">{item.name}</p>
                                                            {item.level === progress.current && (
                                                                <span className="text-[10px] font-black bg-primary text-background px-2 py-0.5 rounded-full uppercase font-cinzel tracking-wider">{t('common.youAreHere', "Siz shu yerdasiz")}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] font-medium text-muted-foreground">{t('common.reward', "Mukofot")}: {item.reward}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LevelProgressModal;
