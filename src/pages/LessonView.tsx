import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Play,
    CheckCircle2,
    Lock,
    FileText,
    MessageSquare,
    Award,
    Video,
    Send,
    HelpCircle,
    Menu,
    X,
    Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import learningService, { Module, Lesson } from "@/services/learningService";
import confetti from "canvas-confetti";

const LessonView = () => {
    const { t } = useTranslation();
    const { id, lessonId } = useParams(); // id is courseId
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("video");
    const [practiceAnswer, setPracticeAnswer] = useState("");
    const [testAnswers, setTestAnswers] = useState<Record<string, any>>({});

    // 1. Fetch Learning State
    const { data: learningState, isLoading, isError } = useQuery({
        queryKey: ['learningState', id],
        queryFn: () => learningService.getLearningState(id!),
        enabled: !!id
    });

    // 2. Find Current Lesson
    const allLessons = learningState?.modules.flatMap(m => m.lessons) || [];
    const currentLesson = allLessons.find(l => l.id === Number(lessonId)) || allLessons[0];
    const currentIndex = currentLesson ? allLessons.findIndex(l => l.id === currentLesson.id) : -1;
    const nextLesson = currentIndex !== -1 ? allLessons[currentIndex + 1] : undefined;
    const prevLesson = currentIndex !== -1 ? allLessons[currentIndex - 1] : undefined;

    // 3. Mutations
    const completeVideoMutation = useMutation({
        mutationFn: (data: { lessonId: number, position: number }) =>
            learningService.completeVideo(data.lessonId, data.position),
        onSuccess: (data) => {
            if (data.is_completed) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                toast.success(`${t('lessons.lesson_finished_success')} 🔥`);
            }
            queryClient.invalidateQueries({ queryKey: ['learningState', id] });
        }
    });

    const submitPracticeMutation = useMutation({
        mutationFn: (answer: string) => learningService.submitPractice(currentLesson.id, answer),
        onSuccess: (data) => {
            if (data.practice_score > 0) {
                toast.success(t('lessons.practice_success'));
                if (data.is_completed) confetti({ particleCount: 50, spread: 60 });
            } else {
                toast.info(t('lessons.practice_pending'));
            }
            queryClient.invalidateQueries({ queryKey: ['learningState', id] });
        }
    });

    const submitTestMutation = useMutation({
        mutationFn: (answers: any) => learningService.submitTest(currentLesson.id, answers),
        onSuccess: (data) => {
            if (data.is_completed) {
                toast.success(`${t('lessons.test_passed')}: ${data.test_score}%`);
                confetti({ particleCount: 150, spread: 100 });
            } else {
                toast.error(`${t('lessons.test_failed')}: ${data.test_score}%`);
            }
            queryClient.invalidateQueries({ queryKey: ['learningState', id] });
        }
    });

    // 4. Auto-navigate to correct lesson if none in URL
    useEffect(() => {
        if (!lessonId && allLessons.length > 0) {
            // Find first uncompleted or last accessed
            const target = allLessons.find(l => !l.progress?.is_completed && !l.is_locked) || allLessons[0];
            navigate(`/course/${id}/lesson/${target.id}`, { replace: true });
        }
    }, [lessonId, learningState]);

    useEffect(() => {
        if (id && currentLesson?.id) {
            learningService.setCurrentLesson(id, currentLesson.id);
        }
    }, [id, currentLesson?.id]);

    if (isLoading) return <LessonSkeleton />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <Target className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t('lessons.error.title')}</h2>
                <p className="text-muted-foreground mb-6">{t('lessons.error.subtitle')}</p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['learningState', id] })}>{t('lessons.error.retry')}</Button>
            </div>
        );
    }

    if (allLessons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <Video className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t('lessons.empty.title')}</h2>
                <p className="text-muted-foreground mb-6">{t('lessons.empty.subtitle')}</p>
                <Link to={`/course/${id}`}>
                    <Button variant="outline">{t('lessons.back')}</Button>
                </Link>
            </div>
        );
    }

    if (!currentLesson) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Skeleton className="w-32 h-10" />
            </div>
        );
    }
    if (isError || !learningState) return <div className="p-20 text-center">{t('lessons.error.title')}</div>;

    const isCompleted = currentLesson?.progress?.is_completed;

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {/* Mobile Sidebar Overlay */}
            {!sidebarOpen && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-6 left-6 z-50 lg:hidden shadow-2xl bg-background/80 backdrop-blur-xl border border-border rounded-2xl h-12 w-12"
                    onClick={() => setSidebarOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </Button>
            )}

            {/* 1. Sidebar - Course Curriculum */}
            <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-card border-r border-border transition-transform transform
        lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    <div className="p-8 border-b border-border/50 flex items-center justify-between bg-muted/20">
                        <div className="space-y-3">
                            <h2 className="font-black text-xl line-clamp-2 leading-tight text-foreground">{learningState.enrollment.course.title}</h2>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{learningState.enrollment.progress}%</span>
                                </div>
                                <Progress value={parseFloat(learningState.enrollment.progress)} className="h-2 w-full bg-muted shadow-inner" />
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="lg:hidden ml-2 rounded-xl" onClick={() => setSidebarOpen(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        {learningState.modules.map(module => (
                            <div key={module.id} className="mb-2">
                                <div className="px-8 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-between opacity-60">
                                    {module.title}
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                                <div className="space-y-1 px-3">
                                    {module.lessons.map(lesson => (
                                        <Link
                                            key={lesson.id}
                                            to={lesson.is_locked ? '#' : `/course/${id}/lesson/${lesson.id}`}
                                            className={`
                        flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group
                        ${lesson.id === Number(lessonId)
                                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                                                    : 'hover:bg-muted/80 text-foreground'}
                        ${lesson.is_locked ? 'opacity-40 cursor-not-allowed' : ''}
                      `}
                                            onClick={(e) => lesson.is_locked && e.preventDefault()}
                                        >
                                            <div className={`
                        w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2 transition-colors
                        ${lesson.progress?.is_completed
                                                    ? 'bg-green-500/10 border-green-500/20 text-green-500 group-hover:bg-green-500 group-hover:text-white'
                                                    : lesson.id === Number(lessonId)
                                                        ? 'bg-white/20 border-white/30 text-white'
                                                        : 'bg-background border-border font-black text-xs text-muted-foreground group-hover:border-primary/30'}
                      `}>
                                                {lesson.progress?.is_completed ? <CheckCircle2 className="w-5 h-5" /> : lesson.order}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${lesson.id === Number(lessonId) ? '' : 'text-foreground/90'}`}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 opacity-70">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                                                        <Video className="w-3 h-3" /> {(lesson.video_duration / 60).toFixed(0)}m
                                                    </span>
                                                    {lesson.practice && <span className="text-[10px] font-black">| PRAC</span>}
                                                    {lesson.test && <span className="text-[10px] font-black">| TEST</span>}
                                                </div>
                                            </div>
                                            {lesson.is_locked && <Lock className="w-3.5 h-3.5 ml-2 text-muted-foreground/60" />}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-border/50 bg-muted/10">
                        <Link to={`/course/${id}`}>
                            <Button variant="ghost" className="w-full justify-center gap-3 h-12 rounded-2xl font-black text-xs uppercase tracking-widest border border-border/50 hover:bg-background shadow-sm">
                                <ArrowLeft className="w-4 h-4" /> {t('lessons.course_page')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* 2. Main content */}
            <main className="flex-1 flex flex-col h-full bg-muted/10 relative overflow-y-auto">
                <div className="container max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-border/50 shadow-sm">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                                <span className="bg-primary/10 px-3 py-1 rounded-full border border-primary/10">{t('lessons.lesson')} {currentLesson?.order ?? '-'}</span>
                                <span className="text-muted-foreground font-medium">•</span>
                                <span className="text-muted-foreground">{currentLesson?.module_title || 'Algebra'}</span>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground leading-none">{currentLesson?.title || t('common.loading')}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 mr-2">
                                <LanguageSwitcher />
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!prevLesson}
                                className="h-12 w-12 rounded-2xl border-border bg-background shadow-sm hover:shadow-md transition-all"
                                onClick={() => navigate(`/course/${id}/lesson/${prevLesson?.id}`)}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button
                                variant={isCompleted ? "secondary" : "default"}
                                disabled={!nextLesson || (nextLesson.is_locked && !isCompleted)}
                                className={`h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${isCompleted ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20' : 'shadow-primary/20'}`}
                                onClick={() => navigate(`/course/${id}/lesson/${nextLesson?.id}`)}
                            >
                                {t('lessons.next')} <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Player Container */}
                    {(currentLesson.youtube_id || currentLesson.video_url) ? (
                        <div className="aspect-video bg-black rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-4 border-card relative group ring-1 ring-white/10">
                            <iframe
                                className="w-full h-full"
                                src={currentLesson.youtube_id
                                    ? `https://www.youtube.com/embed/${currentLesson.youtube_id}?modestbranding=1&rel=0&iv_load_policy=3&autoplay=1`
                                    : (currentLesson.video_url?.includes('youtube.com') || currentLesson.video_url?.includes('youtu.be'))
                                        ? currentLesson.video_url.replace('watch?v=', 'embed/').split('&')[0] + '?modestbranding=1&rel=0&autoplay=1'
                                        : currentLesson.video_url || ''}
                                title={currentLesson.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>

                            {/* Overlay for small screens or actions */}
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                {!currentLesson.progress?.is_video_watched && (
                                    <Button
                                        variant="secondary"
                                        className="gap-2 bg-white/90 text-black backdrop-blur-xl border-none shadow-2xl rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest hover:bg-white"
                                        onClick={() => completeVideoMutation.mutate({ lessonId: currentLesson.id, position: 0 })}
                                        disabled={completeVideoMutation.isPending}
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> {t('lessons.finished')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-video bg-muted/30 rounded-[3rem] border-4 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <FileText className="w-16 h-16 opacity-20" />
                            <p className="font-bold">{t('lessons.no_video_content') || "Bu darsda video mavjud emas"}</p>
                        </div>
                    )}

                    {/* Tabs Section */}
                    <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                        <div className="flex items-center justify-between border-b border-border mb-6">
                            <TabsList className="bg-transparent h-auto p-0 gap-8">
                                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 h-auto font-bold text-sm">
                                    {t('lessons.overview')}
                                </TabsTrigger>
                                {currentLesson.practice && (
                                    <TabsTrigger value="practice" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 h-auto font-bold text-sm flex items-center gap-2">
                                        <Target className="w-4 h-4" /> {t('lessons.practice')}
                                    </TabsTrigger>
                                )}
                                {currentLesson.test && (
                                    <TabsTrigger value="test" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 h-auto font-bold text-sm flex items-center gap-2">
                                        <Award className="w-4 h-4" /> {t('lessons.test')}
                                    </TabsTrigger>
                                )}
                            </TabsList>
                        </div>

                        <div className="min-h-[300px]">
                            <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="bg-card rounded-2xl p-6 border border-border">
                                            <h3 className="text-lg font-bold mb-4">{t('lessons.content_title')}</h3>
                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {currentLesson.description || t('lessons.no_content')}
                                            </p>
                                        </div>
                                        {currentLesson.pdf_url && (
                                            <div className="flex items-center justify-between p-5 rounded-2xl bg-primary/5 border border-primary/10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">{t('lessons.materials_title')}</h4>
                                                        <p className="text-xs text-muted-foreground">{t('lessons.materials_subtitle')}</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" className="rounded-xl" asChild>
                                                    <a href={currentLesson.pdf_url} target="_blank" rel="noreferrer">{t('lessons.view')}</a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
                                            <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-4">{t('lessons.stats_title')}</h3>
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('lessons.status')}</span>
                                                    <Badge className={`rounded-xl px-4 py-1 font-black text-[10px] uppercase ${isCompleted ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`} variant="outline">
                                                        {isCompleted ? t('lessons.completed') : t('lessons.in_progress')}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center px-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('lessons.video')}</span>
                                                    <span className="text-sm font-black">{currentLesson.progress?.is_video_watched ? t('lessons.watched') : t('lessons.not_watched')}</span>
                                                </div>
                                                <div className="flex justify-between items-center px-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">XP Mukofoti</span>
                                                    <span className="text-sm font-black text-primary">+{currentLesson.xp_amount || 10} XP</span>
                                                </div>
                                                {currentLesson.practice && (
                                                    <div className="flex justify-between items-center px-2 border-t border-border/50 pt-4">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('lessons.practice')}</span>
                                                        <span className="text-sm font-black">{currentLesson.progress?.practice_score !== null ? `${currentLesson.progress?.practice_score} %` : t('lessons.not_completed')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {currentLesson.practice && (
                                <TabsContent value="practice" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-card rounded-3xl p-8 border border-border shadow-card max-w-3xl mx-auto">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-bold flex items-center gap-3">
                                                <Target className="w-6 h-6 text-primary" /> {t('lessons.practice_title')}
                                            </h3>
                                            <div className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                                                {currentLesson.practice.points} {t('lessons.xp_reward')}
                                            </div>
                                        </div>

                                        <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
                                            <div className="p-6 bg-muted/40 rounded-2xl border border-border/50 text-base italic leading-relaxed">
                                                {currentLesson.practice.problem_text}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {(() => {
                                                const isPracticePassed = (currentLesson.progress?.practice_score || 0) > 0;
                                                return (
                                                    <>
                                                        <label className="text-sm font-bold block ml-1">{t('lessons.your_answer')}</label>
                                                        <textarea
                                                            className={`w-full min-h-[140px] bg-muted/20 border-2 border-border rounded-2xl p-4 outline-none transition-all resize-none font-medium ${isPracticePassed ? 'opacity-70 cursor-not-allowed' : 'focus:border-primary/50'}`}
                                                            placeholder={t('lessons.answer_placeholder')}
                                                            value={practiceAnswer}
                                                            onChange={(e) => setPracticeAnswer(e.target.value)}
                                                            disabled={isPracticePassed}
                                                        />
                                                        <Button
                                                            className={`w-full h-12 rounded-2xl text-lg font-bold shadow-lg transition-all ${isPracticePassed
                                                                ? 'bg-green-500/10 text-green-600 border border-green-500/20 shadow-none hover:bg-green-500/10'
                                                                : 'shadow-primary/20'}`}
                                                            onClick={() => submitPracticeMutation.mutate(practiceAnswer)}
                                                            disabled={submitPracticeMutation.isPending || !practiceAnswer.trim() || isPracticePassed}
                                                        >
                                                            {isPracticePassed ? (
                                                                <><CheckCircle2 className="w-5 h-5 mr-2" /> {t('lessons.practice_success')}</>
                                                            ) : (
                                                                <>
                                                                    {submitPracticeMutation.isPending ? t('lessons.sending') : t('lessons.check_answer')}
                                                                    <Send className="w-5 h-5 ml-2" />
                                                                </>
                                                            )}
                                                        </Button>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </TabsContent>
                            )}

                            {currentLesson.test && (
                                <TabsContent value="test" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="max-w-3xl mx-auto space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-xl font-bold">{t('lessons.test_title')}</h3>
                                            <div className="flex items-center gap-3 text-sm font-medium">
                                                <span className="text-muted-foreground">{t('lessons.pass_score')}:</span>
                                                <span className="bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-lg">{currentLesson.test.min_pass_score}%</span>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            {currentLesson.test.questions.map((q, idx) => (
                                                <div key={q.id} className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                                                    <div className="flex gap-4 mb-6">
                                                        <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <p className="text-lg font-bold leading-tight pt-0.5">{q.text}</p>
                                                    </div>
                                                    <div className="grid gap-3 ml-12">
                                                        {q.options.map((opt, optIdx) => (
                                                            <button
                                                                key={optIdx}
                                                                className={`
                                                w-full text-left px-5 py-4 rounded-2xl border-2 transition-all font-medium text-sm
                                                ${testAnswers[q.id] === optIdx
                                                                        ? 'border-primary bg-primary/5 text-primary'
                                                                        : 'border-transparent bg-muted/30 hover:bg-muted/50 text-foreground'}
                                            `}
                                                                onClick={() => setTestAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                                            >
                                                                <span className="mr-3 text-muted-foreground font-mono">{String.fromCharCode(65 + optIdx)})</span>
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-8 pb-12">
                                            <Button
                                                className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-primary to-primary/80"
                                                onClick={() => submitTestMutation.mutate(testAnswers)}
                                                disabled={submitTestMutation.isPending || Object.keys(testAnswers).length < currentLesson.test.questions.length}
                                            >
                                                {t('lessons.finish_test')}
                                                <Award className="w-6 h-6 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

const LessonSkeleton = () => (
    <div className="flex h-screen bg-background">
        <div className="w-80 border-r border-border p-6 space-y-6">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="space-y-4 pt-10">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
        </div>
        <div className="flex-1 p-12 space-y-8">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
            <Skeleton className="aspect-video w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
    </div>
);

export default LessonView;
