import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getBaseUrl } from "@/services/api";
import { homepageService, Mentor } from "@/services/homepageService";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    ArrowLeft,
    GraduationCap,
    CheckCircle,
    Play,
    Star,
    Users,
    ArrowRight,
    Instagram,
    Linkedin,
    Github,
    Globe
} from "lucide-react";
import { getSubjectTheme } from "@/lib/course-themes";
import * as Icons from "lucide-react";

const PublicTeacherProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const [mentor, setMentor] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const mentorData = await homepageService.getMentorById(id);
                setMentor(mentorData);

                // Fetch courses for this teacher
                const coursesData = await homepageService.getPublicCourses({ teacher: id });
                setCourses(Array.isArray(coursesData) ? coursesData : coursesData.results || []);
            } catch (err) {
                console.error("Failed to fetch mentor profile:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!mentor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-black mb-4 font-cinzel">{t('error.not_found')}</h1>
                <Link to="/">
                    <Button className="rounded-xl font-bold">{t('nav.home')}</Button>
                </Link>
            </div>
        );
    }

    const lang = i18n.language === 'ru' ? 'ru' : 'uz';
    const bio = mentor[`bio_${lang}`] || mentor.bio_uz || "";

    return (
        <main className="min-h-screen pb-20 relative overflow-hidden bg-[#0B0F1A]">
            {/* Subtle Magic Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-20"
                    style={{
                        background: `radial-gradient(circle at 50% 0%, rgba(250,204,21,0.15), transparent 70%)`
                    }}
                />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <Link to="/teachers" className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-12 group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        {t('profile.back_to_list')}
                    </Link>
                    <div className="grid lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-4">
                            <div className="relative group">
                                <div className="absolute -inset-6 bg-primary/20 rounded-[3rem] blur-3xl group-hover:bg-primary/30 transition-all duration-700 opacity-40" />
                                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                    <img
                                        src={mentor.image?.startsWith('http') ? mentor.image : `${getBaseUrl()}${mentor.image}`}
                                        alt={mentor.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&size=600&background=FACC15&color=0B0F1A`;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60" />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-10">
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Badge variant="outline" className="px-6 py-1.5 text-sm border-primary/30 text-primary bg-primary/5 backdrop-blur-sm font-black uppercase tracking-widest">
                                        <GraduationCap className="w-4 h-4 mr-2" />
                                        MENTOR PROFILE
                                    </Badge>
                                </motion.div>
                                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none font-cinzel">
                                    {mentor.name}
                                </h1>
                                <p className="text-2xl md:text-3xl text-primary font-black italic font-cinzel gold-glow">
                                    {mentor.position} @ {mentor.company}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-12 items-center border-y border-white/5 py-10">
                                <div className="space-y-2">
                                    <span className="text-[10px] text-secondary font-black uppercase tracking-widest">{t('profile.experience')}</span>
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        </div>
                                        <span className="text-3xl font-black font-cinzel">{parseInt(String(mentor.experience)) || 0} {t('common.years', 'yil')}</span>
                                    </div>
                                </div>
                                <div className="hidden md:block w-px h-12 bg-white/5" />
                                <div className="space-y-2">
                                    <span className="text-[10px] text-secondary font-black uppercase tracking-widest">{t('profile.students')}</span>
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-primary" />
                                        </div>
                                        <span className="text-3xl font-black font-cinzel">{mentor.students_count?.toLocaleString() || "0"}</span>
                                    </div>
                                </div>
                                <div className="hidden md:block w-px h-12 bg-white/5" />
                                <div className="space-y-2">
                                    <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Ijtimoiy tarmoqlar</span>
                                    <div className="flex items-center gap-3">
                                        {mentor.social_links?.instagram && (
                                            <a href={mentor.social_links.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-primary hover:text-background hover:border-primary transition-all">
                                                <Instagram className="w-6 h-6" />
                                            </a>
                                        )}
                                        {mentor.social_links?.linkedin && (
                                            <a href={mentor.social_links.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-primary hover:text-background hover:border-primary transition-all">
                                                <Linkedin className="w-6 h-6" />
                                            </a>
                                        )}
                                        {mentor.social_links?.github && (
                                            <a href={mentor.social_links.github} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-primary hover:text-background hover:border-primary transition-all">
                                                <Github className="w-6 h-6" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About & Courses */}
            <section className="py-24 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-12 gap-20">
                        <div className="lg:col-span-8 space-y-20">
                            <div className="space-y-8">
                                <h2 className="text-4xl font-black text-white font-cinzel border-l-4 border-primary pl-8 tracking-tight">
                                    BIOGRAFIYA
                                </h2>
                                <div className="text-[#94A3B8] text-xl leading-relaxed whitespace-pre-wrap font-medium italic">
                                    {bio || "Bu mentor haqida qo'shimcha ma'lumot kiritilmagan."}
                                </div>
                            </div>

                            <div className="space-y-12">
                                <h2 className="text-4xl font-black text-white font-cinzel border-l-4 border-primary pl-8 tracking-tight">
                                    MENTOR KURSLARI
                                </h2>

                                {courses.length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-10">
                                        {courses.map((course) => {
                                            const theme = getSubjectTheme(course.subject_name || course.subject || "");
                                            const DynamicIcon = (Icons as any)[theme.icon] || Icons.BookOpen;

                                            return (
                                                <div key={course.id} className="group bg-[#111827] rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-primary/30 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl">
                                                    <div className="h-56 relative overflow-hidden">
                                                        <img
                                                            src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${getBaseUrl()}${course.thumbnail}`) : theme.fallbackImage}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            alt={course.title}
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-[#111827]/40 group-hover:bg-[#111827]/20 transition-colors" />
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                            <DynamicIcon className="w-8 h-8 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="p-8 space-y-6 flex-1 flex flex-col">
                                                        <h3 className="font-black text-2xl text-white group-hover:text-primary transition-colors font-cinzel leading-tight">{course.title}</h3>
                                                        <div className="flex items-center justify-between text-[10px] text-[#64748B] uppercase font-black tracking-widest">
                                                            <div className="flex items-center gap-2"><Play className="w-4 h-4 text-primary" /> {course.lessons_count} Dars</div>
                                                            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-primary fill-primary" /> {Number(course.rating || 0).toFixed(1)}</div>
                                                        </div>
                                                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                            <div className="font-black text-2xl text-white font-cinzel">
                                                                {Number(course.price) === 0 ? "TEKIN" : `${Number(course.price).toLocaleString()} AC`}
                                                            </div>
                                                            <Link to={`/course/${course.id}`}>
                                                                <Button className="h-12 px-6 rounded-xl bg-primary text-background font-black shadow-lg hover:bg-yellow-500 transition-all active:scale-95 flex items-center gap-2 group/btn">
                                                                    Kirish <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-16 text-center bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-sm">
                                        <p className="text-[#64748B] font-black uppercase tracking-widest text-sm">Hozircha mentor kurslari topilmadi.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-10 space-y-10 sticky top-32 backdrop-blur-md">
                                <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">{t('profile.bio_title')}</h4>
                                <ul className="space-y-6">
                                    {[
                                        "Professional tajriba",
                                        "Amaliy loyihalar",
                                        "Doimiy fikr-mulohaza",
                                        "Sertifikat bilan taqdirlash"
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-4 text-sm font-black text-secondary uppercase tracking-wide">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                <CheckCircle className="w-4 h-4 text-primary" />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-6">
                                    <Link to="/all-courses">
                                        <Button className="w-full h-16 rounded-2xl bg-primary text-background font-black text-xl shadow-gold hover:-translate-y-1 transition-all active:scale-95">
                                            Barcha kurslar
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default PublicTeacherProfilePage;
