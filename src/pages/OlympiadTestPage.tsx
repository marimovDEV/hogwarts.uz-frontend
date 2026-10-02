import { API_URL as API_BASE } from "@/services/api";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Timer, AlertTriangle, Maximize, CheckCircle, Moon, Sun, LogOut, Info, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type AnswerValue = string | number;

interface OlympiadTestInfo {
    title: string;
    duration: string | number;
    tab_switch_limit?: number;
    disable_copy_paste?: boolean;
    required_camera?: boolean;
    required_full_screen?: boolean;
    require_answer_to_proceed?: boolean;
    cannot_go_back?: boolean;
    end_date?: string | null;
}

interface OlympiadQuestion {
    id: number;
    text: string;
    type: 'MCQ' | 'NUMERIC' | 'TEXT' | 'CODE';
    options?: string[];
    points: number;
}

interface OlympiadAttempt {
    answers?: Record<string, AnswerValue>;
    status?: string;
    submitted_at?: string;
    tab_switches_count?: number;
}

interface StartTestResponse {
    attempt: OlympiadAttempt;
}

interface QuestionsResponse {
    olympiad: OlympiadTestInfo;
    questions?: OlympiadQuestion[];
}

interface SubmitResponse {
    message?: string;
}

interface ErrorResponse {
    error?: string;
}

const parseDuration = (dur: string | number) => {
    if (typeof dur === 'number') return dur * 60;
    if (typeof dur === 'string') {
        const parts = dur.split(':').map(Number);
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
    }
    return 7200;
};

const OlympiadTestPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [olympiad, setOlympiad] = useState<OlympiadTestInfo | null>(null);
    const [questions, setQuestions] = useState<OlympiadQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
    const [confirmedAnswers, setConfirmedAnswers] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isStarted, setIsStarted] = useState(false);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);
    const [warningMsg, setWarningMsg] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const answersRef = useRef<Record<string, AnswerValue>>({});
    const tabSwitchesRef = useRef(0);
    const timeLeftRef = useRef(0);

    // Sync refs
    useEffect(() => { answersRef.current = answers; }, [answers]);
    useEffect(() => { tabSwitchesRef.current = tabSwitches; }, [tabSwitches]);
    useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

    // Theme Toggle
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const finishTest = React.useCallback(async (reason: string = "manual") => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error("Exit fullscreen failed:", err));
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        const token = localStorage.getItem('token');
        const totalDuration = olympiad?.duration ? parseDuration(olympiad.duration) : 7200;
        const timeTaken = totalDuration - timeLeftRef.current;

        try {
            const res = await fetch(`${API_BASE}/olympiads/${id}/submit/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    answers: answersRef.current,
                    time_taken: timeTaken,
                    tab_switches: tabSwitchesRef.current,
                    reason
                })
            });

            if (res.ok) {
                const data = await res.json() as SubmitResponse;
                if (reason === 'timeout') {
                    toast.info("Vaqt tugadi! Javoblaringiz avtomatik saqlandi.");
                } else if (reason === 'disqualified') {
                    toast.error("Qoidabuzarlik uchun test yakunlandi.");
                } else {
                    toast.success(t(data.message) || t('olympiadTest.submitted'));
                }
                navigate(`/olympiad/${id}/result`);
            } else {
                const err = await res.json() as ErrorResponse;
                toast.error(t(err.error) || "Submission failed");
                navigate(`/olympiad/${id}/result`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error");
            navigate(`/olympiad/${id}/result`);
        }
    }, [id, isSubmitting, navigate, olympiad?.duration, stream, t]);

    // Load Data
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth/login');
            return;
        }

        const initTest = async () => {
            try {
                const startRes = await fetch(`${API_BASE}/olympiads/${id}/start/`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!startRes.ok) {
                    const err = await startRes.json() as ErrorResponse;
                    toast.error(t(err.error) || t('common.error'));
                    navigate('/olympiads');
                    return;
                }

                const attemptData = await startRes.json() as StartTestResponse;
                const attempt = attemptData.attempt;

                const qRes = await fetch(`${API_BASE}/olympiads/${id}/questions/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (qRes.ok) {
                    const data = await qRes.json() as QuestionsResponse;
                    setOlympiad(data.olympiad);
                    if (data.questions) setQuestions(data.questions);

                    if (attempt.answers) {
                        setAnswers(attempt.answers);
                        const confirmed: Record<string, boolean> = {};
                        Object.keys(attempt.answers).forEach(qid => {
                            confirmed[qid] = true;
                        });
                        setConfirmedAnswers(confirmed);
                    }

                    setTabSwitches(attempt.tab_switches_count || 0);

                    // LOGIC: Calculate remaining time
                    const durationSeconds = parseDuration(data.olympiad.duration);
                    const startTime = attempt.submitted_at ? new Date(attempt.submitted_at).getTime() : Date.now();
                    const now = new Date().getTime();
                    const elapsedSeconds = Math.floor((now - startTime) / 1000);

                    let timeRemaining = durationSeconds - elapsedSeconds;

                    // Only constrain by end_date if it exists and is in the future
                    if (data.olympiad.end_date) {
                        const endDate = new Date(data.olympiad.end_date).getTime();
                        if (endDate > now) {
                            const timeUntilEnd = Math.floor((endDate - now) / 1000);
                            timeRemaining = Math.min(timeRemaining, timeUntilEnd);
                        }
                    }

                    if (timeRemaining <= 0) {
                        toast.error("Vaqt tugagan!");
                        navigate(`/olympiad/${id}/result`);
                        return;
                    }

                    setTimeLeft(timeRemaining);

                    if (attempt.status === 'IN_PROGRESS') {
                        setIsStarted(true);
                    }

                } else {
                    const errorData = await qRes.json() as ErrorResponse;
                    toast.error(t(errorData.error) || t('common.error'));
                    navigate('/olympiads');
                }
            } catch (err) {
                console.error(err);
                toast.error(t('common.error'));
            } finally {
                setIsLoading(false);
            }
        };

        initTest();
    }, [id, navigate, t]);

    // Anti-Cheat: Tab Visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isStarted && !isSubmitting) {
                const newCount = tabSwitchesRef.current + 1;
                setTabSwitches(newCount);
                const limit = olympiad?.tab_switch_limit || 3;
                if (newCount >= limit) {
                    finishTest("disqualified");
                } else {
                    // toast.error(t('olympiadTest.warningMsg', { count: newCount, limit: limit }) || `Diqqat! Tabdan chiqish taqiqlanadi. (${newCount}/${limit})`);
                    setWarningMsg(t('olympiadTest.warningMsg', { count: newCount, limit: limit }) || `DIQQAT! Tabdan chiqish taqiqlanadi! (${newCount}/${limit}) - Qoida buzilyapti!`);

                    // Clear warning after 5 seconds
                    setTimeout(() => setWarningMsg(null), 5000);
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [finishTest, isStarted, isSubmitting, olympiad?.tab_switch_limit, t]);

    // Anti-Cheat: Disable Copy/Paste and Context Menu
    useEffect(() => {
        if (!isStarted || isSubmitting || !olympiad?.disable_copy_paste) return;

        const handlePrevent = (e: ClipboardEvent) => {
            e.preventDefault();
            toast.warning(t('olympiadTest.warningNoCopy', "Nusxa ko'chirish taqiqlanadi!"));
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        document.addEventListener('copy', handlePrevent);
        document.addEventListener('paste', handlePrevent);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('copy', handlePrevent);
            document.removeEventListener('paste', handlePrevent);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [isStarted, isSubmitting, olympiad?.disable_copy_paste, t]);

    // Timer
    useEffect(() => {
        if (!isStarted || isSubmitting) return; // Only run timer if started and not submitting

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishTest("timeout"); // Auto submit on timeout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [finishTest, isStarted, isSubmitting]); // Depend on isStarted to start counting down

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access failed:", err);
            toast.error("Kameraga ruxsat berilmadi. Bu olimpiada uchun kamera ulanishi shart.");
            throw err;
        }
    };

    const startTest = async () => {
        if (olympiad?.required_camera) {
            try {
                await startCamera();
            } catch (err) {
                return; // Stop if camera failed
            }
        }

        setIsStarted(true);
        if (olympiad?.required_full_screen) {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => { });
            }
        }
    };

    const handleAnswerChange = (questionId: number, value: AnswerValue) => {
        if (confirmedAnswers[questionId]) return;
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const confirmAnswer = async (questionId: number) => {
        const value = answers[questionId];
        if (value === undefined || value === "") {
            toast.error(t('olympiadTest.placeholder'));
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/olympiads/${id}/submit_answer/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question_id: questionId, answer: value })
            });
            if (res.ok) {
                setConfirmedAnswers(prev => ({ ...prev, [questionId]: true }));
                toast.success(t('common.success'));

                // Auto-advance to next question if not the last one
                if (currentQuestionIndex < questions.length - 1) {
                    setTimeout(() => {
                        setCurrentQuestionIndex(prev => prev + 1);
                    }, 500); // Small delay for better UX
                }
            } else {
                toast.error(t('common.error'));
            }
        } catch (err) {
            console.error('Failed to submit answer', err);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!isStarted) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

                <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                        <Timer className="w-3 h-3" />
                        {olympiad?.duration} daqiqa
                    </div>
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-primary/5">
                        <Maximize className="w-10 h-10 text-primary" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black tracking-tight">{olympiad?.title || "Olimpiada"}</h1>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto">
                            {t('olympiadTest.rulesDesc', 'Test boshlangandan so\'ng tabdan chiqish taqiqlanadi. Omad!')}
                        </p>
                    </div>

                    <Card className="bg-card/50 backdrop-blur border-primary/20 p-6 text-left space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            {t('olympiadTest.rulesTitle')}
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                            <li>{t('olympiadTest.ruleTime', { duration: olympiad?.duration || 0 })}</li>
                            <li>{t('olympiadTest.ruleTabs', { limit: olympiad?.tab_switch_limit || 3 })}</li>
                            {olympiad?.required_full_screen && <li>{t('olympiadTest.ruleFullscreen')}</li>}
                            {olympiad?.disable_copy_paste && <li>{t('olympiadTest.ruleNoCopy')}</li>}
                            <li>{t('olympiadTest.ruleAutoSubmit')}</li>
                        </ul>
                    </Card>

                    <Button size="lg" className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" onClick={startTest}>
                        {t('olympiadTest.start')}
                    </Button>

                    <Button variant="ghost" size="sm" asChild>
                        <a href="/olympiads" className="text-muted-foreground hover:text-foreground">
                            Ortga qaytish
                        </a>
                    </Button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isConfirmed = currentQuestion ? confirmedAnswers[currentQuestion.id] : false;

    // Strict Layout Header
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300 select-none relative">
            {/* Critical Warning Banner */}
            {warningMsg && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-destructive text-destructive-foreground px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border-2 border-red-500/50">
                        <div className="p-2 bg-white/20 rounded-full animate-pulse">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg uppercase tracking-wider">Ogohlantirish!</h4>
                            <p className="font-medium text-lg">{warningMsg}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Camera View */}
            {isStarted && olympiad?.required_camera && (
                <div className="fixed bottom-6 right-6 z-[60] w-32 h-32 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl bg-black animate-in fade-in zoom-in duration-500">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/80 text-[10px] font-bold text-white uppercase tracking-tighter animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        REC
                    </div>
                </div>
            )}

            {/* Minimal Navbar: Logo | Title | Time | Rules | Exit */}
            <header className="h-16 border-b border-border/60 flex items-center justify-between px-4 sm:px-8 bg-background/95 backdrop-blur sticky top-0 z-50">

                {/* Left: Logo & Title */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="font-black text-xl tracking-tighter text-primary flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="hidden sm:inline">Hogwords</span>
                    </div>
                    <div className="h-6 w-px bg-border hidden sm:block"></div>
                    <h2 className="font-bold text-sm sm:text-base truncate max-w-[150px] sm:max-w-xs ">{olympiad?.title}</h2>
                </div>

                {/* Center: Timer */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                    <Timer className={cn("w-4 h-4", timeLeft < 300 ? "text-red-500 animate-pulse" : "text-primary")} />
                    <span className={cn("font-mono font-bold text-lg tabular-nums", timeLeft < 300 ? "text-red-600" : "text-foreground")}>
                        {Math.floor(timeLeft / 3600)}:{Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Mobile Timer */}
                    <div className={cn("md:hidden font-mono font-bold text-sm tabular-nums mr-2", timeLeft < 300 ? "text-red-600" : "text-foreground")}>
                        {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>

                    <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                                <Info className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('olympiadTest.rulesTitle')}</DialogTitle>
                                <DialogDescription>
                                    <ul className="space-y-2 mt-4 text-sm list-disc list-inside text-foreground">
                                        {olympiad?.required_full_screen && <li>{t('olympiadTest.ruleFullscreen')}</li>}
                                        <li>{t('olympiadTest.ruleTabs', { limit: olympiad?.tab_switch_limit || 3 })}</li>
                                        <li>{t('olympiadTest.ruleQuestions', { count: questions.length })}</li>
                                        <li>{t('olympiadTest.rulePoints')}</li>
                                        <li>{t('olympiadTest.ruleAutoSubmit')}</li>
                                    </ul>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    <Button
                        variant="destructive"
                        size="sm"
                        className="font-bold gap-2 px-4"
                        onClick={() => finishTest("manual_exit")}
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('olympiadTest.finish')}</span>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto p-4 sm:p-6 max-w-4xl flex flex-col justify-center min-h-[calc(100vh-4rem)]">
                {currentQuestion && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Question Card */}
                        <Card className="p-6 sm:p-10 space-y-8 bg-card border-border/60 shadow-xl shadow-primary/5 rounded-3xl relative overflow-hidden">
                            {/* Progress Bar Top */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>

                            {isConfirmed && (
                                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 animate-in zoom-in spin-in-90 duration-300">
                                    <div className="p-2 bg-green-500/10 rounded-full text-green-600">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div>
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                            {t('olympiadTest.question')} {currentQuestionIndex + 1} <span className="text-muted-foreground/50">/ {questions.length}</span>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-medium leading-relaxed font-serif">
                                            {currentQuestion.text}
                                        </h3>
                                    </div>
                                    <div className="shrink-0 px-3 py-1.5 bg-primary/10 rounded-lg text-xs font-bold font-mono text-primary whitespace-nowrap">
                                        {currentQuestion.points} Ball
                                    </div>
                                </div>

                                <div className="grid gap-3 pt-2">
                                    {currentQuestion.type === 'MCQ' ? (
                                        currentQuestion.options?.map((opt: string, idx: number) => (
                                            <div
                                                key={idx}
                                                onClick={() => !isConfirmed && handleAnswerChange(currentQuestion.id, idx)}
                                                className={cn(
                                                    "group p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 relative overflow-hidden",
                                                    !isConfirmed ? "cursor-pointer hover:border-primary/50 hover:bg-muted/30" : "cursor-default",
                                                    answers[currentQuestion.id] === idx
                                                        ? "bg-primary/5 border-primary shadow-sm"
                                                        : "bg-card border-muted",
                                                    isConfirmed && answers[currentQuestion.id] !== idx && "opacity-40 grayscale"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-colors shrink-0",
                                                    answers[currentQuestion.id] === idx
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50"
                                                )}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="text-base sm:text-lg font-medium">{opt}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="space-y-2">
                                            <input
                                                type={currentQuestion.type === 'NUMERIC' ? 'number' : 'text'}
                                                className={cn(
                                                    "w-full p-4 text-lg bg-background border-2 border-muted rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all",
                                                    isConfirmed && "bg-muted text-muted-foreground border-transparent cursor-not-allowed"
                                                )}
                                                placeholder={currentQuestion.type === 'NUMERIC' ? "Raqam kiriting..." : "Javobingizni yozing..."}
                                                value={answers[currentQuestion.id] || ''}
                                                disabled={isConfirmed}
                                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isConfirmed && (
                                <div className="pt-4 flex justify-end">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto font-bold shadow-lg shadow-primary/20"
                                        disabled={answers[currentQuestion.id] === undefined || answers[currentQuestion.id] === ""}
                                        onClick={() => confirmAnswer(currentQuestion.id)}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {t('olympiadTest.confirm')}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                <div className="flex justify-between items-center mt-8 px-2">
                    <Button
                        variant="ghost"
                        size="lg"
                        className="text-muted-foreground hover:text-foreground font-medium"
                        disabled={currentQuestionIndex === 0 || olympiad?.cannot_go_back}
                        onClick={() => setCurrentQuestionIndex(p => p - 1)}
                    >
                        {t('olympiadTest.prev')}
                    </Button>

                    <div className="flex gap-4">
                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button
                                size="lg"
                                className="font-bold min-w-[120px]"
                                disabled={!isConfirmed && olympiad?.require_answer_to_proceed} // Optional logic: can proceed without answering? assume yes unless configured
                                onClick={() => setCurrentQuestionIndex(p => p + 1)}
                            >
                                {t('olympiadTest.next')}
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                onClick={() => finishTest("manual_finish")}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold min-w-[120px] shadow-lg shadow-green-600/20"
                            >
                                {t('olympiadTest.finishConfirm')}
                            </Button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OlympiadTestPage;
