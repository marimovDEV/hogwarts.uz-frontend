import { Link } from "react-router-dom";
import { useState, useEffect, memo } from "react";
import { ChevronRight, Code, Palette, Calculator, Database, Globe } from "lucide-react";
import { homepageService } from "@/services/homepageService";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import { getLucideIcon } from "@/lib/icon-utils";


const ProfessionCard = memo(({ prof, t }: { prof: any; t: any }) => {
    return (
        <Link to={`/profession/${prof.id}`} className="block h-full group">
            <div className="h-full bg-[#111827] rounded-[2.5rem] border border-white/5 p-8 transition-all duration-500 hover:border-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden flex flex-col items-center text-center gold-glow-hover">

                {/* Gold Accent Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className={`w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-primary/20`}>
                    <prof.icon className="w-10 h-10 text-primary" />
                </div>

                <h3 className="text-xl font-black text-white mb-2 group-hover:text-primary transition-colors font-cinzel line-clamp-1">{prof.name}</h3>
                <p className="text-xs font-black text-secondary tracking-widest uppercase mb-6">
                    {prof.coursesCount} {t('professions.courses_count')}
                </p>

                <div className="mt-auto w-full space-y-6">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-widest bg-white/5 py-2 px-4 rounded-xl inline-block border border-white/5">
                        {t('professions.avg_salary')}: <span className="text-primary">{prof.salary}</span>
                    </div>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 text-white font-black hover:bg-primary hover:text-background transition-all group-hover:border-primary/50">
                        {t('professions.view_roadmap')}
                        <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </Link>
    );
});

const ProfessionsCarousel = () => {
    const { t, i18n } = useTranslation();
    const [professions, setProfessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfessions = async () => {
            setIsLoading(true);
            try {
                const data = await homepageService.getProfessions();
                const lang = i18n.language === 'ru' ? 'ru' : 'uz';
                const mapped = data.map((item: any) => ({
                    id: item.id,
                    name: item[`name_${lang}`] || item.name_uz, // Support dynamic key
                    icon: getLucideIcon(item.icon),
                    salary: item.salary,
                    coursesCount: item.courses_count,
                    color: "bg-blue-500", // Default or map from item.icon maybe?
                    link: item.roadmap_link
                }));
                setProfessions(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfessions();
    }, [i18n.language]);

    if (isLoading) return null; // Let global skeleton handle it

    return (
        <section className="py-16 container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-between items-center mb-8"
            >
                <div>
                    <h2 className="text-3xl font-bold text-foreground">
                        {t('professions.title')}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        {t('professions.subtitle')}
                    </p>
                </div>
                <Button variant="outline" asChild className="hidden md:flex rounded-full">
                    <Link to="/professions">
                        {t('professions.all')} <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </motion.div>

            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4 pb-4">
                    {professions.map((prof, index) => (
                        <CarouselItem key={prof.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                            <ProfessionCard prof={prof} t={t} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 hidden md:flex" />
                <CarouselNext className="right-2 hidden md:flex" />
            </Carousel>

            {professions.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full py-12 px-6 rounded-[2rem] bg-gradient-to-br from-primary/5 to-blue-500/5 border border-dashed border-primary/20 flex flex-col items-center text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <Globe className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t('professions.coming_soon')}</h3>
                    <p className="text-muted-foreground max-w-md">
                        {t('professions.coming_soon_desc')}
                    </p>
                </motion.div>
            )}
        </section>
    );
};

export default ProfessionsCarousel;
