import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, Quote, Sparkles, Instagram, Github, Linkedin, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useRef, useState, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { homepageService, Mentor } from "@/services/homepageService";
import { getBaseUrl } from "@/services/api";
import { API_URL } from "@/services/api";

const TeachersSection = () => {
    const { t, i18n } = useTranslation();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const plugin = useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    useEffect(() => {
        const fetchMentors = async () => {
            setIsLoading(true);
            try {
                const data = await homepageService.getMentors();
                const lang = i18n.language === 'ru' ? 'ru' : 'uz';
                const mapped = data.map((item: any) => {
                    const baseUrl = getBaseUrl();
                    const imageUrl = item.image
                        ? (item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=400&background=FACC15&color=0B0F1A`;

                    return {
                        id: item.id,
                        name: item.name,
                        role: item.position,
                        experience: item.experience,
                        students_count: item.students_count,
                        image: imageUrl,
                        companies: [item.company],
                        bio: item[`bio_${lang}`] || item.bio_uz,
                    };
                });

                if (mapped.length > 0) {
                    setTeachers(mapped);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMentors();
    }, [i18n.language]);

    if (!isLoading && teachers.length === 0) return null;

    return (
        <section id="mentors" className="py-32 bg-[#0B0F1A] relative overflow-hidden">
            {/* Background Decorations - Subtle Magic */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-10"
                    style={{
                        background: `radial-gradient(circle at 50% 0%, rgba(250,204,21,0.2), transparent 70%)`
                    }}
                />
            </div>

            <div className="container relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                    <div className="text-left space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <Badge variant="outline" className="px-6 py-1.5 text-[10px] md:text-xs border-primary/30 text-primary bg-primary/5 backdrop-blur-sm font-bold tracking-wider">
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('teachers.badge', "Kuchli jamoa")}
                            </Badge>
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-cinzel">
                            {t('teachers.title')} <span className="text-primary italic gold-glow">{t('teachers.mentors', 'mentorlar')}</span>
                        </h2>
                        <p className="text-lg text-[#94A3B8] max-w-2xl font-medium text-secondary/80 font-cinzel leading-relaxed">
                            {t('teachers.description', "O'z sohasining haqiqiy professionallaridan bilim oling.")}
                        </p>
                    </div>

                    <Link to="/teachers" className="shrink-0">
                        <Button className="h-12 md:h-14 px-8 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:border-primary/50 hover:bg-white/10 transition-all group active:scale-95 shadow-sm">
                            Barcha mentorlar
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <Carousel
                    plugins={[plugin.current]}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                    className="w-full relative"
                >
                    <CarouselContent className="-ml-6 md:-ml-10">
                        {teachers.map((teacher, index) => (
                            <CarouselItem key={teacher.id} className="pl-6 md:pl-10 md:basis-1/2 lg:basis-1/3">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group relative bg-[#111827] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300 h-full flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5"
                                >
                                    <div className="md:hidden p-6 flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full border-2 border-primary/20 overflow-hidden mb-4">
                                            <img
                                                src={teacher.image}
                                                alt={teacher.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-1 font-cinzel">{teacher.name}</h3>
                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-4">{teacher.role}</p>
                                        <Link to={`/teacher-profile/${teacher.id}`} className="w-full">
                                            <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 font-black text-xs uppercase tracking-widest text-[#64748B] hover:text-primary">
                                                {t('teachers.more', 'Batafsil')}
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Desktop Card Content */}
                                    <div className="hidden md:block">
                                        <div className="relative aspect-[4/5] overflow-hidden">
                                            <img
                                                src={teacher.image}
                                                alt={teacher.name}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&size=400&background=FACC15&color=0B0F1A`;
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/30 to-transparent opacity-80" />

                                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                                <div className="w-12 h-1 bg-primary mb-4 rounded-full group-hover:w-20 transition-all duration-500" />
                                                <h3 className="text-2xl font-black leading-tight mb-2 group-hover:text-primary transition-colors font-cinzel">{teacher.name}</h3>
                                                <p className="text-xs text-primary/80 font-black uppercase tracking-widest">{teacher.role}</p>
                                            </div>
                                        </div>

                                        <div className="p-8 flex flex-col flex-1 relative bg-[#111827]">
                                            <Quote className="absolute top-4 right-8 w-12 h-12 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {teacher.companies.map((company: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="px-3 py-1 text-[10px] font-black uppercase bg-white/5 text-[#64748B] border-white/10">
                                                        {company}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <p className="text-sm text-[#94A3B8] font-medium mb-8 line-clamp-3 italic leading-relaxed">
                                                "{teacher.bio || t('teachers.default_bio', "Kelajak bunyodkorlariga bilim ulashish yo'lida.")}"
                                            </p>
                                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-white tracking-wider">
                                                        {parseInt(String(teacher.experience)) || 0} {t('teachers.experience_suffix', 'yil tajriba')}
                                                    </span>
                                                </div>
                                                <Link to={`/teacher-profile/${teacher.id}`}>
                                                    <Button variant="ghost" className="h-10 px-4 font-black text-primary hover:bg-primary/5 rounded-xl group/btn transition-all uppercase tracking-widest text-[10px]">
                                                        {t('teachers.more', 'Batafsil')}
                                                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <div className="hidden md:flex items-center justify-center gap-6 mt-16">
                        <CarouselPrevious className="static translate-y-0 h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:border-primary hover:bg-white/10 text-white transition-all shadow-lg shadow-black/20" />
                        <CarouselNext className="static translate-y-0 h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:border-primary hover:bg-white/10 text-white transition-all shadow-lg shadow-black/20" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
};

export default TeachersSection;
