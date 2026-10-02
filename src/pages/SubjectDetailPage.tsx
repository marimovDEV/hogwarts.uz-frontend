import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
    BookOpen, Trophy, GraduationCap, ArrowRight, Clock, Users, Star,
    Loader2, Map, Layout, CheckCircle2, Lock, Sparkles, Target, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { API_URL, getImageUrl } from "@/services/api";
import * as Icons from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface Course {
    id: number;
    title: string;
    thumbnail: string | null;
    price: number;
    level: string;
    lesson_count: number;
}

interface Olympiad {
    id: number;
    title: string;
    slug: string;
    start_date: string;
    status: string;
    price: number;
}

interface RoadmapStep {
    id: number;
    title: string;
    description: string;
    step_type: string;
    step_type_display: string;
    course_id: number | null;
    course_title: string | null;
    is_mandatory: boolean;
    is_course_completed: boolean;
    order: number;
}

interface Profession {
    id: number;
    name: string;
    icon: string;
    color: string;
    percentage: number;
    required_xp: number;
    roadmap_steps: RoadmapStep[];
}

interface SubjectDetail {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    xp_reward: number;
    total_xp_available: number;
    courses_count: number;
    olympiads_count: number;
    professions_count: number;
    courses: Course[];
    olympiads: Olympiad[];
    professions: Profession[];
}

const SubjectDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [subject, setSubject] = useState<SubjectDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchSubject = async () => {
            try {
                const res = await axios.get(`${API_URL}/subjects/${slug}/`);
                setSubject(res.data);
            } catch (err) {
                setError("Fan topilmadi");
            } finally {
                setLoading(false);
            }
        };
        fetchSubject();
    }, [slug]);

    const categorizedCourses = useMemo(() => {
        if (!subject) return { BEGINNER: [], INTERMEDIATE: [], ADVANCED: [] };
        return subject.courses.reduce((acc: any, course) => {
            const level = course.level || 'BEGINNER';
            if (!acc[level]) acc[level] = [];
            acc[level].push(course);
            return acc;
        }, { BEGINNER: [], INTERMEDIATE: [], ADVANCED: [] });
    }, [subject]);

    const renderIcon = (iconName: string, className = "w-6 h-6") => {
        const Icon = (Icons as any)[iconName] || Icons.BookOpen;
        return <Icon className={className} />;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !subject) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">{error || "Fan topilmadi"}</h1>
                <Link to="/subjects">
                    <Button>Barcha fanlar</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Ecosystem Header */}
            <div className={`relative overflow-hidden bg-slate-950 text-white border-b border-white/5`}>
                {/* Decorative background elements */}
                <div className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l opacity-20 blur-3xl pointer-events-none ${subject.color.replace('bg-', 'from-')}`} />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 pointer-events-none" />

                <div className="container mx-auto px-4 py-12 relative">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`w-24 h-24 sm:w-32 sm:h-32 rounded-3xl p-0.5 bg-gradient-to-br ${subject.color.replace('bg-', 'from-')} to-white/20 shadow-2xl shadow-primary/20`}
                        >
                            <div className="w-full h-full bg-slate-900/90 rounded-[calc(1.5rem-2px)] flex items-center justify-center">
                                {renderIcon(subject.icon, "w-12 h-12 sm:w-16 sm:h-16 text-white")}
                            </div>
                        </motion.div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md">
                                    <Sparkles className="w-3 h-3 mr-1 text-yellow-400" />
                                    Learning Ecosystem
                                </Badge>
                                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground border-none">
                                    {subject.courses_count} Kurslar • {subject.professions_count} Kasblar
                                </Badge>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                {subject.name}
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl balance">
                                {subject.description || `${subject.name} yo'nalishida mukammal bilim oling va o'z karyerangizni quring.`}
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full md:w-80 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    <span className="font-bold text-sm uppercase tracking-wider text-slate-400">Total XP</span>
                                </div>
                                <span className="text-2xl font-black text-primary">{subject.total_xp_available}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
                                    <span>Progress</span>
                                    <span>Soon</span>
                                </div>
                                <Progress value={0} className="h-2 bg-white/5" />
                                <p className="text-[10px] text-slate-500 text-center mt-2 italic">
                                    Kurslarni tugatib XP ballarini jamlang
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12">
                <Tabs defaultValue="courses" className="space-y-8">
                    <div className="flex justify-center">
                        <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 border border-slate-200">
                            {[
                                { id: 'courses', label: 'Kurslar', icon: BookOpen },
                                { id: 'olympiads', label: 'Olimpiadalar', icon: Trophy },
                                { id: 'careers', label: 'Kasblar', icon: GraduationCap },
                                { id: 'roadmap', label: 'Roadmap', icon: Map },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="rounded-xl px-4 sm:px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-bold gap-2"
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* Courses Tab */}
                    <TabsContent value="courses" className="space-y-12">
                        {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((level) => (
                            categorizedCourses[level]?.length > 0 && (
                                <div key={level} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-8 w-1 rounded-full ${level === 'BEGINNER' ? 'bg-green-500' : level === 'INTERMEDIATE' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                        <h2 className="text-2xl font-black tracking-tight capitalize">
                                            {t(`levels.${level}`)} Kurslar
                                        </h2>
                                        <Badge variant="outline" className="ml-auto">
                                            {categorizedCourses[level].length}
                                        </Badge>
                                    </div>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {categorizedCourses[level].map((course: Course) => (
                                            <Link key={course.id} to={`/course/${course.id}`}>
                                                <Card className="overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group border-slate-200">
                                                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                                        {course.thumbnail ? (
                                                            <img src={getImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <BookOpen className="w-12 h-12 text-slate-300" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <Badge className="absolute top-3 right-3 shadow-xl backdrop-blur-md bg-white/90 text-slate-900 border-none">
                                                            {Number(course.price) === 0 ? "Tekin" : `${course.price} AC`}
                                                        </Badge>
                                                    </div>
                                                    <CardContent className="p-5">
                                                        <h3 className="font-black text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-3">
                                                            {course.title}
                                                        </h3>
                                                        <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Layout className="w-4 h-4 text-slate-400" />
                                                                    {course.lesson_count} dars
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <Zap className="w-4 h-4 text-yellow-500" />
                                                                    100 XP
                                                                </span>
                                                            </div>
                                                            <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </TabsContent>

                    {/* Olympiads Tab */}
                    <TabsContent value="olympiads" className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subject.olympiads.map((olympiad) => (
                                <Link key={olympiad.id} to={`/olympiad/${olympiad.slug}`}>
                                    <Card className="p-8 hover:shadow-2xl transition-all group border-none bg-slate-50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
                                        <Trophy className="w-10 h-10 text-amber-500 mb-6" />
                                        <h3 className="font-black text-xl mb-4 group-hover:text-primary transition-colors">
                                            {olympiad.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500 mb-6">
                                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm">
                                                <Clock className="w-4 h-4 text-primary" />
                                                {new Date(olympiad.start_date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm">
                                                <Target className="w-4 h-4 text-primary" />
                                                {olympiad.status === 'UPCOMING' ? "Tez kunda" : "Davom etmoqda"}
                                            </div>
                                        </div>
                                        <Button className="w-full rounded-xl font-bold gap-2">
                                            Qatnashish
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Careers Tab */}
                    <TabsContent value="careers" className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {subject.professions.map((profession) => (
                                <Link key={profession.id} to={`/profession/${profession.id}`}>
                                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-slate-200">
                                        <CardHeader className="pb-4">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${profession.color} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                                                {renderIcon(profession.icon, "w-7 h-7")}
                                            </div>
                                            <CardTitle className="text-2xl font-black leading-tight">{profession.name}</CardTitle>
                                            <CardDescription className="line-clamp-2">Mutaxassis bo'lish uchun zarur qadamlarni biling</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                                                    <span>Tayyorgarlik darajasi</span>
                                                    <span className="text-primary">{profession.percentage}%</span>
                                                </div>
                                                <Progress value={profession.percentage} className="h-2.5 bg-slate-100" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                                                    <div className="text-[10px] font-black uppercase text-slate-400 mb-1">XP Kerak</div>
                                                    <div className="font-black text-slate-900">{profession.required_xp || 1000}</div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                                                    <div className="text-[10px] font-black uppercase text-slate-400 mb-1">Muddati</div>
                                                    <div className="font-black text-slate-900">3-6 oy</div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="w-full group-hover:bg-slate-100 rounded-xl font-bold gap-2">
                                                Yo'l xaritasini ko'rish
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Roadmap Tab */}
                    <TabsContent value="roadmap" className="relative p-6 sm:p-12 bg-slate-50 rounded-[3rem] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none" />

                        <div className="max-w-4xl mx-auto space-y-24 relative">
                            {subject.professions[0]?.roadmap_steps?.map((step, idx) => (
                                <div key={step.id} className={`flex flex-col md:flex-row items-center gap-12 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="flex-1 text-center md:text-right">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full mb-4 text-xs font-black uppercase tracking-wider ${step.is_course_completed ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {step.step_type_display}
                                            {step.is_course_completed && <CheckCircle2 className="w-3 h-3" />}
                                        </div>
                                        <h3 className="text-2xl font-black mb-3">{step.title}</h3>
                                        <p className="text-slate-500 font-medium">{step.description}</p>
                                    </div>

                                    <div className="relative z-10">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white ${step.is_course_completed ? 'bg-green-500 text-white' : 'bg-white text-slate-300'}`}
                                        >
                                            <span className="text-xl font-black">{idx + 1}</span>
                                        </motion.div>
                                        {idx < (subject.professions[0].roadmap_steps.length - 1) && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-24 bg-gradient-to-b from-slate-200 to-transparent" />
                                        )}
                                    </div>

                                    <div className="flex-1 flex justify-center md:justify-start">
                                        {step.course_id ? (
                                            <Link to={`/course/${step.course_id}`}>
                                                <Card className="w-64 p-4 hover:shadow-xl transition-all border-slate-200 group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                            <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[10px] font-black uppercase text-slate-400">Kurs</div>
                                                            <div className="font-bold text-sm truncate">{step.course_title}</div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Link>
                                        ) : (
                                            <div className="w-64 h-20 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-bold italic text-sm">
                                                Tez kunda...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Final Profession Goal */}
                            <div className="text-center pt-12">
                                <motion.div
                                    className="inline-block p-1 bg-gradient-to-br from-yellow-400 via-primary to-purple-600 rounded-[2.5rem] shadow-2xl"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <div className="bg-slate-950 text-white px-12 py-10 rounded-[calc(2.5rem-4px)]">
                                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                                        <h2 className="text-3xl font-black mb-2">{subject.professions[0]?.name || 'Professional'}</h2>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-8">Full Mastery Unlocked</p>
                                        <Badge variant="outline" className="border-white/20 text-white px-6 py-2 rounded-full font-black">
                                            CERTIFICATE & BADGE
                                        </Badge>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default SubjectDetailPage;
