import { API_URL as API_BASE, getImageUrl } from "@/services/api";
import { useState, useEffect } from 'react';
import { User, MapPin, School, GraduationCap, Calendar, Phone, Trophy, Star, Zap, Edit3, Smartphone, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import LevelProgressModal from './LevelProgressModal';

interface UserData {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    avatar: string | null;
    role: string;
    xp: number;
    level: number;
    birth_date?: string;
    region?: string;
    school?: string;
    grade?: string;
    telegram_id?: number | null;
    telegram_connected_at?: string | null;
    level_progress?: {
        current: number;
        next: number;
        xp_current: number;
        xp_next: number;
        xp_left: number;
        progress_percent: number;
    };
}


import { useTranslation } from 'react-i18next';
// ...

const StudentProfileCard = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState<UserData | null>(null);
    const [greeting, setGreeting] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLinking, setIsLinking] = useState(false);
    const [botUrl, setBotUrl] = useState<string | null>(null);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

    useEffect(() => {
        loadUserData();

        const hour = new Date().getHours();
        if (hour < 12) setGreeting(t('dashboard.profile.goodMorning'));
        else if (hour < 18) setGreeting(t('dashboard.profile.goodDay'));
        else setGreeting(t('dashboard.profile.goodEvening'));
    }, [t]);

    // ... handleConnectTelegram ...

    const loadUserData = async () => {
        // ... implementation (same as before)
        const token = localStorage.getItem('token');

        // Try to fetch from API first
        if (token) {
            try {
                const res = await fetch(`${API_BASE}/auth/me/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.user) {
                        setUser(data.user);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error('Error fetching user from API');
            }
        }

        // Fallback to localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Error parsing user data');
            }
        }
        setIsLoading(false);
    };

    if (!user) {
        return (
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border animate-pulse">
                <div className="h-20 bg-muted rounded-xl"></div>
            </div>
        );
    }

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
    const initials = (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase();

    // --- XP & Level Calculations (API-driven) ---
    const progress = user.level_progress || {
        current: user.level || 1,
        next: (user.level || 1) + 1,
        xp_current: user.xp % 500,
        xp_left: 500 - (user.xp % 500),
        progress_percent: Math.min(100, Math.max(0, ((user.xp % 500) / 5)))
    };

    // ... formatDate ...
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get grade label
    const getGradeLabel = (grade?: string) => {
        if (!grade) return null;
        if (grade === 'STUDENT') return t('dashboard.profile.grades.student');
        if (grade === 'GRADUATE') return t('dashboard.profile.grades.graduate');

        // Check if grade is a number 5-11
        if (['5', '6', '7', '8', '9', '10', '11'].includes(grade)) {
            return `${grade}${t('dashboard.profile.grades.class')}`;
        }
        return grade;
    };

    return (
        <div className="relative group perspective-1000">
            {/* Main Card Container */}
            <div className="relative overflow-hidden rounded-[32px] p-1 transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(250,204,21,0.2)]">
                {/* Animated Border Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-orange-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-xl"></div>

                {/* Inner Glass Card */}
                <div className="relative bg-card bg-opacity-90 backdrop-blur-2xl border border-border rounded-[28px] p-6 md:p-8 overflow-hidden">

                    {/* Background Blobs */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] -ml-24 -mb-24 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col gap-6 items-center">

                        {/* TOP: Avatar & Main Identity */}
                        <div className="flex flex-col items-center gap-4 text-center w-full">
                            <div className="relative">
                                {/* Rotating Ring */}
                                <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-[spin_10s_linear_infinite]" />
                                <div className="absolute -inset-2 rounded-full border border-primary/5 animate-ping opacity-20" />

                                {user.avatar ? (
                                    <img
                                        src={getImageUrl(user.avatar)}
                                        alt={fullName}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-card shadow-2xl relative z-10"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-3xl font-black text-background border-4 border-card shadow-2xl relative z-10">
                                        {initials}
                                    </div>
                                )}

                                {/* Level Badge */}
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-20 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-white" />
                                    LVL {user.level || 1}
                                </div>
                            </div>

                            <div
                                className="cursor-pointer group/xp transition-all hover:scale-105 active:scale-95"
                                onClick={() => setIsProgressModalOpen(true)}
                            >
                                <h2 className="text-xl font-black text-foreground tracking-tight">{fullName}</h2>
                                <p className="text-primary font-medium text-xs flex items-center justify-center gap-1 mt-1 group-hover/xp:text-primary transition-colors italic">
                                    <Trophy className="w-3 h-3" />
                                    {user.xp || 0} XP
                                </p>
                            </div>

                            <Link
                                to="/profile"
                                className="w-full py-2 px-4 rounded-xl bg-muted/50 hover:bg-muted border border-border text-xs font-bold text-muted-foreground transition-all text-center"
                            >
                                {t('dashboard.profile.editProfile')}
                            </Link>
                        </div>

                        {/* BOTTOM: Stats & Progress */}
                        <div className="w-full space-y-4">
                            {/* Greeting */}
                            <div className="flex flex-col items-center text-center gap-2">
                                <div>
                                    <p className="text-muted-foreground text-xs font-bold uppercase mb-1">{greeting} 👋</p>
                                    <h3 className="text-sm font-bold text-foreground">{t('dashboard.profile.whatToLearn')}</h3>
                                </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: t('dashboard.profile.region'), val: user.region, icon: MapPin, color: 'text-primary', bg: 'bg-primary/10' },
                                    { label: t('dashboard.profile.school'), val: user.school, icon: School, color: 'text-primary', bg: 'bg-primary/10' },
                                    { label: t('dashboard.profile.grade'), val: getGradeLabel(user.grade), icon: GraduationCap, color: 'text-primary', bg: 'bg-primary/10' },
                                    { label: t('dashboard.profile.phone'), val: user.phone, icon: Phone, color: 'text-primary', bg: 'bg-primary/10' },
                                ].map((item, i) => (
                                    <div key={i} className="bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50 rounded-xl p-2 flex flex-col justify-between h-20">
                                        <div className={`w-6 h-6 rounded-lg ${item.bg} flex items-center justify-center mb-1`}>
                                            <item.icon className={`w-3 h-3 ${item.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-muted-foreground uppercase font-bold">{item.label}</p>
                                            <p className="text-[10px] font-bold text-foreground truncate" title={item.val || '-'}>{item.val || '-'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <LevelProgressModal
                isOpen={isProgressModalOpen}
                onClose={() => setIsProgressModalOpen(false)}
                user={user}
            />
        </div>
    );
};

export default StudentProfileCard;
