import { motion } from "framer-motion";
import { Users, Trophy, ShieldCheck, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const TrustBar = () => {
    const { t } = useTranslation();

    const stats = [
        { icon: Users, label: "10,000+", sublabel: t('hero.stats_students', "o'quvchi") },
        { icon: Trophy, label: "50+", sublabel: t('hero.stats_olympiads', "olimpiada") },
        { icon: ShieldCheck, label: "100%", sublabel: t('hero.stats_transparency', "shaffoflik") },
        { icon: Star, label: "4.9", sublabel: t('hero.stats_rating', "platforma bahosi") },
    ];

    return (
        <section className="py-12 bg-[#0B0F1A] border-y border-white/5 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center md:flex-row md:justify-center gap-4 text-center md:text-left group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                                <stat.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white tracking-tight">{stat.label}</div>
                                <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#64748B] group-hover:text-primary/70 transition-colors">
                                    {stat.sublabel}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustBar;
