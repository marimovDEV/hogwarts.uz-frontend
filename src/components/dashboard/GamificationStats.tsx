import { API_URL as API_BASE } from "@/services/api";
import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Loader2 } from "lucide-react";

interface UserData {
    id: number;
    username: string;
    xp: number;
    level: number;
    streak?: number;
}


// Level titles based on level number
const LEVEL_TITLES: Record<number, string> = {
    1: "Yangi boshlovchi",
    2: "G'ayratli",
    3: "Izlanuvchi",
    4: "Yutuqli",
    5: "Mohir",
    6: "Mutaxassis",
    7: "Nomzod",
    8: "Master",
    9: "Grandmaster",
    10: "Legenda"
};

const GamificationStats = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [rank, setRank] = useState<string>('');

    useEffect(() => {
        loadUserStats();
    }, []);

    const loadUserStats = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            // Fallback to localStorage
            loadFromLocalStorage();
            return;
        }

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

                    // Calculate approximate rank based on XP
                    calculateRank(data.user.xp || 0);
                    setIsLoading(false);
                    return;
                }
            }
        } catch (err) {
            console.error('Error fetching user stats');
        }

        // Fallback to localStorage
        loadFromLocalStorage();
    };

    const loadFromLocalStorage = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                calculateRank(userData.xp || 0);
            } catch (e) {
                console.error('Error parsing user data');
            }
        }
        setIsLoading(false);
    };

    const calculateRank = (xp: number) => {
        // Approximate percentile based on XP
        if (xp >= 5000) setRank('Top 1%');
        else if (xp >= 3000) setRank('Top 5%');
        else if (xp >= 2000) setRank('Top 10%');
        else if (xp >= 1000) setRank('Top 25%');
        else if (xp >= 500) setRank('Top 50%');
        else setRank('Yangi');
    };

    const getLevelTitle = (level: number) => {
        return LEVEL_TITLES[level] || LEVEL_TITLES[Math.min(level, 10)];
    };

    const getXpForNextLevel = (level: number) => {
        // Each level requires 500 XP more
        return level * 500;
    };

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-[#111827] to-[#0B0F1A] rounded-3xl p-6 text-white shadow-gold relative overflow-hidden border border-white/5">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    const level = user?.level || 1;
    const xp = user?.xp || 0;
    const streak = user?.streak || 0;
    const nextLevelXp = getXpForNextLevel(level);
    const currentLevelXp = getXpForNextLevel(level - 1);
    const xpInCurrentLevel = xp - currentLevelXp;
    const xpNeededForLevel = nextLevelXp - currentLevelXp;
    const progressPercent = Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);

    return (
        <div className="bg-gradient-to-br from-[#111827] to-[#0B0F1A] rounded-3xl p-6 text-white shadow-gold relative overflow-hidden border border-white/5">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-6 -mb-6 pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                    <Trophy className="w-8 h-8 text-yellow-300" />
                </div>
                <div>
                    <div className="text-primary/60 text-sm font-black uppercase tracking-widest mb-1 italic">Mening darajam</div>
                    <h2 className="text-2xl font-black tracking-tight font-cinzel">Level {level} - {getLevelTitle(level)}</h2>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2 flex justify-between text-[10px] font-black text-primary uppercase tracking-widest">
                <span>{xp.toLocaleString()} XP</span>
                <span>Next: {nextLevelXp.toLocaleString()} XP</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden mb-4 border border-white/5">
                <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.5)] relative transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                >
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/10 rounded-xl p-2 flex items-center gap-2 border border-white/5">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="font-bold">{rank}</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2 flex items-center gap-2 border border-white/5">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-bold">{streak > 0 ? `${streak} kun strike` : 'Yangi'}</span>
                </div>
            </div>
        </div>
    );
};

export default GamificationStats;
