import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    PlayCircle,
    Clock,
    Flame,
    BookOpen,
    Plus,
    ArrowRight,
    Loader2,
    Trophy,
    Calendar,
    ChevronRight,
    Search,
    Layers
} from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_URL, getAuthHeader, getImageUrl } from "@/services/api";
import { Badge } from "@/components/ui/badge";

interface Course {
    id: number;
    title: string;
    subject: string;
    thumbnail: string;
    lessons_count: number;
}

interface Enrollment {
    id: number;
    course: Course;
    progress: number;
    current_lesson: number | null;
    created_at: string;
    updated_at: string;
}

const CourseThumbnail = ({ src, title, className, placeholderClassName, iconSize = "w-12 h-12" }: { src?: string, title: string, className?: string, placeholderClassName?: string, iconSize?: string }) => {
    const [error, setError] = useState(false);

    if (src && !error) {
        return (
            <img
                src={getImageUrl(src)}
                alt={title}
                className={className}
                onError={() => setError(true)}
            />
        );
    }

    return (
        <div className={`w-full h-full flex items-center justify-center ${placeholderClassName || 'bg-gradient-to-br from-muted to-muted/50'}`}>
            <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                <Layers className={iconSize} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-50">{title}</span>
            </div>
        </div>
    );
};

const MyCoursesPage = () => {
    const { t } = useTranslation();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadEnrollments();
    }, []);

    const loadEnrollments = async () => {
        try {
            const res = await axios.get(`${API_URL}/courses/my_courses/`, {
                headers: getAuthHeader()
            });

            let list = [];
            const data = res.data;
            if (Array.isArray(data)) list = data;
            else if (data && Array.isArray(data.results)) list = data.results;
            else if (data && Array.isArray(data.enrollments)) list = data.enrollments;
            setEnrollments(list);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getLastAccessedDays = (dateStr: string) => {
        if (!dateStr) return 999;
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    // Sort: Recently accessed first
    const sortedEnrollments = [...enrollments].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return dateB - dateA;
    });

    const heroEnrollment = sortedEnrollments[0];
    const otherEnrollments = sortedEnrollments.slice(1);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto min-h-screen">

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t('dashboard.myCoursesPage.title')}</h1>
                    <p className="text-muted-foreground">{t('dashboard.myCoursesPage.subtitle')}</p>
                </div>
            </div>

            {/* HERO BLOCK */}
            {heroEnrollment && (
                <div className="mb-12 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/10 to-transparent rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden min-h-[400px] flex flex-col lg:flex-row items-stretch">
                        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center space-y-8">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                                    {t('dashboard.myCoursesPage.continueNow')}
                                </Badge>
                                <Badge variant="outline" className="border-border px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                                    {heroEnrollment.course.subject || 'Dasturlash'}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-4xl lg:text-5xl font-black text-foreground leading-[1.1] tracking-tight">
                                    {heroEnrollment.course.title}
                                </h2>
                                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-xl">
                                    O'quv jarayonini davom ettiring va yangi bilimlarni egallang. Sizda hozircha {Math.round(heroEnrollment.progress)}% progress bor.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-8 py-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <span>Progresingiz</span>
                                        <span>{Math.round(heroEnrollment.progress)}%</span>
                                    </div>
                                    <div className="w-48 lg:w-64 h-3 bg-muted rounded-full shadow-inner overflow-hidden">
                                        <div className="h-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-all duration-1000" style={{ width: `${heroEnrollment.progress}%` }} />
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-border/50 hidden md:block" />
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-foreground font-black shadow-sm">
                                        {heroEnrollment.course.lessons_count}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jami darslar</span>
                                        <span className="text-sm font-bold">{t('dashboard.coursesPage.lessons')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-4">
                                <Link to={`/course/${heroEnrollment.course.id}/lesson/${heroEnrollment.current_lesson || ''}`}>
                                    <Button size="lg" className="h-14 px-10 rounded-2xl font-black shadow-2xl shadow-primary/30 text-base group">
                                        <PlayCircle className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" />
                                        {t('dashboard.myCoursesPage.startLesson')}
                                    </Button>
                                </Link>
                                <Link to={`/course/${heroEnrollment.course.id}`}>
                                    <Button variant="ghost" size="lg" className="h-14 px-8 rounded-2xl font-bold border border-border/50 hover:bg-background">
                                        Kurs sahifasi
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-[45%] bg-muted/30 relative overflow-hidden flex items-center justify-center p-8 lg:p-12 border-l border-border/50">
                            <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-700 border-4 border-card group-hover:shadow-primary/10">
                                <CourseThumbnail
                                    src={heroEnrollment.course.thumbnail}
                                    title={heroEnrollment.course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    placeholderClassName="bg-gradient-to-br from-primary to-purple-600 text-white/20"
                                    iconSize="w-32 h-32"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            )}

            {/* Other Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {otherEnrollments.map((item) => {
                    const days = getLastAccessedDays(item.updated_at || item.created_at);
                    const isAtRisk = days > 5;

                    return (
                        <div key={item.id} className="group bg-card rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-border flex flex-col">
                            <div className="h-48 relative overflow-hidden bg-muted">
                                <CourseThumbnail
                                    src={item.course.thumbnail}
                                    title={item.course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    placeholderClassName="bg-gradient-to-br from-muted to-muted/50"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />
                                <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-md text-foreground border-none rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-xl">
                                    {item.course.subject}
                                </Badge>
                                {isAtRisk && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-orange-500/90 backdrop-blur-md text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl animate-bounce">
                                        <Clock className="w-3 h-3" /> Qaytish vaqti keldi!
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex flex-col flex-1 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {days === 0 ? t('dashboard.myCoursesPage.today') : days === 1 ? t('dashboard.myCoursesPage.yesterday') : `${days} kundan beri`}</span>
                                        <span className="flex items-center gap-1 text-primary"><Trophy className="w-3 h-3" /> {Math.round(item.progress)}%</span>
                                    </div>
                                    <h3 className="font-black text-xl line-clamp-2 leading-tight text-foreground transition-colors group-hover:text-primary min-h-[3rem]">
                                        {item.course.title}
                                    </h3>
                                </div>

                                <div className="bg-muted/30 rounded-2xl p-4 border border-border/50 space-y-3">
                                    <div className="space-y-1.5">
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.3)]" style={{ width: `${item.progress}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {item.course.lessons_count} Darslar</span>
                                        <span className="text-foreground">Progress</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Link to={`/course/${item.course.id}/lesson/${item.current_lesson || ''}`} className="block w-full">
                                        <Button variant="outline" className="w-full h-12 rounded-2xl border-border hover:border-primary hover:bg-primary hover:text-white transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] group/btn">
                                            Davom ettirish
                                            <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Add New Course Card */}
                <Link to="/courses" className="flex flex-col items-center justify-center p-8 bg-muted/20 border-3 border-dashed border-border/50 rounded-[2.5rem] hover:border-primary/50 hover:bg-background hover:shadow-xl transition-all duration-500 group cursor-pointer h-full min-h-[350px] text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-all shadow-inner">
                        <Plus className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-black text-xl text-foreground">{t('dashboard.myCoursesPage.addNew')}</h3>
                        <p className="text-sm font-medium text-muted-foreground max-w-[200px] leading-relaxed">
                            Yangi bilimlar va ko'nikmalar uchun kurslar katalogini ko'rib chiqing.
                        </p>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold border-border/50">
                        Katalogga o'tish
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default MyCoursesPage;
