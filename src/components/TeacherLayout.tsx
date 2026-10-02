import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    Users,
    LogOut,
    User,
    MessageSquare,
    Bell,
    Globe,
    Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { API_URL, getBaseUrl, getImageUrl } from "@/services/api";
import NotificationBell from './NotificationBell';
import { useTranslation } from "react-i18next";
import authService from "@/services/authService";

const TeacherLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Try to get from localStorage first for immediate UI
                const cachedUser = localStorage.getItem('user');
                if (cachedUser) {
                    setUser(JSON.parse(cachedUser));
                }

                // Call API to get fresh data
                const freshUser = await authService.getMe();
                if (freshUser) {
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                }
            } catch (error) {
                console.error("Failed to sync teacher profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Derived states
    const isAuthorized = user?.role === 'TEACHER';
    const isProfileComplete = user?.teacher_profile?.bio &&
        user?.teacher_profile?.specialization &&
        user?.teacher_profile?.verification_status === 'APPROVED';

    const isPending = !!(user?.teacher_profile?.verification_status === 'PENDING' && user?.teacher_profile?.bio);

    useEffect(() => {
        if (!loading && !isAuthorized) {
            navigate('/teacher/login');
            return;
        }

        if (!loading) {
            // Check if user was updated in localStorage (e.g., from Onboarding)
            const cachedUserStr = localStorage.getItem('user');
            let currentUser = user;
            if (cachedUserStr) {
                try {
                    const parsed = JSON.parse(cachedUserStr);
                    // Minimal check if verification_status has changed
                    if (parsed?.teacher_profile?.verification_status !== user?.teacher_profile?.verification_status) {
                        currentUser = parsed;
                        setUser(parsed);
                    }
                } catch (e) {
                    console.error("Failed to parse cached user");
                }
            }

            const currentIsProfileComplete = currentUser?.teacher_profile?.bio &&
                currentUser?.teacher_profile?.specialization &&
                currentUser?.teacher_profile?.verification_status === 'APPROVED';

            const currentIsPending = !!(currentUser?.teacher_profile?.verification_status === 'PENDING' && currentUser?.teacher_profile?.bio);

            // If on onboarding page, allow it
            if (location.pathname === '/teacher/onboarding') return;

            // If profile not complete, not pending, and not on onboarding, force redirection
            if (!currentIsProfileComplete && !currentIsPending && location.pathname !== '/teacher/onboarding') {
                navigate('/teacher/onboarding');
            }
        }
    }, [navigate, isAuthorized, user, location.pathname, loading]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/teacher/login');
    };

    const sidebarItems = [
        { icon: LayoutDashboard, label: t('teacher.dashboard.title'), path: "/teacher/dashboard" },
        { icon: BookOpen, label: t('teacher.courses.title'), path: "/teacher/courses" },
        { icon: Trophy, label: t('teacher.olympiads.title'), path: "/teacher/olympiads" },
        { icon: Users, label: t('teacher.dashboard.stats.students'), path: "/teacher/students" },
        { icon: Trophy, label: t('teacher.prizes.title'), path: "/teacher/prizes" },
        { icon: MessageSquare, label: t('nav.messages'), path: "/teacher/messages" },
        { icon: Wallet, label: t('wallet.title', 'Hamyon'), path: "/teacher/wallet" },
        { icon: User, label: t('nav.profile'), path: "/teacher/profile" },
    ];

    return (
        <div className="min-h-screen bg-background flex text-foreground">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border fixed inset-y-0 left-0 z-50 flex flex-col shadow-2xl">
                <div className="p-6 border-b border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-gold">
                        <img src="/logo.jpg" alt="Logo" className="w-7 h-7 object-contain" />
                    </div>
                    <span className="font-black font-cinzel text-xl text-primary tracking-tighter">Hogwords Mentor</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
                    {!isProfileComplete && !isPending && (
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 mb-4 animate-pulse">
                            <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2 font-cinzel">
                                {t('teacher.onboarding.attentionTitle')}
                            </p>
                            <p className="text-xs font-bold text-primary/80 leading-tight">
                                {t('teacher.onboarding.attentionDescription')}
                            </p>
                        </div>
                    )}

                    {isPending && (
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 mb-4">
                            <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2 font-cinzel">
                                {t('teacher.onboarding.pendingTitle')}
                            </p>
                            <p className="text-xs font-bold text-primary/80 leading-tight">
                                {t('teacher.onboarding.pendingDescription')}
                            </p>
                        </div>
                    )}
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    disabled={!isProfileComplete && item.path !== '/teacher/profile' && item.path !== '/teacher/onboarding'}
                                    className={`w-full justify-start gap-3 mb-1 rounded-xl transition-all duration-300 ${isActive
                                        ? "bg-primary/10 font-bold text-primary shadow-[inset_0_0_10px_rgba(255,215,0,0.1)] border border-primary/20"
                                        : "text-muted-foreground hover:text-primary hover:bg-primary/5 opacity-70"}`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                                    <span className="font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border bg-black/20">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center gap-2 mb-2 border-border hover:bg-primary/5 hover:text-primary transition-all rounded-xl font-bold"
                        onClick={() => i18n.changeLanguage(i18n.language === 'uz' ? 'ru' : 'uz')}
                    >
                        <Globe className="w-4 h-4" />
                        {i18n.language === 'uz' ? '🇺🇿 O\'zbek' : '🇷🇺 Русский'}
                    </Button>
                    <Button variant="destructive" className="w-full gap-2 rounded-xl font-bold" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" />
                        {t('common.exit')}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        {/* Dynamic Header could go here, or empty for now */}
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        {user?.avatar_url || user?.avatar ? (
                            <img
                                src={getImageUrl(user.avatar_url || user.avatar)}
                                alt={user.first_name || 'Teacher'}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.classList.remove('hidden');
                                }}
                            />
                        ) : null}
                        <div className={`w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold ${(user?.avatar_url || user?.avatar) ? 'hidden' : ''}`}>
                            {user?.first_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'T'}
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TeacherLayout;
