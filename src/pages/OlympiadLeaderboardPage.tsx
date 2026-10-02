import { API_URL as API_BASE } from "@/services/api";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
    Trophy,
    Award,
    MapPin,
    Users,
    ChevronLeft,
    CheckCircle2,
    Search,
    Filter,
    ArrowRight,
    Star,
    Medal,
    BarChart3,
    Clock,
    User,
    Shield,
    Info,
    Download,
    FileText,
    Lock
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";


interface Participant {
    id: number;
    rank: number;
    name: string;
    region: string;
    score: number;
    max_score: number;
    time: string;
    avatar?: string;
    prize_status?: string;
    prize_item?: string;
}

interface LeaderboardMyResult {
    rank: number;
    score: number;
    time: string;
}

interface LeaderboardApiResult {
    rank: number;
    score: number;
    time_taken: number;
}

interface LeaderboardApiParticipant {
    rank: number;
    student?: string;
    region?: string;
    score: number;
    time_taken: number;
    prize_status?: string;
    prize_item?: string;
}

interface LeaderboardApiResponse {
    success?: boolean;
    status: string;
    title: string;
    subject: string;
    date: string;
    participants_count: number;
    avg_score: number;
    best_time: number;
    regions_count: number;
    my_result?: LeaderboardApiResult | null;
    leaderboard?: LeaderboardApiParticipant[];
}

interface LeaderboardData {
    status: string;
    title: string;
    subject: string;
    date: string;
    participantsCount: number;
    avgScore: number;
    bestTime: string;
    regionsCount: number;
    myResult: LeaderboardMyResult | null;
    participants: Participant[];
}

const PrizeStatusBadge = ({ status }: { status?: string }) => {
    const { t } = useTranslation();
    if (!status) return null;

    const styles: Record<string, string> = {
        'PENDING': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        'CONTACTED': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'ADDRESS_RECEIVED': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'SHIPPED': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        'COMPLETED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {t(`teacher.prizes.status.${status.toLowerCase()}`)}
        </span>
    );
};

const getMedalStyles = (rank: number) => {
    switch (rank) {
        case 1:
            return {
                bg: "bg-yellow-400",
                text: "text-yellow-950",
                shadow: "shadow-yellow-200",
                icon: <Trophy className="w-8 h-8" />
            };
        case 2:
            return {
                bg: "bg-slate-300",
                text: "text-slate-900",
                shadow: "shadow-slate-200",
                icon: <Award className="w-8 h-8" />
            };
        case 3:
            return {
                bg: "bg-amber-600",
                text: "text-amber-50",
                shadow: "shadow-amber-200",
                icon: <Medal className="w-8 h-8" />
            };
        default:
            return null;
    }
};

const OlympiadLeaderboardPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("all");
    const [timeLeft, setTimeLeft] = useState<string>("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!data?.date || data.status !== 'ONGOING') return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(data.date).getTime() + (24 * 60 * 60 * 1000); // Assuming 24h for now or use actual end_date
            const distance = target - now;

            if (distance < 0) {
                setTimeLeft("00:00:00");
                clearInterval(timer);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [data]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${API_BASE}/olympiads/${id}/leaderboard/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const jsonData = await res.json() as LeaderboardApiResponse;
                    if (jsonData.success) {
                        // Adapt API data to UI structure
                        const adaptedData: LeaderboardData = {
                            status: jsonData.status,
                            title: jsonData.title,
                            subject: jsonData.subject,
                            date: jsonData.date,
                            participantsCount: jsonData.participants_count,
                            avgScore: jsonData.avg_score,
                            bestTime: formatTime(jsonData.best_time),
                            regionsCount: jsonData.regions_count,
                            myResult: jsonData.my_result ? {
                                ...jsonData.my_result,
                                time: formatTime(jsonData.my_result.time_taken)
                            } : null,
                            participants: (jsonData.leaderboard || []).map((p) => ({
                                id: p.rank,
                                rank: p.rank,
                                name: p.student || 'Ishtirokchi',
                                region: p.region || 'Noma’lum',
                                score: p.score,
                                max_score: 100,
                                time: formatTime(p.time_taken),
                                prize_status: p.prize_status,
                                prize_item: p.prize_item
                            }))
                        };
                        setData(adaptedData);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const formatTime = (seconds: number) => {
        if (!seconds) return '-';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground animate-pulse">{t('common.loading')}</p>
        </div>
    );

    if (!data) return null;

    const participants = data?.participants || [];

    // Get unique regions for the filter
    const uniqueRegions = Array.from(new Set(participants.map((p) => p.region))).sort() as string[];

    const filteredParticipants = participants.filter((p) => {
        const name = p?.name || "";
        const region = p?.region || "";
        const search = (searchQuery || "").toLowerCase();

        const matchesSearch = name.toLowerCase().includes(search) ||
            region.toLowerCase().includes(search);
        const matchesRegion = selectedRegion === "all" || p.region === selectedRegion;
        return matchesSearch && matchesRegion;
    });

    const topParticipants = filteredParticipants.slice(0, 3);
    const otherParticipants = filteredParticipants.slice(3);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat(i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">

            <main className="flex-grow pt-8 pb-20">
                <div className="container mx-auto px-4">
                    {/* Back Button */}
                    <Link to={`/olympiad/${id}/result`} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground mb-8 group transition-all">
                        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        {t('leaderboard.back')}
                    </Link>

                    {/* Header Section */}
                    <div className="bg-card rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-border mb-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="flex-1">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4">
                                    {data?.subject || t(`leaderboard.mock.${id === "2" ? "physics_subject" : "math_subject"}`)} • {t('leaderboard.official_results')}
                                </span>
                                <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tighter">
                                    {data?.title || t(`leaderboard.mock.${id === "2" ? "physics_title" : "math_title"}`)}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-primary" />
                                        {formatDate(data?.date)}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4 text-primary" />
                                        {(data?.participantsCount || 0).toLocaleString()} {t('leaderboard.participants')}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        {t('leaderboard.confirmed')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-muted p-6 rounded-3xl border border-border text-center min-w-[140px]">
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{t('leaderboard.avg_ball')}</div>
                                    <div className="text-3xl font-black text-foreground line-none">{data?.avgScore || 0}%</div>
                                </div>
                                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center min-w-[140px] hidden lg:block">
                                    <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">{t('leaderboard.best_time')}</div>
                                    <div className="text-3xl font-black text-primary line-none">{data?.bestTime || '-'}</div>
                                </div>
                                <div className="bg-green-500/5 p-6 rounded-3xl border border-green-500/10 text-center min-w-[140px] hidden xl:block">
                                    <div className="text-[10px] text-green-600 dark:text-green-500 font-bold uppercase tracking-widest mb-1">{t('leaderboard.regions')}</div>
                                    <div className="text-3xl font-black text-green-600 dark:text-green-500 line-none">{data?.regionsCount || 0}</div>
                                </div>
                                <div className="bg-yellow-500/10 p-6 rounded-3xl border border-yellow-500/20 text-center min-w-[140px]">
                                    <div className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold uppercase tracking-widest mb-1">{t('leaderboard.high_ball')}</div>
                                    <div className="text-3xl font-black text-yellow-600 dark:text-yellow-500 line-none">
                                        {participants?.[0]?.score || 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Locked Results Banner */}
                    {data.status !== 'PUBLISHED' && (
                        <div className="bg-card rounded-[3rem] p-12 md:p-20 text-center border-4 border-dashed border-primary/20 mb-12 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
                                    <Lock className="w-12 h-12 text-primary" />
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 tracking-tight">
                                    {data.status === 'ONGOING' ? t('leaderboard.ongoing') : t('leaderboard.checking')}
                                </h2>
                                {data.status === 'ONGOING' && timeLeft && (
                                    <div className="flex flex-col items-center gap-3 mb-10">
                                        <span className="text-sm font-bold text-primary uppercase tracking-[0.2em]">
                                            {t('leaderboard.countdown')}
                                        </span>
                                        <div className="flex gap-2">
                                            {timeLeft.split(':').map((unit, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl font-black text-primary border border-primary/20">
                                                        {unit}
                                                    </div>
                                                    {i < 2 && <span className="text-2xl font-black text-primary/30">:</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col items-center gap-6">
                                    <div className="px-8 py-4 bg-muted rounded-2xl border border-border flex items-center gap-4">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                            {t('leaderboard.stats_only')}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
                                        <div className="bg-muted/50 p-6 rounded-3xl border border-border">
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{t('leaderboard.participants')}</div>
                                            <div className="text-2xl font-black text-foreground">{data.participantsCount}</div>
                                        </div>
                                        <div className="bg-muted/50 p-6 rounded-3xl border border-border">
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{t('leaderboard.avg_ball')}</div>
                                            <div className="text-2xl font-black text-foreground">{data.avgScore}%</div>
                                        </div>
                                        <div className="bg-muted/50 p-6 rounded-3xl border border-border col-span-2 md:col-span-1">
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{t('leaderboard.regions')}</div>
                                            <div className="text-2xl font-black text-foreground">{data.regionsCount}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* My Result Card */}
                    {data.myResult && (
                        <div className="bg-primary text-primary-foreground rounded-[2rem] p-8 mb-12 shadow-xl shadow-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-bottom duration-700">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center font-black text-2xl backdrop-blur-sm">
                                    #{data.myResult.rank}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">{t('leaderboard.my_result')}</h3>
                                    <p className="opacity-80 font-medium">{t('leaderboard.congrats') || 'Ajoyib natija! Siz kuchli ishtirokchilar orasidasiz.'}</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-center">
                                <div className="text-center px-6 border-r border-white/10">
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{t('leaderboard.headers.ball')}</div>
                                    <div className="text-3xl font-black">{data.myResult.score}</div>
                                </div>
                                <div className="text-center px-6">
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{t('leaderboard.headers.time')}</div>
                                    <div className="text-3xl font-black">{data.myResult.time}</div>
                                </div>
                                <Button variant="secondary" size="lg" className="rounded-2xl font-bold ml-4" asChild>
                                    <Link to={`/olympiad/${id}/result`}>{t('dashboard.profile.olympiads.viewResult')}</Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Winners Podium */}
                    {data.status === 'PUBLISHED' && filteredParticipants.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative">
                            {/* 2nd Place */}
                            <div className="md:order-1 flex flex-col justify-end">
                                {topParticipants[1] && <WinnerCard participant={topParticipants[1]} rank={2} />}
                            </div>
                            {/* 1st Place */}
                            <div className="md:order-2 flex flex-col justify-end md:-translate-y-8">
                                {topParticipants[0] && <WinnerCard participant={topParticipants[0]} rank={1} isFeatured={true} />}
                            </div>
                            {/* 3rd Place */}
                            <div className="md:order-3 flex flex-col justify-end">
                                {topParticipants[2] && <WinnerCard participant={topParticipants[2]} rank={3} />}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-card rounded-[3rem] border border-border mb-12 shadow-sm">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-4">{t('leaderboard.empty')}</h3>
                            <p className="text-muted-foreground font-medium max-w-md mx-auto px-6">
                                {t('leaderboard.emptyDesc')}
                            </p>
                        </div>
                    )}

                    {data.status === 'PUBLISHED' && participants.length > 0 && filteredParticipants.length === 0 && (
                        <div className="text-center py-24 bg-card rounded-[3rem] border border-border mb-12 shadow-sm">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-4">{t('leaderboard.no_results') || 'Natijalar topilmadi'}</h3>
                            <p className="text-muted-foreground font-medium max-w-md mx-auto px-6">
                                {t('leaderboard.no_results_desc') || 'Siz qidirgan kriteriyalar bo\'yicha hech qanday natija topilmadi. Qidiruvni o\'zgartirib ko\'ring.'}
                            </p>
                        </div>
                    )}

                    {/* Leaderboard Table Section */}
                    {data.status === 'PUBLISHED' && filteredParticipants.length > 3 && (
                        <div className="bg-card rounded-[2rem] shadow-sm border border-border overflow-hidden">
                            <div className="p-8 border-b border-border flex flex-col md:flex-row justify-between items-center gap-6">
                                <h2 className="text-2xl font-black text-foreground tracking-tight">{t('leaderboard.title')}</h2>

                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                    <Button variant="outline" className="rounded-2xl font-bold border-border bg-muted/30 hover:bg-muted/50 hidden lg:flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        PDF
                                    </Button>
                                    <div className="relative min-w-[200px]">
                                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <select
                                            className="w-full pl-11 pr-10 py-3 bg-muted border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold text-foreground transition-all"
                                            value={selectedRegion}
                                            onChange={(e) => setSelectedRegion(e.target.value)}
                                        >
                                            <option value="all">{t('leaderboard.all_regions')}</option>
                                            {uniqueRegions.map(reg => (
                                                <option key={reg} value={reg}>{reg}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative w-full md:w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder={t('leaderboard.search_placeholder')}
                                            className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr className="text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            <th className="px-8 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {t('leaderboard.headers.rank')}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-primary transition-colors cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-popover text-popover-foreground border border-border px-3 py-2 text-[11px] font-bold max-w-xs rounded-xl shadow-xl">
                                                                {t('leaderboard.rank_info')}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </th>
                                            <th className="px-8 py-4">{t('leaderboard.headers.participant')}</th>
                                            <th className="px-8 py-4">{t('leaderboard.headers.region')}</th>
                                            <th className="px-8 py-4">{t('leaderboard.headers.time')}</th>
                                            <th className="px-8 py-4">{t('leaderboard.headers.ball')}</th>
                                            <th className="px-8 py-4 text-right">{t('leaderboard.headers.progress')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {otherParticipants.length > 0 ? (
                                            otherParticipants.map((p) => (
                                                <tr key={p.id} className="hover:bg-muted/50 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <span className="font-black text-muted-foreground text-sm group-hover:text-foreground transition-colors">#{p.rank}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                                {p.name.charAt(0)}
                                                            </div>
                                                            <span className="font-bold text-foreground text-sm">{p.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {p.region}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs text-muted-foreground font-medium">{p.time}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-foreground text-sm">{p.score}</span>
                                                            <span className="text-[10px] text-muted-foreground">/{p.max_score}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col items-end gap-2">
                                                            {p.prize_status && <PrizeStatusBadge status={p.prize_status} />}
                                                            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                                                    style={{ width: `${(p.score / p.max_score) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Users className="w-12 h-12 text-muted-foreground/30" />
                                                        <p className="text-muted-foreground font-bold">{t('leaderboard.empty')}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-8 bg-muted/30 border-t border-border flex justify-center">
                                <Button variant="outline" className="rounded-2xl font-bold text-xs h-12 px-8 border-border hover:bg-card transition-all shadow-sm">
                                    {t('leaderboard.load_more')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

        </div>
    );
};

const WinnerCard = ({ participant, rank, isFeatured = false }: { participant: Participant; rank: number; isFeatured?: boolean }) => {
    const medal = getMedalStyles(rank);
    const { t } = useTranslation();
    if (!medal) return null;

    return (
        <div className={`relative bg-card rounded-[2rem] p-8 shadow-sm border border-border transition-all duration-500 hover:shadow-xl hover:-translate-y-2 group ${isFeatured ? 'md:p-10 ring-4 ring-yellow-500/10' : ''}`}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                {medal.icon}
            </div>

            <div className="flex flex-col items-center text-center">
                <div className={`relative mb-6 ${isFeatured ? 'w-24 h-24' : 'w-20 h-20'}`}>
                    <div className={`w-full h-full rounded-3xl ${medal.bg} ${medal.shadow} shadow-lg rotate-12 flex items-center justify-center transition-transform group-hover:rotate-0 duration-500`}>
                        <div className="-rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <User className={`text-white ${isFeatured ? 'w-10 h-10' : 'w-8 h-8'}`} />
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-card rounded-xl px-3 py-1 shadow-md border border-border text-[10px] font-black uppercase text-foreground ring-2 ring-background">
                        #{rank}
                    </div>
                </div>

                <h3 className={`font-black text-foreground tracking-tight mb-2 ${isFeatured ? 'text-2xl' : 'text-xl'}`}>
                    {participant.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold uppercase tracking-wider mb-6">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {participant.region}
                </div>

                {participant.prize_status && (
                    <div className="mb-4">
                        <PrizeStatusBadge status={participant.prize_status} />
                    </div>
                )}

                <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-border">
                    <div className="text-center">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">{t('leaderboard.headers.ball')}</div>
                        <div className="text-lg font-black text-foreground leading-none">{participant.score}</div>
                    </div>
                    <div className="text-center border-l border-border">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">{t('leaderboard.headers.time')}</div>
                        <div className="text-lg font-black text-foreground leading-none">{participant.time}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OlympiadLeaderboardPage;
