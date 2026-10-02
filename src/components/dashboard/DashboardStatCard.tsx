import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color: string;
    delay?: number;
}

const DashboardStatCard = ({ label, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            className="bg-[#111827] border border-white/5 p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
        >
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/10 group-hover:bg-primary group-hover:text-background transition-all duration-500">
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend && (
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest leading-none">
                                {trend}
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    <p className="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-2 font-cinzel opacity-60">
                        {label}
                    </p>
                    <h3 className="text-3xl font-black text-white tracking-tighter gold-glow">
                        {value}
                    </h3>
                </div>
            </div>

            {/* Subtle Magic Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors" />
        </motion.div>
    );
};

export default DashboardStatCard;
