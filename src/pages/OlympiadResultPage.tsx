import { API_URL as API_BASE } from "@/services/api";
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Target, CheckCircle, XCircle, BarChart3, ArrowRight, Home, LayoutDashboard, Download, Award, Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { toast } from 'sonner';


const OlympiadResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [result, setResult] = useState<any>(null);
    const [olympiad, setOlympiad] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [winners, setWinners] = useState<any[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth/login');
                return;
            }

            try {
                // Fetch Olympiad details first for context
                const olRes = await fetch(`${API_BASE}/olympiads/${id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (olRes.ok) {
                    const olData = await olRes.json();
                    setOlympiad(olData);
                }

                // Fetch Result
                const res = await fetch(`${API_BASE}/olympiads/${id}/result/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success === false && data.status === 'NO_RESULT') {
                        setResult(null); // Explicitly null to show "Not Found" UI
                    } else {
                        setResult(data);
                        if (data.my_result?.percentage >= 70 && data.status !== 'DISQUALIFIED') {
                            setShowConfetti(true);
                            setTimeout(() => setShowConfetti(false), 8000);
                        }
                    }
                } else if (res.status === 404) {
                    toast.error(t('olympiadResult.notFinished'));
                }

                // Fetch Winners
                const winRes = await fetch(`${API_BASE}/olympiads/${id}/winners/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (winRes.ok) {
                    const winData = await winRes.json();
                    setWinners(winData.winners || []);
                }
            } catch (err) {
                console.error(err);
                toast.error(t('common.error'));
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id, navigate, t]);

    useEffect(() => {
        if (result?.status === 'WAITING_RESULTS' && result.result_time) {
            const targetTime = new Date(result.result_time).getTime();

            const timer = setInterval(() => {
                const now = new Date().getTime();
                const diff = targetTime - now;

                if (diff <= 0) {
                    clearInterval(timer);
                    setTimeLeft('00:00:00');
                    window.location.reload(); // Auto refresh when time comes
                } else {
                    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeLeft(`${h}h ${m}m ${s}s`);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [result]);

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground animate-pulse">{t('olympiadResult.loading')}</p>
        </div>
    );


    // Initial Waiting State UI
    if (result.status === 'WAITING_RESULTS') {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

                <div className="max-w-md w-full space-y-8 z-10 animate-in fade-in zoom-in duration-500">
                    <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-500/5">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black tracking-tight">{t('olympiadResult.submitted', 'Test Yakunlandi!')}</h1>
                        <p className="text-muted-foreground text-lg">
                            {t('olympiadResult.waitingDesc', 'Natijalar e\'lon qilinishini kuting. Barchaga omad!')}
                        </p>
                    </div>

                    <Card className="p-8 border-2 border-primary/20 bg-card/50 backdrop-blur">
                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">
                            {t('olympiadResult.resultsIn', 'Natijalar chiqishiga qoldi:')}
                        </div>
                        <div className="text-5xl font-black tabular-nums text-primary tracking-tight">
                            {timeLeft || "..."}
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground">
                            {new Date(result.result_time).toLocaleString()} da e'lon qilinadi
                        </div>
                    </Card>

                    <Button variant="outline" size="lg" className="w-full h-12 font-bold" asChild>
                        <Link to="/olympiads">
                            <Home className="mr-2 w-4 h-4" />
                            {t('olympiadResult.backToOlympiads')}
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const PrizeStatusBadge = ({ status }: { status?: string }) => {
        if (!status) return null;

        const styles: Record<string, string> = {
            'PENDING': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            'CONTACTED': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'ADDRESS_RECEIVED': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            'SHIPPED': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
            'COMPLETED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        };

        return (
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {t(`teacher.prizes.status.${status.toLowerCase()}`)}
            </span>
        );
    };

    const tr = (text: string) => {
        if (!text) return '';
        const cleanText = text.trim();
        const lang = i18n.language.split('-')[0];

        const BACKEND_TRANSLATIONS: Record<string, Record<string, string>> = {
            'Matematika': { 'ru': 'Математика', 'uz': 'Matematika' },
            'Mateamtika': { 'ru': 'Математика', 'uz': 'Matematika' },
            'Fizika': { 'ru': 'Физика', 'uz': 'Fizika' },
            'Informatika': { 'ru': 'Информатика', 'uz': 'Informatika' }
        };

        if (BACKEND_TRANSLATIONS[cleanText] && BACKEND_TRANSLATIONS[cleanText][lang]) {
            return BACKEND_TRANSLATIONS[cleanText][lang];
        }
        return t(cleanText, { defaultValue: cleanText });
    };

    const formatTime = (seconds: number | undefined | null) => {
        if (seconds === undefined || seconds === null || isNaN(seconds)) return `0${t('common.seconds_short', 's')}`;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const hStr = t('common.hours_short', 'h');
        const mStr = t('common.minutes_short', 'm');
        const sStr = t('common.seconds_short', 's');

        return h > 0 ? `${h}${hStr} ${m}${mStr} ${s}${sStr}` : `${m}${mStr} ${s}${sStr}`;
    };

    // Safe percentage calculation to prevent NaN
    const safePercentage = (value: number | undefined | null): number => {
        if (value === undefined || value === null || isNaN(value)) return 0;
        return Math.max(0, Math.min(100, Math.round(value)));
    };

    const percentage = safePercentage(result.my_result?.percentage);
    const isPassed = percentage >= 70;
    const isDisqualified = result.my_result?.status === 'DISQUALIFIED';
    const hasParticipated = !!result.my_result;

    const handleDownloadCertificate = () => {
        // Simple printable cert for now
        window.print();
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {showConfetti && <Confetti recycle={false} numberOfPieces={300} gravity={0.1} />}

            <div className="max-w-3xl w-full space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                        <Trophy className="w-3 h-3" />
                        {tr(olympiad?.title) || t('common.olympiad')}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {!hasParticipated
                            ? t('olympiadResult.globalResults', 'Olimpiada Natijalari')
                            : isDisqualified
                                ? t('olympiadResult.disqualifiedTitle')
                                : t('olympiadResult.yourResult')}
                    </h1>
                    <p className="text-muted-foreground">
                        {!hasParticipated
                            ? t('olympiadResult.notParticipatedDesc', 'Siz ushbu olimpiadada ishtirok etmadingiz, lekin umumiy natijalarni ko\'rishingiz mumkin.')
                            : isDisqualified
                                ? t('olympiadResult.disqualifiedMsg')
                                : isPassed
                                    ? t('olympiadResult.passedMsg')
                                    : t('olympiadResult.recordedMsg')}
                    </p>
                </div>

                {/* Certificate Section if Passed */}
                {isPassed && !isDisqualified && olympiad?.status === 'PUBLISHED' && (
                    <Card className="p-6 bg-primary/5 border-2 border-primary/20 rounded-3xl overflow-hidden relative group">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg group-hover:rotate-3 transition-transform">
                                    <Award className="w-12 h-12 text-primary" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl font-black">{t('olympiadResult.hasCertificate')}</h3>
                                    <p className="text-sm text-muted-foreground font-medium">{t('olympiadResult.certReason')}</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleDownloadCertificate}
                                className="h-12 px-8 bg-primary hover:bg-primary/90 text-background font-bold rounded-xl shadow-lg shadow-gold/20"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                {t('olympiadResult.downloadCert')}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Main Score & Percentage */}
                {hasParticipated ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Score Card */}
                        <Card className="relative overflow-hidden p-8 flex flex-col items-center justify-center border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card to-primary/5 group transition-all hover:border-primary/40">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <Target className="w-24 h-24" />
                            </div>
                            <div className="relative z-10 text-center space-y-2">
                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('olympiadResult.scoreEarned')}</div>
                                <div className="text-6xl font-black text-primary tabular-nums">
                                    {result.my_result?.score}
                                </div>
                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-tighter italic opacity-60">{t('olympiadResult.avgScore')} {result.avg_score}</div>
                            </div>
                        </Card>

                        {/* Efficiency Card */}
                        <Card className={cn(
                            "relative overflow-hidden p-8 flex flex-col items-center justify-center border-2 shadow-xl bg-gradient-to-br transition-all hover:scale-[1.02]",
                            isPassed && !isDisqualified ? "border-green-500/20 from-card to-green-500/5 hover:border-green-500/40" : "border-yellow-500/20 from-card to-yellow-500/5 hover:border-yellow-500/40",
                            isDisqualified && "border-red-500/20 from-card to-red-500/5"
                        )}>
                            <div className="relative z-10 w-full text-center space-y-4">
                                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('olympiadResult.efficiency')}</div>
                                <div className={cn(
                                    "text-6xl font-black tabular-nums",
                                    isPassed && !isDisqualified ? "text-green-600" : "text-yellow-600",
                                    isDisqualified && "text-red-600"
                                )}>
                                    {percentage}%
                                </div>
                                {/* Progress bar */}
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-1000",
                                            isPassed && !isDisqualified ? "bg-green-500" : "bg-yellow-500",
                                            isDisqualified && "bg-red-500"
                                        )}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <Card className="p-8 border-2 border-dashed border-muted flex flex-col items-center justify-center text-center space-y-4 bg-muted/5">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <BarChart3 className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{t('olympiadResult.noPersonalResult', 'Shaxsiy natija mavjud emas')}</h3>
                            <p className="text-sm text-muted-foreground">{t('olympiadResult.noPersonalResultDesc', 'Siz ushbu olimpiadada ishtirok etmadingiz yoki testingiz hali yakunlanmagan.')}</p>
                        </div>
                    </Card>
                )}

                {/* PRIZES SECTION */}
                {winners.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Award className="w-5 h-5 text-amber-500" />
                            <h2 className="text-xl font-black uppercase tracking-tight">{t('olympiadResult.prizes', 'Sovrinlar')}</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {winners.slice(0, 6).map((winner, idx) => (
                                <Card key={idx} className="p-4 border-2 border-primary/10 bg-card/40 backdrop-blur overflow-hidden relative group hover:border-primary/30 transition-all">
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary text-xl">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-black truncate">{winner.student_name}</div>
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase truncate">{winner.prize_item_name}</div>
                                        </div>
                                        {winner.student === result?.my_result?.student && (
                                            <Badge className="bg-green-500 text-white border-0">{t('common.you')}</Badge>
                                        )}
                                    </div>
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Trophy className="w-12 h-12 text-primary" />
                                    </div>
                                    {winner.student === result?.my_result?.student && (
                                        <div className="mt-3 flex items-center justify-between pt-3 border-t border-primary/10">
                                            <span className="text-[10px] font-bold text-muted-foreground">{t('olympiadResult.deliveryStatus')}</span>
                                            <PrizeStatusBadge status={winner.status} />
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                        {winners.length > 6 && (
                            <p className="text-center text-[10px] text-muted-foreground font-medium italic">
                                + {winners.length - 6} {t('olympiadResult.moreWinners', 'yana g\'oliblar...')}
                            </p>
                        )}
                    </div>
                )}

                {/* LEADERBOARD PREVIEW */}
                <Card className="overflow-hidden border-border bg-card/30 backdrop-blur-sm">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                        <div className="flex items-center gap-2 font-bold">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            {t('olympiadResult.topParticipants')}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase font-black">
                            {t('olympiadResult.total')} {result.participants_count}
                        </div>
                    </div>
                    <div className="divide-y divide-border">
                        {result.leaderboard?.map((item: any, idx: number) => (
                            <div key={idx} className={cn(
                                "flex items-center justify-between p-4 transition-colors",
                                item.student === result.my_result?.student ? "bg-primary/5" : "hover:bg-muted/10"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs",
                                        idx === 0 ? "bg-amber-100 text-amber-700" :
                                            idx === 1 ? "bg-slate-100 text-slate-700" :
                                                idx === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"
                                    )}>
                                        {item.rank}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold flex items-center gap-2">
                                            {item.student}
                                            {item.student === result.my_result?.student && <Badge className="h-4 text-[8px] p-1">{t('olympiadResult.you')}</Badge>}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {item.region}
                                            </div>
                                            {item.prize_status && <PrizeStatusBadge status={item.prize_status} />}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-primary">{item.score}</div>
                                    <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(item.time_taken)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="p-4 flex flex-col items-center justify-center space-y-1 text-center bg-card/50">
                        <Clock className="w-5 h-5 text-primary mb-1" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('olympiadResult.avgScore')}</span>
                        <span className="text-sm font-black tabular-nums uppercase">{result.avg_score || 0}%</span>
                    </Card>

                    <Card className="p-4 flex flex-col items-center justify-center space-y-1 text-center bg-card/50">
                        <Trophy className="w-5 h-5 text-amber-500 mb-1" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('olympiadResult.rank')}</span>
                        <span className="text-sm font-black tabular-nums">{hasParticipated ? `#${result.my_result?.rank}` : '-'}</span>
                    </Card>

                    <Card className="p-4 flex flex-col items-center justify-center space-y-1 text-center bg-card/50">
                        <LayoutDashboard className="w-5 h-5 text-primary/60 mb-1" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('olympiadResult.participants')}</span>
                        <span className="text-sm font-black tabular-nums">{result.participants_count}</span>
                    </Card>

                    <Card className="p-4 flex flex-col items-center justify-center space-y-1 text-center bg-card/50">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mb-1" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('olympiadResult.status')}</span>
                        <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                            hasParticipated && isDisqualified ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"
                        )}>
                            {hasParticipated && isDisqualified
                                ? t('olympiadResult.disqualified')
                                : t(`olympiadResult.status_${String(result.status || "").toLowerCase()}`, { defaultValue: result.status })}
                        </span>
                    </Card>
                </div>

                {/* Disqualified Warning */}
                {isDisqualified && (
                    <div className="p-6 bg-red-500/10 border-2 border-red-500/20 rounded-2xl flex items-start gap-4 text-red-600 animate-pulse">
                        <XCircle className="w-8 h-8 shrink-0 mt-1" />
                        <div className="space-y-1">
                            <p className="font-black text-lg">{t('olympiadResult.disqualified')}</p>
                            <p className="text-sm opacity-90 leading-relaxed font-medium">
                                {t('olympiadResult.disqualifiedDesc', { count: result.tab_switches_count })}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button variant="outline" size="lg" className="flex-1 h-14 font-bold border-2 hover:bg-muted" asChild>
                        <Link to="/olympiads">
                            <Home className="mr-2 w-5 h-5" />
                            {t('olympiadResult.backToOlympiads')}
                        </Link>
                    </Button>
                    <Button size="lg" className="flex-1 h-14 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95" asChild>
                        <Link to={`/olympiad/${id}/results`}>
                            {t('olympiadResult.viewLeaderboard')}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OlympiadResultPage;
