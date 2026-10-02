import { motion } from "framer-motion";
import { Zap, Play, Trophy, Award, CheckCircle2 } from "lucide-react";

interface Activity {
    id: number;
    type: 'course' | 'xp' | 'olympiad' | 'certificate';
    title: string;
    time: string;
    value?: string;
}

const activities: Activity[] = [
    { id: 1, type: 'course', title: "Dasturlash asoslari kursi boshlandi", time: "2 soat oldin" },
    { id: 2, type: 'xp', title: "Daily Mission bajarildi", time: "5 soat oldin", value: "+50 XP" },
    { id: 3, type: 'olympiad', title: "Matematika olimpiadasiga yozildi", time: "Kecha" },
    { id: 4, type: 'certificate', title: "HTML/CSS Sertifikati olindi", time: "2 kun oldin" },
];

const RecentActivity = () => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'course': return <Play className="w-4 h-4 text-primary shadow-gold" />;
            case 'xp': return <Zap className="w-4 h-4 text-primary" />;
            case 'olympiad': return <Trophy className="w-4 h-4 text-primary" />;
            case 'certificate': return <Award className="w-4 h-4 text-primary" />;
            default: return <CheckCircle2 className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/10 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#0B0F1A] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            {getIcon(activity.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{activity.title}</h4>
                                {activity.value && (
                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                        {activity.value}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60">
                                {activity.time}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <button className="w-full py-4 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.3em] border-t border-white/5 font-cinzel">
                Barcha faoliyatni ko'rish
            </button>
        </div>
    );
};

export default RecentActivity;
