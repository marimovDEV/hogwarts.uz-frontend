
import React from 'react';
import {
    Briefcase,
    CheckCircle2,
    Circle,
    ChevronRight,
    Map,
    Star,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import { translateBackendText } from '@/utils/backendTranslations';

interface RoadmapStep {
    id: number;
    title: string;
    type: string;
    is_completed: boolean;
}

interface ProfessionData {
    id: number;
    name: string;
    progress: number;
    roadmap_steps: RoadmapStep[];
}

interface ProfessionRoadmapProps {
    profession: ProfessionData | null;
}

const ProfessionRoadmap: React.FC<ProfessionRoadmapProps> = ({ profession }) => {
    const { t } = useTranslation();

    if (!profession) {
        return (
            <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                        {t('dashboard.profession.select_title', 'Kasb tanlanmagan')}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        {t('dashboard.profession.select_desc', 'O\'zingizga mos kasbni tanlang va biz sizga o\'rganish yo\'l xaritasini tuzib beramiz.')}
                    </p>
                </div>
                <Link to="/professions">
                    <button className="text-primary font-bold text-sm hover:underline">
                        {t('dashboard.profession.view_all', 'Barcha kasblarni ko\'rish')}
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('dashboard.profession.active_path', 'Hozirgi yo\'nalish')}</p>
                            <h3 className="text-lg font-bold text-foreground">{translateBackendText(profession.name)}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-black text-primary">{Math.round(profession.progress)}%</span>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('dashboard.profession.overall_progress', 'Umumiy progress')}</p>
                    </div>
                </div>
                <Progress value={profession.progress} className="h-2 bg-muted transition-all" />
            </div>

            <div className="p-6 space-y-6">
                <div className="relative">
                    {/* Vertical Line Connector */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border -z-0" />

                    <div className="space-y-6">
                        {profession.roadmap_steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-4 relative z-10"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${step.is_completed
                                    ? "bg-primary border-primary text-white"
                                    : "bg-card border-border text-muted-foreground"
                                    }`}>
                                    {step.is_completed ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <Circle className="w-4 h-4" />
                                    )}
                                </div>

                                <div className="flex-1 pt-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className={`text-sm font-bold leading-none mb-1 ${step.is_completed ? "text-foreground" : "text-muted-foreground"
                                                }`}>
                                                {translateBackendText(step.title)}
                                            </h4>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                                                {step.type}
                                            </span>
                                        </div>
                                        {!step.is_completed && index === 0 && (
                                            <span className="text-[10px] font-black text-primary animate-pulse">
                                                {t('dashboard.profession.continue', 'DAVOM ETTIRISH')} →
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <Link to="/professions" className="block w-full">
                    <button className="w-full py-3 bg-muted/50 hover:bg-muted text-foreground text-sm font-bold rounded-2xl transition-colors flex items-center justify-center gap-2">
                        <Map className="w-4 h-4" />
                        {t('dashboard.profession.view_full_map', 'To\'liq yo\'l xaritasini ko\'rish')}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default ProfessionRoadmap;
