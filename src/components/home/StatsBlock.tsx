import { motion } from "framer-motion";
import { Users, BookOpen, Award, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/services/api";

interface StatItemProps {
    icon: any;
    value: string;
    label: string;
    delay: number;
}

import { memo } from "react";

const StatItem = memo(({ icon: Icon, value, label, delay }: StatItemProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            className="flex flex-col items-center p-4 md:p-6 bg-card rounded-2xl md:rounded-xl border shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="p-2.5 md:p-3 bg-primary/10 rounded-full mb-3 md:mb-4">
                <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            <span className="text-2xl md:text-3xl font-bold mb-0.5 md:mb-1 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {value}
            </span>
            <span className="text-[10px] md:text-base text-muted-foreground font-medium uppercase md:capitalize tracking-wider md:tracking-normal">{label}</span>
        </motion.div>
    );
});

const StatsBlock = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await homepageService.getStats();
                setStats(data.stats || data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) return null;

    const statsData = [
        { icon: Users, value: stats.total_users?.toLocaleString() || "0", label: t('home.stats.users') },
        { icon: BookOpen, value: stats.active_courses?.toLocaleString() || "0", label: t('home.stats.courses') },
        { icon: Trophy, value: stats.active_olympiads?.toLocaleString() || "0", label: t('home.stats.olympiads') },
        { icon: Award, value: stats.certificates_issued?.toLocaleString() || "0", label: t('home.stats.certificates') },
    ];

    return (
        <section className="py-16 container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                    <StatItem
                        key={index}
                        icon={stat.icon}
                        value={stat.value}
                        label={stat.label}
                        delay={index * 0.1}
                    />
                ))}
            </div>
        </section>
    );
};

export default StatsBlock;
