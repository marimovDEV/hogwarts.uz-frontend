import { API_URL as API_BASE, getImageUrl } from "@/services/api";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Bell,
    Search,
    Menu,
    ChevronDown,
    LogOut,
    User as UserIcon,
    Settings,
    Trophy,
    Zap,
    Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ArdCoin from './ArdCoin';
import NotificationBell from './NotificationBell';
import PaymentModal from './payment/PaymentModal';
import LevelProgressModal from './dashboard/LevelProgressModal';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
    onMobileMenuClick?: () => void;
}

const DashboardNavbar = ({ onMobileMenuClick }: NavbarProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>({});
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

    const level = user.level || 1;
    const xp = user.xp || 0;
    const currentLevelProgress = user.level_progress?.xp_current || 0;
    const xpLeft = user.level_progress?.xp_left || 500;
    const progressPercent = user.level_progress?.progress_percent || 0;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const getRoleLabel = (role: string) => {
        if (role === 'ADMIN') return t('dashboard.navbar.roles.admin');
        if (role === 'TEACHER') return t('dashboard.navbar.roles.teacher');
        return t('dashboard.navbar.roles.student');
    };

    return (
        <header
            className={`sticky top-0 z-30 w-full transition-all duration-500 ${scrolled
                ? 'bg-white/90 dark:bg-[#111827]/90 backdrop-blur-2xl shadow-sm border-b border-border/50'
                : 'bg-transparent'
                }`}
        >
            <div className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between gap-4">

                {/* Mobile Menu Toggle (Left on mobile - only show if there is no bottom nav or logo needed instead. Keeping logo for mobile) */}
                <div className="flex lg:hidden items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-sm cursor-pointer" onClick={() => navigate('/dashboard')}>
                        H
                    </div>
                </div>

                {/* Left Side (Desktop: Search, Logo) */}
                <div className="hidden lg:flex items-center gap-6 flex-1">
                    <div className="relative w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                        <input
                            type="text"
                            placeholder={t('dashboard.navbar.search')}
                            className="w-full h-11 pl-11 pr-5 rounded-2xl bg-muted/50 border border-border focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
                        />
                    </div>
                </div>

                {/* Right Side: Stats & Profile */}
                <div className="flex items-center gap-2 md:gap-6">

                    {/* Level & XP Widget (Students Only) - Desktop full, Mobile pill */}
                    {user.role !== 'TEACHER' && (
                        <div
                            className="flex items-center gap-2 md:gap-3 bg-white dark:bg-[#0B0F1A]/80 backdrop-blur-md p-1 pr-3 md:p-1.5 md:pr-5 rounded-full border border-border/50 hover:border-primary/30 transition-all cursor-pointer group relative active:scale-95 shadow-sm md:shadow-lg"
                            onClick={() => setIsProgressModalOpen(true)}
                        >
                            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white md:text-[#0B0F1A] font-black text-xs md:text-sm shadow-sm md:shadow-gold group-hover:scale-110 transition-transform duration-500">
                                {level}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1 md:gap-2">
                                    <span className="text-[10px] md:text-[11px] font-black text-orange-500 md:text-[#FACC15] tracking-widest leading-none">{xp} XP</span>
                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/20 hidden md:block" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Coin Balance (Mobile & Desktop) */}
                    <div
                        className="flex items-center justify-center bg-primary/5 hover:bg-primary/10 px-2.5 py-1 md:px-4 md:py-2 rounded-full md:rounded-2xl border border-primary/10 cursor-pointer transition-all group shadow-sm"
                        onClick={() => setPaymentOpen(true)}
                    >
                        <ArdCoin amount={parseFloat(user.balance || 0)} className="scale-90 md:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                    </div>

                    {/* Desktop Only Actions */}
                    <div className="hidden lg:flex items-center gap-4">
                        {user.role === 'TEACHER' && (
                            user.teacher_profile?.is_premium ? (
                                <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-xl text-xs font-black tracking-widest shadow-sm">
                                    <Crown className="w-4 h-4" />
                                    {t('dashboard.navbar.premium')}
                                </div>
                            ) : (
                                <Link to="/teacher/courses/create">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-muted/50 text-foreground border-border hover:bg-muted rounded-xl font-bold border-2"
                                    >
                                        <Crown className="w-4 h-4 mr-2 text-primary" />
                                        {t('dashboard.navbar.upgrade')}
                                    </Button>
                                </Link>
                            )
                        )}

                        <div className="relative group">
                            <NotificationBell />
                        </div>
                    </div>

                    <PaymentModal
                        isOpen={paymentOpen}
                        onOpenChange={setPaymentOpen}
                        onSuccess={() => {
                            window.location.reload();
                        }}
                    />

                    {/* User Profile - Clickable Avatar on Desktop, Simple Avatar on Mobile (navs handled elsewhere or via click on mobile profile page) */}
                    <div className="hidden lg:block">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 p-1 rounded-full hover:bg-muted/50 transition-all outline-none group border border-transparent hover:border-border/50">
                                    <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-500">
                                        <div className="w-full h-full rounded-full bg-card border-2 border-background overflow-hidden relative shadow-sm">
                                            {user.avatar_url || user.avatar ? (
                                                <img src={getImageUrl(user.avatar_url || user.avatar)} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 font-black text-lg">
                                                    {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-left hidden lg:block pr-2">
                                        <p className="text-sm font-black text-foreground leading-none group-hover:text-primary transition-colors">
                                            {user.first_name || user.username}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">
                                            {getRoleLabel(user.role)}
                                        </p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-2xl border-border rounded-2xl shadow-xl p-2">
                                <DropdownMenuLabel className="mb-2">
                                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{t('dashboard.navbar.myAccount')}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => navigate('/profile')}
                                    className="rounded-xl h-12 gap-3 focus:bg-primary/10 focus:text-primary cursor-pointer transition-all"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    <span className="font-bold">{t('dashboard.navbar.profile')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => navigate('/settings')}
                                    className="rounded-xl h-12 gap-3 focus:bg-muted cursor-pointer transition-all"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="font-bold">{t('dashboard.navbar.settings', 'Sozlamalar')}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border my-2" />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="rounded-xl h-12 gap-3 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="font-bold">{t('dashboard.navbar.logout')}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile Basic Avatar (just links to profile, no dropdown menu to limit clutter) */}
                    <Link to="/profile" className="block lg:hidden ml-1 active:scale-95 transition-transform">
                        <div className="w-8 h-8 rounded-full border-2 border-background shadow-sm overflow-hidden bg-muted">
                            {user.avatar_url || user.avatar ? (
                                <img src={getImageUrl(user.avatar_url || user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 font-bold text-sm">
                                    {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                                </div>
                            )}
                        </div>
                    </Link>

                </div>
            </div>

            <LevelProgressModal
                isOpen={isProgressModalOpen}
                onClose={() => setIsProgressModalOpen(false)}
                user={user}
            />
        </header>
    );
};

export default DashboardNavbar;
