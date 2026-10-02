import { API_URL as API_BASE, getImageUrl } from "@/services/api";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Clock, BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

interface Course {
    id: number;
    title: string;
    thumbnail: string;
    progress: number;
    subject: string;
}

interface Enrollment {
    id: number;
    course: Course;
    progress: number;
    created_at: string;
    xp_earned?: number;
    total_xp_available?: number;
}


const SmartCourseList = ({ courses }: { courses?: Enrollment[] }) => {
    const { t } = useTranslation();
    const [enrollments, setEnrollments] = useState<Enrollment[]>(courses || []);
    const [isLoading, setIsLoading] = useState(!courses);

    useEffect(() => {
        if (courses) {
            setEnrollments(courses.slice(0, 4));
            setIsLoading(false);
        } else {
            loadEnrollments();
        }
    }, [courses]);

    const loadEnrollments = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/courses/my_courses/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                // Handle both paginated and non-paginated responses
                let courses = [];
                if (Array.isArray(data)) {
                    courses = data;
                } else if (data && Array.isArray(data.results)) {
                    courses = data.results;
                } else if (data && Array.isArray(data.enrollments)) {
                    courses = data.enrollments;
                }
                setEnrollments(courses.slice(0, 4)); // Show max 4 courses
            }
        } catch (err) {
            console.error('Error fetching enrollments:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return t('dashboard.courseList.time.today');
        if (days === 1) return t('dashboard.courseList.time.yesterday');
        if (days < 7) return `${days} ${t('dashboard.courseList.time.daysAgo')}`;
        return `${Math.floor(days / 7)} ${t('dashboard.courseList.time.weeksAgo')}`;
    };

    const getProgressStatus = (progress: number) => {
        if (progress < 30) return { status: 'warning', tag: t('dashboard.courseList.tags.warning') };
        if (progress > 70) return { status: 'active', tag: t('dashboard.courseList.tags.active') };
        return { status: 'normal', tag: null };
    };

    if (isLoading) {
        return (
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">📚 {t('dashboard.courseList.title')}</h2>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (enrollments.length === 0) {
        return (
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">📚 {t('dashboard.courseList.title')}</h2>
                    <Link to="/courses" className="text-sm font-semibold text-primary hover:text-primary/80">{t('dashboard.courseList.viewCourses')}</Link>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-2">{t('dashboard.courseList.empty')}</p>
                    <Link to="/courses">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            {t('dashboard.courseList.viewCourses')}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">📚 {t('dashboard.courseList.title')}</h2>
                <Link to="/my-courses" className="text-sm font-semibold text-primary hover:text-primary/80">{t('dashboard.courseList.all')}</Link>
            </div>

            <div className="space-y-4 flex-1">
                {enrollments.map((enrollment) => {
                    const course = enrollment.course;
                    const progress = parseFloat(String(enrollment.progress)) || 0;
                    const { status, tag } = getProgressStatus(progress);

                    if (!course) return null;

                    return (
                        <div key={enrollment.id} className="group flex gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-primary-dark shadow-gold">
                                {course.thumbnail ? (
                                    <img
                                        src={getImageUrl(course.thumbnail)}
                                        alt={course.title}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                                        {course.title?.[0] || 'K'}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                    {tag && (
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1 ${status === 'warning' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-primary/10 text-primary border border-primary/20'
                                            }`}>
                                            {tag}
                                        </span>
                                    )}
                                    <h3 className="font-bold text-foreground text-sm truncate leading-tight">{course.title}</h3>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {getTimeAgo(enrollment.created_at)}
                                    </div>
                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[60px]">
                                        <div className={`h-full rounded-full ${status === 'warning' ? 'bg-orange-500' : 'bg-primary shadow-gold'
                                            }`} style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className="text-xs font-medium">{progress.toFixed(0)}%</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-center gap-2">
                                <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg text-[10px] font-black">
                                    <Zap className="w-3 h-3 fill-primary" />
                                    {enrollment.xp_earned || '0'} / {enrollment.total_xp_available || '500'} XP
                                </div>
                                <Link to={`/course/${course.id}`}>
                                    <Button size="icon" className={`rounded-full shadow-md ${status === 'warning' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'btn-primary h-8 w-8'
                                        }`}>
                                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SmartCourseList;
