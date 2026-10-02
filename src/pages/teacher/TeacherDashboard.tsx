import { useEffect, useState } from "react";
import { Users, BookOpen, Star, Clock, Video, Plus, Send, Loader2, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { WalletCard } from "@/components/teacher/WalletCard";

const TeacherDashboard = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState<any>(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [stats, setStats] = useState({
        students_count: 0,
        active_courses: 0,
        rating: 0,
        total_lessons: 0,
        avg_score: 0
    });
    const [recentWinners, setRecentWinners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }

        // Check if welcome message was shown in this session
        const welcomeShown = sessionStorage.getItem('teacher_welcome_shown');
        if (!welcomeShown) {
            setShowWelcome(true);
            sessionStorage.setItem('teacher_welcome_shown', 'true');
            // Hide after 3 seconds
            setTimeout(() => {
                setShowWelcome(false);
            }, 3000);
        }

        fetchStats();
        fetchRecentWinners();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/teacher/stats/`, { headers: getAuthHeader() });
            setStats(res.data);
        } catch (error) {
            console.error(error);
            // toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentWinners = async () => {
        try {
            const res = await axios.get(`${API_URL}/winner-prizes/?limit=5`, { headers: getAuthHeader() });
            setRecentWinners(res.data.results || []);
        } catch (error) {
            console.error(error);
        }
    };

    const statItems = [
        { label: t('teacher.dashboard.stats.students'), value: stats.students_count, icon: Users, color: "text-primary", bg: "bg-primary/10" },
        { label: t('teacher.dashboard.stats.courses'), value: stats.active_courses, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
        { label: t('teacher.dashboard.stats.avg_score'), value: stats.avg_score + '%', icon: Star, color: "text-primary", bg: "bg-primary/10" },
        { label: t('teacher.dashboard.stats.lessons'), value: stats.total_lessons, icon: Clock, color: "text-primary", bg: "bg-primary/10" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Welcome Animation Overlay */}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md transition-opacity duration-1000 pointer-events-none
                ${showWelcome ? 'opacity-100' : 'opacity-0'}`}
            >
                <div className={`text-center transition-transform duration-1000 ${showWelcome ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
                    <div className="inline-flex p-5 rounded-3xl bg-primary/10 text-primary mb-8 shadow-gold animate-bounce">
                        <Star className="w-16 h-16 fill-primary" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-primary mb-6 tracking-tighter font-cinzel">
                        {t('teacher.dashboard.welcome')}
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium uppercase tracking-widest font-cinzel">
                        {t('teacher.dashboard.welcomeMessage')}
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight font-cinzel">{t('teacher.dashboard.title')}</h1>
                    <p className="text-muted-foreground font-medium mt-1">{t('teacher.dashboard.welcomeMessage')}</p>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                    <p className="text-xs font-black text-primary uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statItems.map((stat) => (
                    <Card key={stat.label} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 text-green-500 font-medium">
                                {t('teacher.dashboard.stats.realTime')}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <Card className="border-border overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b border-border">
                            <CardTitle className="text-lg font-black font-cinzel tracking-tight">{t('teacher.dashboard.quickActions')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link to="/teacher/courses">
                                <Button className="w-full justify-start gap-3 h-14 bg-primary text-primary-foreground hover:bg-primary-light rounded-xl font-bold text-base shadow-gold">
                                    <Plus className="w-6 h-6" /> {t('teacher.courses.newCourse')}
                                </Button>
                            </Link>
                            <Link to="/teacher/olympiads">
                                <Button variant="outline" className="w-full justify-start gap-3 h-14 border-primary/20 text-primary hover:bg-primary/5 rounded-xl font-bold text-base">
                                    <Trophy className="w-6 h-6" /> {t('teacher.olympiads.new')}
                                </Button>
                            </Link>
                            <Link to="/teacher/students">
                                <Button variant="secondary" className="w-full justify-start gap-3 h-14 rounded-xl font-bold text-base">
                                    <Users className="w-6 h-6" /> {t('teacher.dashboard.stats.students')}
                                </Button>
                            </Link>
                            <Link to="/teacher/olympiads">
                                <Button variant="secondary" className="w-full justify-start gap-3 h-14 rounded-xl font-bold text-base">
                                    <Send className="w-6 h-6" /> {t('teacher.olympiads.results')}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Recent Winners */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{t('teacher.prizes.recentWinners')}</CardTitle>
                                <CardDescription>{t('teacher.dashboard.recentActivityDesc')}</CardDescription>
                            </div>
                            <Link to="/teacher/prizes">
                                <Button variant="ghost" size="sm" className="text-primary font-bold">
                                    {t('common.viewAll')}
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentWinners.length > 0 ? (
                                <div className="space-y-4">
                                    {recentWinners.map((winner) => (
                                        <div key={winner.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/50 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
                                                    <Trophy className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{winner.student_name}</p>
                                                    <p className="text-xs text-muted-foreground">{winner.olympiad_title}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${winner.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                    winner.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                                                        winner.status === 'ADDRESS_RECEIVED' ? 'bg-orange-500/10 text-orange-500' :
                                                            'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {t(`teacher.prizes.${winner.status.toLowerCase()}`)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('teacher.prizes.noPrizes')}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <Card className={`${user?.teacher_profile?.is_premium ? 'bg-gradient-to-br from-primary-dark via-primary to-primary-light shadow-gold' : 'bg-gradient-to-br from-slate-800 to-black border border-border'} text-primary-foreground border-none transition-all duration-500 hover:scale-[1.02]`}>
                        <CardHeader>
                            <CardTitle className={`text-lg font-cinzel font-black tracking-tight ${!user?.teacher_profile?.is_premium && 'text-primary'}`}>
                                {user?.teacher_profile?.is_premium ? t('teacher.dashboard.premiumTitle') : t('teacher.dashboard.premiumTitleStandard')}
                            </CardTitle>
                            <CardDescription className={user?.teacher_profile?.is_premium ? 'text-primary-foreground/80' : 'text-muted-foreground'}>{t('teacher.dashboard.ratingDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-2xl ${user?.teacher_profile?.is_premium ? 'bg-primary-foreground/10' : 'bg-primary/10'}`}>
                                    <Star className={`w-6 h-6 fill-current ${user?.teacher_profile?.is_premium ? 'text-primary-foreground' : 'text-primary'}`} />
                                </div>
                                <span className={`text-3xl font-black font-cinzel ${user?.teacher_profile?.is_premium ? 'text-primary-foreground' : 'text-primary'}`}>{stats.rating}/5.0</span>
                            </div>
                            <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${user?.teacher_profile?.is_premium ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {t('teacher.dashboard.studentsSatisfied')}
                            </p>
                            {!user?.teacher_profile?.is_premium && (
                                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary-light font-black rounded-xl">
                                    {t('teacher.dashboard.upgradeButton')}
                                </Button>
                            )}
                            {user?.teacher_profile?.is_premium && (
                                <Button variant="secondary" className="w-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 font-black rounded-xl border border-white/10">
                                    {t('common.details')}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <WalletCard />
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;

