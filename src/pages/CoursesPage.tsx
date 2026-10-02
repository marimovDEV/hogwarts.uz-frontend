import { API_URL as API_BASE } from "@/services/api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Search,
  Play,
  Clock,
  Users,
  Star,
  Flame,
  Filter,
  Loader2,
  BookOpen,
  GraduationCap,
  Globe
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getSubjectTheme } from "@/lib/course-themes";
import * as Icons from "lucide-react";
import { getImageUrl } from "@/services/api";

interface Course {
  id: number;
  title: string;
  subject: string;
  level: string;
  language: string;
  lessons_count: number;
  duration: string;
  enrolled_count: number;
  rating: number;
  thumbnail: string;
  is_free: boolean;
  price: number;
  description: string;
  is_published: boolean;
  teacher_name?: string;
  is_enrolled?: boolean;
}


const CoursesPage = () => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Subject mapping: "Backend Value" -> "Translation Key"
  // Assuming backend returns these Uzbek values. 
  // If backend returns English, we should adjust.
  // Based on getSubjectTheme, it expects: matematika, fizika, etc.
  const subjectsMap = [
    { value: "all", labelKey: "dashboard.coursesPage.all" },
    { value: "Matematika", labelKey: "subjects.matematika" },
    { value: "Fizika", labelKey: "subjects.fizika" },
    { value: "Informatika", labelKey: "subjects.informatika" },
    { value: "Ingliz tili", labelKey: "subjects.ingliz" },
    { value: "Mantiq", labelKey: "subjects.mantiq" },
    { value: "Kimyo", labelKey: "subjects.kimyo" },
    { value: "Biologiya", labelKey: "subjects.biologiya" }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/courses/`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        let courseList: Course[] = [];

        if (Array.isArray(data)) {
          courseList = data;
        } else if (data && Array.isArray(data.results)) {
          courseList = data.results;
        }

        setCourses(courseList.filter(c => c.is_published !== false));
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const title = String(course.title || "").toLowerCase();
    const description = String(course.description || "").toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = title.includes(query) || description.includes(query);
    const matchesSubject = selectedSubject === "all" || course.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const formatPrice = (price: any, isFree: boolean) => {
    if (isFree || Number(price) === 0) return t('badges.free');
    return `${Number(price).toLocaleString()} ${t('common.currency')}`;
  };

  // Removed local getSubjectTheme in favor of centralized utility

  const formatDuration = (durationStr: string) => {
    if (!durationStr) return '---';
    // Extract number if present
    const match = durationStr.match(/(\d+)/);
    if (match) {
      return `${match[1]} ${t('common.hours')}`;
    }
    return durationStr;
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 animate-fade-in max-w-[1600px] mx-auto min-h-screen">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground mb-2">{t('dashboard.coursesPage.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('dashboard.coursesPage.subtitle')}</p>
        </div>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 animate-fade-in max-w-[1600px] mx-auto min-h-screen">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-foreground mb-2">{t('dashboard.coursesPage.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('dashboard.coursesPage.subtitle')}</p>
        </div>

        <div className="w-full lg:w-auto flex gap-3">
          <div className="relative flex-1 lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('dashboard.coursesPage.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 h-14 rounded-2xl border-2 border-border bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-lg text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button variant="outline" size="icon" className="lg:hidden h-14 w-14 rounded-2xl" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-3 mb-10 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
        {subjectsMap.filter(subject =>
          subject.value === "all" || courses.some(c => c.subject === subject.value)
        ).map(subject => (
          <button
            key={subject.value}
            onClick={() => setSelectedSubject(subject.value)}
            className={`px-6 py-3 rounded-2xl text-base font-semibold transition-all ${selectedSubject === subject.value
              ? 'bg-foreground text-background shadow-xl shadow-foreground/20'
              : 'bg-card text-muted-foreground hover:bg-muted border-2 border-border hover:border-foreground/20'
              }`}
          >
            {t(subject.labelKey)}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <BookOpen className="w-20 h-20 text-muted-foreground/50 mb-6" />
          <h3 className="text-2xl font-bold text-foreground mb-3">{t('dashboard.coursesPage.emptyTitle')}</h3>
          <p className="text-lg text-muted-foreground mb-6">
            {search
              ? t('dashboard.coursesPage.emptyDesc', { search })
              : t('dashboard.coursesPage.emptyCategory')}
          </p>
          <Button size="lg" onClick={() => { setSearch(""); setSelectedSubject("all"); }}>
            {t('dashboard.coursesPage.viewAll')}
          </Button>
        </div>
      )}

      {/* Course Grid - LARGER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredCourses.map((course) => {
          const theme = getSubjectTheme(course.subject);
          const isFree = course.is_free || Number(course.price) === 0;

          return (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="group bg-card rounded-[2rem] border-2 border-border hover:border-primary/50 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Cover Image - LARGER */}
              <div className="h-56 relative overflow-hidden">
                <img
                  src={getImageUrl(course.thumbnail) || theme.fallbackImage}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {course.students_count > 100 && (
                    <span className="bg-red-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Flame className="w-3.5 h-3.5" /> {t('badges.popular')}
                    </span>
                  )}
                  {isFree && (
                    <span className="bg-green-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                      {t('badges.free')}
                    </span>
                  )}
                  {course.is_enrolled && (
                    <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> {t('dashboard.myCoursesPage.enrolled') || 'Sotib olingan'}
                    </span>
                  )}
                </div>

                {/* Level Badge */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                    {t(`levels.${course.level}`) || course.level}
                  </div>
                  {course.language && (
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {course.language.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Price on image - Bottom Right */}
                <div className="absolute bottom-4 right-4">
                  <div className={`px-2.5 py-1 rounded-xl backdrop-blur-md border border-white/20 ${isFree ? 'bg-green-500/30' : 'bg-black/40'}`}>
                    <span className={`text-sm font-black ${isFree ? 'text-green-400' : 'text-white'}`}>
                      {formatPrice(course.price, isFree)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content - LARGER PADDING */}
              <div className="p-7 flex-1 flex flex-col">
                {/* Subject & Rating */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`${theme.light} ${theme.text} text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-lg`}>
                    {course.subject
                      ? (t(`subjects.${String(course.subject || "").toLowerCase()}`) || course.subject)
                      : t('common.general')}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-foreground">{Number(course.rating || 0).toFixed(1)}</span>
                    <span className="text-muted-foreground">({course.students_count || 0})</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-xl text-foreground leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {t(`courses.${course.title}`, { defaultValue: course.title })}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-5 line-clamp-2 flex-1">
                  {t(`courses.${course.description}`, { defaultValue: course.description || t('dashboard.coursesPage.defaultDesc') })}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-5 text-sm text-muted-foreground mb-5">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    <span>{course.lessons_count || 0} {t('dashboard.coursesPage.lessons')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{course.students_count || 0}</span>
                  </div>
                </div>

                {/* Teacher & CTA */}
                <div className="pt-5 border-t-2 border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const DynamicIcon = (Icons as any)[theme.icon] || Icons.BookOpen;
                      return (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.bg} flex items-center justify-center text-white font-bold p-2`}>
                          <DynamicIcon className="w-full h-full" />
                        </div>
                      );
                    })()}
                    <span className="text-sm font-medium text-muted-foreground">{course.teacher_name || t('dashboard.coursesPage.teacher')}</span>
                  </div>
                  <Button
                    size="lg"
                    className={`rounded-xl shadow-lg ${course.is_enrolled
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : isFree
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-primary hover:bg-primary/90'
                      } text-white`}
                  >
                    {course.is_enrolled
                      ? t('dashboard.myCoursesPage.continue')
                      : isFree
                        ? t('dashboard.coursesPage.start')
                        : t('dashboard.coursesPage.buy')}
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CoursesPage;
