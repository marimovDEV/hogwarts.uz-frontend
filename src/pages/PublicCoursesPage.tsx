import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { homepageService } from "@/services/homepageService";
import { getImageUrl } from "@/services/api";
import { Button } from "@/components/ui/button";
// ... other imports
import {
    BookOpen,
    Play,
    Star,
    Users,
    ArrowRight,
    Trophy,
    Flame,
    Gift,
    Zap,
    CheckCircle2,
    Filter,
    Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { getSubjectTheme } from "@/lib/course-themes";
import * as Icons from "lucide-react";

const PublicCoursesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirect students to their dashboard version
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role === 'STUDENT') {
                    navigate('/courses', { replace: true });
                }
            } catch (e) {
                // Ignore
            }
        }
    }, [navigate]);

    const [selectedSubject, setSelectedSubject] = useState("all_subjects");
    const [selectedGrade, setSelectedGrade] = useState("all_grades");

    const subjectKeyMap: Record<string, string> = {
        'matematika': 'math',
        'math': 'math',
        'fizika': 'physics',
        'physics': 'physics',
        'informatika': 'informatics',
        'informatics': 'informatics',
        'ingliz': 'english',
        'english': 'english',
        'kimyo': 'chemistry',
        'chemistry': 'chemistry',
        'biologiya': 'biology',
        'biology': 'biology',
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await homepageService.getPublicCourses();
                setCourses(Array.isArray(data) ? data : data.results || []);
            } catch (err) {
                console.error("Failed to fetch courses:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course => {
        // Handle subject as object or string
        const subjectName = typeof course.subject === 'object' && course.subject?.name
            ? course.subject.name
            : course.subject_name || course.subject || "";

        const courseSubjectKey = subjectKeyMap[subjectName.toLowerCase()] || 'informatics';

        const subjectMatch = selectedSubject === "all_subjects" || courseSubjectKey === selectedSubject;

        return subjectMatch;
    });


    // Get unique subjects from courses
    const availableSubjects = Array.from(new Set(
        courses.map(course => {
            const subjectName = typeof course.subject === 'object' && course.subject?.name
                ? course.subject.name
                : course.subject_name || course.subject || "";
            return subjectName.toLowerCase();
        }).filter(Boolean)
    ));

    // Create dynamic subject keys - only show subjects that have courses
    const subjectKeys = ['all_subjects', ...availableSubjects.map(subject => {
        // Only map if it exists in the map, otherwise use the subject name itself (cleaned) to avoid 'informatics' default for everything
        const key = subjectKeyMap[subject];
        return key || null;
    }).filter(Boolean).filter((value, index, self) => self.indexOf(value) === index)]; // Remove duplicates and nulls

    const gradeKeys = ["all_grades", "grades_5_6", "grades_7_9", "grades_10_11"];

    return (
        <main className="pb-16 container mx-auto px-4">

            {/* Header Section */}
            <div className="text-center mb-12 animate-slide-up">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                    <Trans i18nKey="publicCourses.title" components={{ 1: <span className="text-primary" /> }} />
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {t('publicCourses.subtitle')}
                </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-card p-4 rounded-2xl shadow-sm border border-border mb-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-20">
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {subjectKeys.map(key => (
                        <button
                            key={key}
                            onClick={() => setSelectedSubject(key)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedSubject === key
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {t(`filters.${key}`)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-48">
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full h-10 pl-4 pr-8 rounded-xl bg-muted border border-border text-sm font-medium appearance-none outline-none focus:border-primary text-foreground"
                        >
                            {gradeKeys.map(key => <option key={key} value={key} className="bg-card">{t(`filters.${key}`)}</option>)}
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => {
                        const theme = getSubjectTheme(course.subject_name || course.subject || "");
                        const DynamicIcon = (Icons as any)[theme.icon] || Icons.BookOpen;
                        const isFree = Number(course.price) === 0 || course.is_free;

                        return (
                            <div
                                key={course.id}
                                className="group bg-card rounded-[2rem] border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
                            >
                                {/* Card Image */}
                                <div className="h-52 relative flex items-center justify-center overflow-hidden">
                                    <img
                                        src={getImageUrl(course.thumbnail) || theme.fallbackImage}
                                        alt={course.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    <DynamicIcon className="w-16 h-16 text-white/40 transform group-hover:scale-110 transition-transform duration-500 relative z-10" />

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2 items-start z-20">
                                        {course.students_count > 100 && (
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm flex items-center gap-1">
                                                <Flame className="w-3 h-3" /> {t('badges.popular')}
                                            </span>
                                        )}
                                        {isFree && (
                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm flex items-center gap-1">
                                                <Gift className="w-3 h-3" /> {t('badges.free')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[10px] font-bold border border-white/20 z-20">
                                        {t(`levels.${course.level}`) || course.level}
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-xl leading-tight mb-2 text-foreground group-hover:text-primary transition-colors">
                                            {t(course.title)}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {t(course.description)}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-6 bg-muted p-3 rounded-xl">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <Play className="w-4 h-4 text-primary" />
                                            {course.lessons_count || 0} {t('publicCourses.lessons')}
                                        </div>
                                        <div className="w-px h-4 bg-border" />
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            {Number(course.rating || 0).toFixed(1)}
                                        </div>
                                        <div className="w-px h-4 bg-border" />
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <Users className="w-4 h-4 text-primary" />
                                            {course.students_count || 0}
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between gap-4">
                                        <div className="text-xs font-bold text-orange-500 flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
                                            <Zap className="w-3 h-3 fill-orange-500" />
                                            +{course.xp_reward || 50} XP
                                        </div>

                                        <Link to={`/course/${course.id}`} className="flex-1">
                                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary/20">
                                                {t('publicCourses.details') || "Batafsil"}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
};

export default PublicCoursesPage;
