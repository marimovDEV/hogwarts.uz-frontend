import { motion } from "framer-motion";
import { UserPlus, BookOpen, Trophy, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

const TimelineSection = () => {
    const { t } = useTranslation();

    const steps = [
        { icon: UserPlus, title: "Ro‘yxatdan o‘ting", desc: "Platformamizda tezkor ro'yxatdan o'ting" },
        { icon: BookOpen, title: "Tayyorlaning", desc: "Ekspertlarimiz kursi bilan bilimingizni boyiting" },
        { icon: Trophy, title: "Olimpiadada qatnashing", desc: "O'z mahoratingizni sinab ko'ring" },
        { icon: Award, title: "Mukofot oling", desc: "Sertifikat va qimmatbaho sovrinlarga ega bo'ling" },
    ];

    return (
        <section className="py-24 bg-[#0B0F1A]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white font-cinzel">Qanday <span className="text-primary italic">ishlaydi?</span></h2>
                    <p className="text-secondary max-w-xl mx-auto font-medium tracking-tight">Oddiy 4 qadamda o'z g'alabangiz sari yo'l oling.</p>
                </div>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent hidden lg:block -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="relative mb-8">
                                    <div className="w-20 h-20 rounded-[2.5rem] bg-[#111827] border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-all duration-500 shadow-xl group-hover:shadow-primary/10">
                                        <step.icon className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-black text-xs border-4 border-[#0B0F1A]">
                                        {index + 1}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-white mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                                <p className="text-secondary text-sm font-medium leading-relaxed max-w-[200px]">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TimelineSection;
