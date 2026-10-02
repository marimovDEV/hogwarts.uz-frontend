import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    LayoutGrid,
    BookOpen,
    Trophy,
    Award,
    Zap,
    Menu,
    PlayCircle,
    LogOut,
    Globe,
    FileCheck
} from "lucide-react";
import SupportWidget from '@/components/support/SupportWidget';
import DashboardNavbar from "./DashboardNavbar";
import TelegramBotBanner from "./dashboard/TelegramBotBanner";
import MobileBottomNav from "./dashboard/MobileBottomNav";
import { useTranslation } from "react-i18next";

const DashboardLayout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Strict Role Check for Student Dashboard
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/auth/login');
            return;
        }
        try {
            const user = JSON.parse(userStr);
            if (user.role === 'TEACHER') {
                navigate('/teacher/dashboard');
            } else if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (user.role !== 'STUDENT') {
                // If unknown role, go to login
                navigate('/auth/login');
            }
        } catch (e) {
            navigate('/auth/login');
        }
    }, [navigate]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const isActive = (path: string) => location.pathname === path;

    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'uz' ? 'ru' : 'uz';
        i18n.changeLanguage(newLang);
    };

    const menuItems = [
        { path: '/dashboard', label: t('dashboard.menu.home'), icon: LayoutGrid },
        { path: '/courses', label: t('dashboard.menu.allCourses'), icon: BookOpen },
        { path: '/my-courses', label: t('dashboard.menu.myCourses'), icon: PlayCircle },
        { path: '/olympiads', label: t('dashboard.menu.olympiads'), icon: Trophy },
        { path: '/results', label: t('dashboard.menu.results'), icon: Award },
        { path: '/my-certificates', label: t('dashboard.menu.certificates', { defaultValue: t('certificates') }), icon: FileCheck },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen bg-background flex overflow-hidden selection:bg-primary/30 selection:text-white">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/3 blur-[120px] rounded-full -ml-[250px] -mt-[250px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-primary/2 blur-[120px] rounded-full -mr-[300px] -mb-[300px] pointer-events-none" />

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0B0F1A] backdrop-blur-2xl border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out shadow-2xl lg:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="p-8 pb-4">
                    <Link to="/" className="flex items-center gap-3 mb-8 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-0.5 shadow-gold group-hover:scale-110 transition-all duration-500 hover:rotate-6">
                            <div className="w-full h-full bg-[#0B0F1A] rounded-[14px] flex items-center justify-center overflow-hidden">
                                <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-contain" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black font-cinzel text-white tracking-tighter group-hover:text-primary transition-colors leading-none">HOGWORDS</span>
                            <span className="text-[10px] font-bold text-[#FACC15] uppercase tracking-[0.2em] mt-1">Academy</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto scrollbar-hide">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold group relative overflow-hidden ${isActive(item.path)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-white/5 hover:text-primary"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive(item.path) ? "text-primary scale-110" : "text-muted-foreground group-hover:text-primary group-hover:scale-110"}`} />
                            <span className="relative z-10 text-sm tracking-wide">{item.label}</span>

                            {isActive(item.path) && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-gold shadow-[2px_0_15px_rgba(250,204,21,0.5)]" />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center gap-2 rounded-xl bg-white/5 border-white/5 hover:bg-white/10 text-white font-bold h-10"
                        onClick={toggleLanguage}
                    >
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-xs uppercase">{i18n.language === 'uz' ? 'UZ' : 'RU'}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive/80 hover:text-destructive hover:bg-destructive/10 gap-3 px-5 rounded-2xl h-12 font-bold transition-all"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        {t('dashboard.menu.logout')}
                    </Button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-[100dvh] relative">
                {/* Fixed Premium Navbar */}
                <DashboardNavbar onMobileMenuClick={() => setIsMobileMenuOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto w-full relative pb-24 lg:pb-0 scroll-smooth">
                    {/* Top Alert Banner if needed */}
                    <TelegramBotBanner />

                    <div className="relative z-10">
                        <Outlet />
                    </div>

                    {/* Floating Support Widget */}
                    <SupportWidget />
                </main>

                {/* Mobile Bottom Navigation */}
                <MobileBottomNav />
            </div>
        </div>
    );
};

export default DashboardLayout;
