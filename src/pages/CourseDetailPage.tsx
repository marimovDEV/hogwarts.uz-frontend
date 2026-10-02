import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Play, Clock, Users, Star, CheckCircle2, Lock, ChevronDown, ChevronUp,
  Trophy, ArrowLeft, GraduationCap, BookOpen, Loader2, ShoppingCart, Check, Gift,
  Globe, AlertTriangle, Settings
} from "lucide-react";
import ArdCoin from "@/components/ArdCoin";
import PaymentModal from "@/components/payment/PaymentModal";
import { toast } from "sonner";
import api, { API_URL, getImageUrl } from "@/services/api";
import { getSubjectTheme as getTheme } from "@/lib/course-themes";

const API_BASE = API_URL;

interface Course {
  id: number;
  title: string;
  subject: string | number | { id?: number; name?: string; slug?: string };
  subject_name?: string;
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
  teacher_name?: string;
  what_you_learn?: string[];
  requirements?: string[];
  is_enrolled?: boolean;
  enrollment?: {
    id: number;
    progress: number;
    current_lesson: number | null;
    updated_at: string;
  };
}

type ApiError = {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      error?: string;
    };
  };
};

interface Lesson {
  id: number;
  title: string;
  duration: string;
  is_free: boolean;
  order: number;
}

interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const backPath = localStorage.getItem('token') ? '/courses' : '/all-courses';
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        setUserRole(null);
      }
    }
  }, []);

  // Wallet State
  const [userBalance, setUserBalance] = useState<number>(0);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    const loadUserBalance = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.balance !== undefined) {
          setUserBalance(parseFloat(user.balance));
        }
      }
    };

    const loadModules = async () => {
      try {
        const res = await fetch(`${API_BASE}/courses/${id}/modules/`);
        if (res.ok) {
          const data = await res.json();
          const moduleList = Array.isArray(data) ? data : data.results || [];
          setModules(moduleList);
          if (moduleList.length > 0) {
            setExpandedModules([moduleList[0].id]);
          }
        }
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    };

    const loadCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/courses/${id}/`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          setCourse(data);
          setIsEnrolled(data.is_enrolled);
          await loadModules();
        } else {
          navigate('/courses');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCourse();
    loadUserBalance();
  }, [id, navigate]);

  const handleEnroll = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    if (course?.is_free || course?.price === 0) {
      enrollDirectly(token);
      return;
    }

    if (userBalance < (course?.price || 0)) {
      setShowPayModal(true);
      return;
    }

    purchaseWithWallet(token);
  };

  const enrollDirectly = async (_token: string) => {
    setIsPurchasing(true);
    try {
      const res = await api.post(`/courses/${id}/enroll/`);

      if (res.status === 200 || res.status === 201) {
        setIsEnrolled(true);
        toast.success(t('dashboard.courseDetail.successEnroll'));
        setTimeout(() => navigate('/my-courses'), 1500);
      }
    } catch (err: unknown) {
      const errorData = (err as ApiError).response?.data;
      toast.error(errorData?.detail || t('common.error'));
    } finally {
      setIsPurchasing(false);
    }
  };

  const purchaseWithWallet = async (_token: string) => {
    if (!confirm(t('dashboard.courseDetail.confirmPurchase', { price: course?.price }))) return;

    setIsPurchasing(true);
    try {
      const res = await api.post(`/wallet/purchase/`, {
        type: 'COURSE',
        id: course?.id
      });

      if (res.data.success) {
        setIsEnrolled(true);
        toast.success(t('dashboard.courseDetail.successPurchase'));
        setTimeout(() => navigate('/my-courses'), 1500);
        setUserBalance(res.data.balance);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          u.balance = res.data.balance;
          localStorage.setItem('user', JSON.stringify(u));
        }
      } else {
        toast.error(res.data.error || t('dashboard.courseDetail.errorPurchase'));
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorData = apiError.response?.data;
      // If it's a 401/403, the interceptor will handle the logout.
      // We only handle other errors here.
      if (apiError.response?.status !== 401 && apiError.response?.status !== 403) {
        toast.error(errorData?.error || t('common.serverError'));
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  // Replaced local getSubjectTheme with central utility

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
        <BookOpen className="w-20 h-20 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('dashboard.courseDetail.notFound')}</h2>
        <Link to={backPath}>
          <Button>{t('dashboard.courseDetail.backToCourses')}</Button>
        </Link>
      </div>
    );
  }

  const isFree = course.is_free || Number(course.price) === 0;
  const courseTheme = getTheme(course.subject_name || course.subject);
  const showLanguageWarning = course.language && course.language !== i18n.language && !isEnrolled;
  const courseLang = t(`courses.languages.${course.language}`) || course.language;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col pt-4">
      {/* Teacher Management Bar (If applicable) */}
      {userRole === 'TEACHER' && (
        <div className="max-w-7xl mx-auto w-full px-6 mb-4 flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-primary flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t('common.management', { defaultValue: "Boshqaruv" })}:
              </span>
            </div>
            <div className="flex gap-2">
            <Link to={`/teacher/courses/${id}/edit`}>
              <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl">
                <Settings className="w-4 h-4" />
                {t('teacher.courses.editCourse', { defaultValue: "Dasturni tahrirlash" })}
              </Button>
            </Link>
            <Link to="/teacher/students">
              <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl">
                <Users className="w-4 h-4" />
                {t('teacher.dashboard.stats.students', { defaultValue: "O'quvchilar" })}
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex-1">
        {/* ── Hero Section: Cover Image Background ── */}
        <div
          className="relative text-white overflow-hidden"
          style={{
            minHeight: '420px',
            background: `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.92) 100%), url(${getImageUrl(course.thumbnail) || courseTheme.fallbackImage}) center/cover no-repeat`,
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
            <Link
              to={backPath}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors text-sm font-medium group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              {t('dashboard.courseDetail.backToCourses')}
            </Link>

            {showLanguageWarning && (
              <div className="mb-6 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/40 p-4 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-300 shrink-0 mt-0.5" />
                <p className="font-bold text-yellow-100">
                  {t('courses.languageWarning', { language: courseLang })}
                </p>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-10 items-start">
              {/* Course Info */}
              <div className="lg:col-span-2 space-y-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider">
                    {(() => {
                      const sub = String(course.subject_name || course.subject || "").toLowerCase();
                      return t(`subjects.${sub}`, { defaultValue: course.subject_name || course.subject || t('common.general') });
                    })()}
                  </span>
                  <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/10 uppercase tracking-wider">
                    {t(`levels.${course.level}`) || course.level || t('common.general')}
                  </span>
                  {course.language && (
                    <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      {t(`courses.languages.${course.language}`)}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-tight">
                  {t(`courses.${course.title}`, { defaultValue: course.title })}
                </h1>

                <p className="text-base text-white/80 leading-relaxed max-w-2xl">
                  {t(`courses.${course.description}`, {
                    defaultValue: t(course.description || "", {
                      defaultValue: course.description || t('dashboard.courseDetail.defaultDesc')
                    })
                  })}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-5 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{Number(course.rating || 0).toFixed(1)}</span>
                    <span className="text-white/50">({course.enrolled_count || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-white/60" />
                    <span>{course.enrolled_count || 0} {t('dashboard.courseDetail.students')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-white/60" />
                    <span>{course.lessons_count || 0} {t('dashboard.courseDetail.lessons')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-white/60" />
                    <span>
                      {course.duration ? (
                        course.duration.toString().includes(' ')
                          ? `${course.duration.split(' ')[0]} ${t('common.hours')}`
                          : `${course.duration} ${t('common.hours')}`
                      ) : '---'}
                    </span>
                  </div>
                </div>

                {/* Teacher */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-full bg-white/20 border border-white/10 flex items-center justify-center text-lg font-bold shrink-0">
                    {course.teacher_name?.[0] || 'O'}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{course.teacher_name || t('dashboard.courseDetail.teacher')}</div>
                    <div className="text-white/50 text-xs">{t('dashboard.courseDetail.author')}</div>
                  </div>
                </div>
              </div>

              {/* Purchase Card */}
              <div className="lg:col-span-1">
                <div className="bg-card/95 dark:bg-card backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden sticky top-6 border border-border">
                  <div className="p-6 space-y-5">
                    {/* Price / Status */}
                    <div className="text-center">
                      {isEnrolled ? (
                        <div className="flex flex-col items-center gap-1 animate-in zoom-in-95 duration-300">
                          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 border border-green-500/20">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <span className="text-lg font-black text-green-600 dark:text-green-400 mt-1">
                            {t('dashboard.myCoursesPage.enrolled') || 'Sotib olingan'}
                          </span>
                        </div>
                      ) : isFree ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-4xl font-black text-green-600 dark:text-green-400">{t('dashboard.courseDetail.free')}</span>
                        </div>
                      ) : (
                        <ArdCoin amount={course.price} size="xl" />
                      )}
                    </div>

                    {/* Progress bar if enrolled */}
                    {isEnrolled && course.enrollment && (
                      <div className="animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('dashboard.myCoursesPage.progress')}</span>
                          <span className="text-sm font-black text-primary">{Math.round(course.enrollment.progress)}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border">
                          <div
                            className="h-full bg-gradient-to-r from-[#FACC15] to-[#CA8A04] transition-all duration-1000 rounded-full"
                            style={{ width: `${course.enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    {isEnrolled ? (
                      <Button
                        size="lg"
                        className="w-full h-13 text-base rounded-2xl bg-primary hover:bg-primary/90 text-background font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                        onClick={() => navigate(`/course/${id}/lesson/${course.enrollment?.current_lesson || ''}`)}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        {t('dashboard.courseDetail.continue')}
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className={`w-full h-13 text-base rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${isFree
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 shadow-lg shadow-orange-500/20 text-white'
                          }`}
                        onClick={handleEnroll}
                        disabled={isPurchasing}
                      >
                        {isPurchasing ? (
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : isFree ? (
                          <Play className="w-5 h-5 mr-2" />
                        ) : (
                          <ShoppingCart className="w-5 h-5 mr-2" />
                        )}
                        {isPurchasing ? t('dashboard.courseDetail.processing') : isFree ? t('dashboard.courseDetail.startFree') : t('dashboard.courseDetail.buy')}
                      </Button>
                    )}

                    {/* Balance Warning */}
                    {!isEnrolled && !isFree && userBalance < course.price && (
                      <div className="text-center text-xs text-destructive bg-destructive/10 p-2 rounded-lg border border-destructive/20">
                        {t('dashboard.courseDetail.insufficientFunds', { balance: userBalance.toLocaleString() })}
                      </div>
                    )}

                    {/* Badge-style Features */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-border justify-center">
                      {isEnrolled && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/20">
                          🟢 {t('dashboard.myCoursesPage.enrolled') || 'Sotib olingan'}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                        🎓 {t('dashboard.courseDetail.certificateIncluded')}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-bold border border-border">
                        ♾ {t('dashboard.courseDetail.lifetimeAccess')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs / Modules */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">{t('dashboard.courseDetail.curriculum.title')}</h2>

              <div className="space-y-4">
                {modules.length === 0 ? (
                  <div className="text-center py-10 bg-card rounded-xl border border-border animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t('dashboard.courseDetail.comingSoon')}</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                      {t('dashboard.courseDetail.noLessonsComingSoon')}
                    </p>
                  </div>
                ) : (
                  modules.map((module) => (
                    <div key={module.id} className="border border-border rounded-xl bg-card overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors text-left"
                      >
                        <span className="font-semibold flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                            {module.order}
                          </div>
                          {t(`modules.${module.title}`, { defaultValue: module.title })}
                        </span>
                        {expandedModules.includes(module.id) ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>

                      {expandedModules.includes(module.id) ? (
                        <div className="divide-y divide-border">
                          {module.lessons && module.lessons.length > 0 ? (
                            module.lessons.map((lesson) => (
                              <div key={lesson.id} className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                                {isEnrolled || lesson.is_free ? (
                                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <Play className="w-4 h-4 fill-current" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <Lock className="w-4 h-4" />
                                  </div>
                                )}

                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      {t(`lessons.${lesson.title}`, { defaultValue: lesson.title })}
                                    </span>
                                    {lesson.is_free && !isEnrolled && (
                                      <span className="text-[10px] uppercase font-bold bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                                        {t('dashboard.courseDetail.free')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{lesson.duration ? `${lesson.duration} ${t('common.minutes')}` : `10 ${t('common.minutes')}`}</div>
                                </div>

                                {(isEnrolled || lesson.is_free) && (
                                  <Link to={`/course/${id}/lesson/${lesson.id}`}>
                                    <Button size="sm" variant={isEnrolled ? "ghost" : "default"} className={!isEnrolled && lesson.is_free ? "bg-green-600 hover:bg-green-700 text-white h-7 text-xs" : ""}>
                                      {isEnrolled ? t('dashboard.courseDetail.start') : t('dashboard.courseDetail.watchDemo', "Demo ko'rish")}
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                              {t('dashboard.courseDetail.noLessons')}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              {/* Requirements */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  {t('dashboard.courseDetail.requirements')}
                </h3>
                {course.requirements && course.requirements.length > 0 ? (
                  <ul className="space-y-2">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('dashboard.courseDetail.noRequirements')}</p>
                )}
              </div>
            </div>
          </div>

          <PaymentModal
            isOpen={showPayModal}
            onClose={() => setShowPayModal(false)}
            requiredAmount={course ? Math.max(0, course.price - userBalance) : 0}
            onSuccess={(newBalance) => {
              setUserBalance(newBalance);
              toast.info(t('dashboard.courseDetail.balanceUpdated'));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
