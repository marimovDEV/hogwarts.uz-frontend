import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    Book,
    BookOpen,
    Trophy,
    Wallet,
    HeadphonesIcon,
    Award,
    Settings,
    LogOut,
    Bot,
    Bell,
    PanelTop,
    Briefcase,
    DollarSign,
    Globe,
    GraduationCap,

    MessageSquare,
    Smartphone,
    Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationBell from './NotificationBell';
import { useTranslation } from "react-i18next";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role !== 'ADMIN') {
                    // toast.error("Sizda Admin huquqi yo'q"); // Optional: Don't show toast if just redirecting? User asked for strict security.
                    navigate('/admin/login'); // Redirect to Admin Login directly as requested "srazu admin login page"
                }
            } catch (e) {
                navigate('/admin/login');
            }
        } else {
            navigate('/admin/login');
        }
    }, [navigate]);

    // Prevent rendering children if checking (simple check)
    const { t, i18n } = useTranslation();
    const userStr = localStorage.getItem('user');
    let isAdmin = false;
    try {
        if (userStr) {
            const user = JSON.parse(userStr);
            isAdmin = user.role === 'ADMIN';
        }
    } catch (_error) {
        isAdmin = false;
    }

    if (!isAdmin) {
        return null; // Or a loader
    }

    const handleLogout = () => {
        // logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    const sidebarItems = [
        { icon: LayoutDashboard, label: t('admin.dashboard.title'), path: "/admin/dashboard" },
        { icon: Users, label: t('admin.users.title'), path: "/admin/users" },
        { icon: GraduationCap, label: t('admin.teachers.title'), path: "/admin/teachers" },
        { icon: BookOpen, label: t('admin.courses.title'), path: "/admin/courses" },
        { icon: Trophy, label: t('admin.olympiads.title'), path: "/admin/olympiads" },
        { icon: Truck, label: t('admin.delivery', { defaultValue: "Yetkazib berish" }), path: "/admin/delivery" },
        { icon: DollarSign, label: t('admin.finance'), path: "/admin/finance" },
        { icon: PanelTop, label: t('admin.cms'), path: "/admin/cms" },
        { icon: Briefcase, label: t('admin.professions'), path: "/admin/professions" },
        { icon: Book, label: t('admin.subjects'), path: "/admin/subjects" },
        { icon: Award, label: t('admin.certificates.title'), path: "/admin/certificates" },
        { icon: HeadphonesIcon, label: t('admin.supportSection.title'), path: "/admin/support" },
        { icon: Bell, label: t('admin.notifications.title'), path: "/admin/notifications" },
        { icon: MessageSquare, label: t('admin.ai.title'), path: "/admin/ai-assistant" },
        { icon: Bot, label: t('admin.botSettings', { defaultValue: "Bot Settings" }), path: "/admin/bot" },
        { icon: Smartphone, label: t('admin.botPayments'), path: "/admin/bot-payments" },
        { icon: Settings, label: t('admin.settings'), path: "/admin/settings" },
    ];

    return (
        <div className="min-h-screen bg-background flex text-foreground">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border fixed inset-y-0 left-0 z-50 flex flex-col shadow-2xl">
                <div className="p-6 border-b border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-gold">
                        <img src="/logo.jpg" alt="Logo" className="w-7 h-7 object-contain" />
                    </div>
                    <span className="font-black font-cinzel text-xl text-primary tracking-tighter">Hogwords Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 mb-1 rounded-xl transition-all duration-300 ${isActive
                                        ? "bg-primary/10 font-bold text-primary shadow-[inset_0_0_10px_rgba(255,215,0,0.1)] border border-primary/20"
                                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"}`}
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
                        {t('admin.logout')}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen bg-background">
                <header className="h-20 px-8 flex justify-end items-center sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
                    <div className="flex items-center gap-6">
                        <NotificationBell />
                        <div className="flex items-center gap-3 pl-4 border-l border-border">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-foreground leading-none">Admin</p>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Superuser</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black shadow-gold">
                                A
                            </div>
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

export default AdminLayout;
