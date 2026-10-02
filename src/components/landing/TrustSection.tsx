import { motion } from "framer-motion";
import { ShieldCheck, GraduationCap, Trophy, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

const TrustSection = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: ShieldCheck,
            title: "Shaffof natijalar",
            description: "Barcha olimpiada natijalari real vaqt rejimida hisoblanadi va blokcheyn kabi shaffof tizimda saqlanadi.",
            color: "text-blue-400",
            bg: "bg-blue-400/10"
        },
        {
            icon: GraduationCap,
            title: "Professional mentorlar",
            description: "Xalqaro darajadagi tajribaga ega bo'lgan mutaxassislar va fan olimpiadalari g'oliblaridan bilim oling.",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            icon: Trophy,
            title: "Real mukofotlar",
            description: "G'oliblar nafaqat bilim, balki qimmatbaho sovg'alar va xalqaro sertifikatlarga ega bo'lishadi.",
            color: "text-orange-400",
            bg: "bg-orange-400/10"
        }
    ];

    return (
        <section className="py-16 md:py-24 relative bg-[#0B0F1A] overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-10 md:mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <Badge variant="outline" className="px-6 py-1.5 text-xs md:text-sm border-primary/30 text-primary bg-primary/5 backdrop-blur-sm font-black uppercase tracking-widest">
                            Nega HOGWORDS?
                        </Badge>
                    </motion.div>
                    <h2 className="text-3xl md:text-6xl font-black text-white font-cinzel tracking-tight leading-tight px-4">
                        G‘alaba <span className="text-primary italic">Tasodif</span> Emas
                    </h2>
                </div>

                <div className="relative">
                    {/* Desktop View (Grid) */}
                    <div className="hidden md:grid grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <TrustCard key={idx} feature={feature} idx={idx} />
                        ))}
                    </div>

                    {/* Mobile View (Carousel) */}
                    <div className="md:hidden mx-auto max-w-[90vw]">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            plugins={[
                                Autoplay({
                                    delay: 5000,
                                }),
                            ]}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {features.map((feature, idx) => (
                                    <CarouselItem key={idx} className="pl-4 basis-[90%]">
                                        <TrustCard feature={feature} idx={idx} />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Extracted TrustCard for reuse
const TrustCard = ({ feature, idx }: { feature: any, idx: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.1 }}
        viewport={{ once: true }}
        className="p-6 md:p-8 rounded-[1.5rem] bg-[#111827] border border-white/5 hover:border-primary/20 transition-all duration-300 group flex items-start md:flex-col gap-4 md:gap-0 h-full shadow-sm"
    >
        <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-xl md:rounded-2xl ${feature.bg} flex items-center justify-center md:mb-6 group-hover:scale-105 transition-transform`}>
            <feature.icon className={`w-6 h-6 md:w-8 md:h-8 ${feature.color}`} />
        </div>
        <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-cinzel">{feature.title}</h3>
            <p className="text-secondary/80 text-sm md:text-base font-medium leading-relaxed line-clamp-2 md:line-clamp-none">
                {feature.description}
            </p>
        </div>
    </motion.div>
);

export default TrustSection;
