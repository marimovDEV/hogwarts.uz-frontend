import { Button } from "@/components/ui/button";
import { Trophy, PlayCircle, FileCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const QuickActions = () => {
    const actions = [
        {
            title: "Olimpiadaga qatnashish",
            desc: "Bilimingizni sinab ko'ring",
            icon: Trophy,
            link: "/olympiads",
            color: "from-primary/20 to-primary/5",
            borderColor: "border-primary/20",
            iconColor: "text-primary"
        },
        {
            title: "Kursni davom ettirish",
            desc: "To'xtagan joyingizdan boshlang",
            icon: PlayCircle,
            link: "/my-courses",
            color: "from-primary/10 to-transparent",
            borderColor: "border-primary/10",
            iconColor: "text-primary"
        },
        {
            title: "Sertifikatlarim",
            desc: "Yutuqlaringizni yuklab oling",
            icon: FileCheck,
            link: "/my-certificates",
            color: "from-green-500/10 to-green-500/5",
            borderColor: "border-green-500/20",
            iconColor: "text-green-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actions.map((action, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Link to={action.link} className="block group">
                        <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${action.color} border ${action.borderColor} p-8 h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/5`}>
                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-[#0B0F1A] border ${action.borderColor} flex items-center justify-center`}>
                                        <action.icon className={`w-7 h-7 ${action.iconColor}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white font-cinzel tracking-tight group-hover:text-primary transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground font-medium italic mt-1 uppercase tracking-widest text-[10px]">
                                            {action.desc}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-primary group-hover:text-background">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};

export default QuickActions;
