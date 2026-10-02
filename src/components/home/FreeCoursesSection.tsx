import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlayCircle, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { homepageService, FreeCourseSection } from "@/services/homepageService";
import api from "@/services/api";

interface Course {
    id: number;
    title: string;
    thumbnail: string;
    level: string;
    duration: string;
    subject?: {
        name: string;
    };
}

const FreeCoursesSection = () => {
    const { t, i18n } = useTranslation();
    const [section, setSection] = useState<FreeCourseSection | null>(null);
    const [freeCourses, setFreeCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSection = async () => {
            try {
                const res = await homepageService.getFreeCourseSection();
                const sections = Array.isArray(res) ? res : res.results || [];
                const activeSection = sections.find((s: FreeCourseSection) => s.is_active && s.show_on_homepage);
                setSection(activeSection || null);
            } catch (error) {
                console.error('Failed to fetch free course section:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchFreeCourses = async () => {
            try {
                // Fetch courses with price = 0 (free courses)
                const res = await api.get('/courses/?price=0&is_active=true&status=APPROVED');
                const courses = res.data.results || res.data || [];
                // Take first 3 courses
                setFreeCourses(courses.slice(0, 3));
            } catch (error) {
                console.error('Failed to fetch free courses:', error);
            }
        };

        fetchSection();
        fetchFreeCourses();
    }, []);

    // Don't render if no active section or no free courses
    if (loading || !section || freeCourses.length === 0) return null;

    const CourseCard = ({ course }: { course: Course }) => {
        // Parse duration from "HH:MM:SS" or minutes
        const getDuration = () => {
            if (!course.duration) return "30 min";

            // If it's in HH:MM:SS format
            if (course.duration.includes(':')) {
                const parts = course.duration.split(':');
                const hours = parseInt(parts[0]);
                const minutes = parseInt(parts[1]);
                if (hours > 0) {
                    return `${hours}h ${minutes}min`;
                }
                return `${minutes} min`;
            }

            // If it's just minutes
            return `${course.duration} min`;
        };

        const getLevelText = () => {
            const levels: Record<string, { uz: string; ru: string }> = {
                'BEGINNER': { uz: "Boshlang'ich", ru: "Начальный" },
                'INTERMEDIATE': { uz: "O'rta", ru: "Средний" },
                'ADVANCED': { uz: "Murakkab", ru: "Продвинутый" }
            };
            const level = levels[course.level] || levels['BEGINNER'];
            return i18n.language === 'ru' ? level.ru : level.uz;
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer bg-card rounded-2xl md:rounded-xl border overflow-hidden hover:shadow-lg transition-all"
            >
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={course.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                        alt={course.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
                            <PlayCircle className="w-8 h-8 fill-white/20" />
                        </div>
                    </div>
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded">
                        {getLevelText()}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded">
                        {getDuration()}
                    </div>
                </div>
                <div className="p-4 md:p-5">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                    <Link to={`/courses/${course.id}`} className="text-sm text-primary font-medium hover:underline inline-flex items-center">
                        {t('freeCourses.view_lesson', "Darsni ko'rish")} <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                </div>
            </motion.div>
        );
    };

    // Get text based on current language
    const title = i18n.language === 'ru' ? section.title_ru : section.title_uz;
    const subtitle = i18n.language === 'ru' ? section.subtitle_ru : section.subtitle_uz;
    const description = i18n.language === 'ru' ? section.description_ru : section.description_uz;
    const buttonText = i18n.language === 'ru' ? section.button_text_ru : section.button_text_uz;

    return (
        <section className="py-12 md:py-20 bg-muted/20">
            <div className="container">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="text-primary font-bold mb-2 uppercase tracking-wider text-sm">{title}</div>
                        <h2 className="text-3xl md:text-4xl font-bold">{subtitle}</h2>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                            {description}
                        </p>
                    </motion.div>
                    <Button variant="default" asChild>
                        <Link to={section.button_link}>
                            {buttonText} <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {freeCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FreeCoursesSection;
