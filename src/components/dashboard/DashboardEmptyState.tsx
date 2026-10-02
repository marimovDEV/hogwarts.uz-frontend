import { API_URL, getAuthHeader, getImageUrl } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BookOpen, Zap, Award, Trophy, ArrowRight, Sparkles } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const Icon = (LucideIcons as any)[name];
    if (!Icon) return <Zap className={className} />;
    return <Icon className={className} />;
};

interface Course {
    id: number;
    title: string;
    description?: string;
    thumbnail?: string;
    price: number;
    level: string;
    lessons_count: number;
    students_count: number;
    subject?: {
        name: string;
        icon: string;
        color: string;
    };
}

interface Subject {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
    courses_count: number;
}

interface Profession {
    id: number;
    name: string;
    description: string;
    icon?: string;
    color?: string;
}

interface DashboardEmptyStateProps {
    recommendedCourses?: Course[];
    featuredSubjects?: Subject[];
    featuredProfessions?: Profession[];
}

const DashboardEmptyState = ({
    recommendedCourses = [],
    featuredSubjects = [],
    featuredProfessions = []
}: DashboardEmptyStateProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const benefits = [
        {
            icon: Zap,
            title: t('dashboard.emptyState.benefits.xp', 'Har bir dars uchun XP yig\'ing'),
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        },
        {
            icon: Trophy,
            title: t('dashboard.emptyState.benefits.streak', 'Kunlik Streak to\'plang'),
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
        },
        {
            icon: Award,
            title: t('dashboard.emptyState.benefits.certificate', 'Sertifikat oling'),
            color: 'text-primary',
            bg: 'bg-primary/10'
        }
    ];

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-3xl mb-12"
            >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-bold">{t('dashboard.emptyState.badge', 'Yangi boshlanish')}</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                    {t('dashboard.emptyState.title', 'O\'rganishni bugun boshlang!')}
                </h1>

                <p className="text-lg text-muted-foreground mb-8">
                    {t('dashboard.emptyState.subtitle', 'Kurslardan birini tanlab, XP yig\'ishni boshlang')}
                </p>

                <Button
                    size="lg"
                    onClick={() => navigate('/courses')}
                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary-dark text-background px-8 py-6 text-lg font-black rounded-2xl shadow-gold hover:scale-105 transition-all font-cinzel"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {t('dashboard.emptyState.cta', 'Kurslarni ko\'rish')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full mb-12"
            >
                {benefits.map((benefit, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                        <div className={`w-12 h-12 rounded-xl ${benefit.bg} flex items-center justify-center shrink-0`}>
                            <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                        </div>
                        <p className="text-sm font-bold text-foreground">{benefit.title}</p>
                    </div>
                ))}
            </motion.div>

            {/* Recommended Courses */}
            {recommendedCourses.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-full max-w-6xl"
                >
                    <h2 className="text-2xl font-black text-foreground mb-6 text-center">
                        {t('dashboard.emptyState.recommendedTitle', 'Tavsiya etilgan kurslar')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedCourses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/course/${course.id}`)}
                                className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                            >
                                {/* Course Thumbnail */}
                                {course.thumbnail ? (
                                    <div className="relative h-40 overflow-hidden">
                                        <img
                                            src={getImageUrl(course.thumbnail)}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    </div>
                                ) : (
                                    <div className={`h-40 ${course.subject?.color || 'bg-primary/20'} flex items-center justify-center relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                                        <BookOpen className="w-16 h-16 text-primary/50 relative z-10" />
                                    </div>
                                )}

                                {/* Course Info */}
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>

                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                                        <span>{course.lessons_count} dars</span>
                                        <span>{course.level}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            {Number(course.price) === 0 ? (
                                                <span className="text-green-500 font-bold">TEKIN</span>
                                            ) : (
                                                <span className="font-bold text-foreground">{Number(course.price).toLocaleString()} AC</span>
                                            )}
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Featured Subjects */}
            {featuredSubjects.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="w-full max-w-6xl mt-12"
                >
                    <h2 className="text-xl font-bold text-foreground mb-6 text-center">
                        {t('dashboard.emptyState.subjectsTitle', 'Yo\'nalishlar bo\'yicha kashf qiling')}
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {featuredSubjects.map((subject) => (
                            <div
                                key={subject.id}
                                onClick={() => navigate(`/courses?subject=${subject.slug}`)}
                                className="group p-4 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-md transition-all cursor-pointer text-center"
                            >
                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${subject.color || 'bg-primary/10 text-primary'}`}>
                                    {subject.icon ? <DynamicIcon name={subject.icon} className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                </div>
                                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{subject.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{subject.courses_count} kurslar</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Featured Professions */}
            {featuredProfessions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="w-full max-w-6xl mt-12"
                >
                    <h2 className="text-xl font-bold text-foreground mb-6 text-center">
                        {t('dashboard.emptyState.professionsTitle', 'Zamonaviy kasblar')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {featuredProfessions.map((prof) => (
                            <div
                                key={prof.id}
                                onClick={() => navigate(`/professions/${prof.id}`)}
                                className="group p-6 bg-gradient-to-br from-card to-accent/5 border border-border rounded-2xl hover:border-primary/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${prof.color || 'bg-primary/10 text-primary'}`}>
                                        {prof.icon ? <DynamicIcon name={prof.icon} className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{prof.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-primary font-bold italic">
                                            <span>Roadmap ko'rish</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{prof.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DashboardEmptyState;
