
import React from 'react';
import {
    BookOpen,
    Trophy,
    Zap,
    ChevronRight,
    Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

interface SubjectStat {
    id: number;
    name: string;
    icon: string;
    color: string;
    courses_count: number;
    olympiads_count: number;
    xp_earned: number;
    slug?: string;
}

interface SubjectStatsProps {
    stats: SubjectStat[];
}

const SubjectStats: React.FC<SubjectStatsProps> = ({ stats }) => {
    const { t } = useTranslation();

    if (!stats || stats.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((subject, index) => {
                const IconComponent = (LucideIcons as any)[subject.icon] || BookOpen;

                return (
                    <Link
                        key={subject.id}
                        to={`/subject/${subject.slug || subject.id}`}
                        className="block h-full"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-[#111827] border border-white/5 rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-primary/30 transition-all group relative cursor-pointer h-full flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all duration-500">
                                    <IconComponent className="w-7 h-7" />
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-primary font-black text-xl italic gold-glow">
                                        <Zap className="w-4 h-4 fill-primary" />
                                        {subject.xp_earned}
                                    </div>
                                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">XP Yig'ilgan</p>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                <h4 className="font-black text-2xl text-white tracking-tight group-hover:text-primary transition-colors font-cinzel">
                                    {subject.name}
                                </h4>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-secondary font-black uppercase tracking-widest">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        {subject.courses_count} Kurs
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-secondary font-black uppercase tracking-widest">
                                        <Trophy className="w-3.5 h-3.5" />
                                        {subject.olympiads_count} Olimpiada
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center group/btn">
                                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] group-hover/btn:text-primary transition-colors">Boshlash</span>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-background transition-all -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                );
            })}
        </div>
    );
};

export default SubjectStats;
