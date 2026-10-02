import { API_URL as API_BASE } from "@/services/api";
import { useState, useEffect } from "react";
import { Flame, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


const StreakStats = () => {
    const [streakData, setStreakData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStreak();
    }, []);

    const loadStreak = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${API_BASE}/streak/status/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setStreakData(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const buyFreeze = async () => {
        if (!confirm("500 ArdCoin evaziga Streak Freeze sotib olasizmi?")) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE}/streak/buy-freeze/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Muzlatish sotib olindi!");
                loadStreak();
                // Update user balance globally if needed (via event or context)
            } else {
                toast.error(data.error || "Xatolik");
            }
        } catch (err) {
            toast.error("Xatolik");
        }
    };

    if (loading || !streakData) return null;

    const { current_streak, is_active_today, freeze_count } = streakData;

    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border relative overflow-hidden group hover:shadow-md transition-all">
            {/* Background Gradient */}
            <div className={cn(
                "absolute inset-0 opacity-10 transition-opacity",
                is_active_today
                    ? "bg-gradient-to-br from-orange-500 to-red-600"
                    : "bg-gradient-to-br from-gray-200 to-gray-400"
            )} />

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Fire Animation Container */}
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center relative",
                        is_active_today ? "bg-orange-100 dark:bg-orange-900/20" : "bg-muted"
                    )}>
                        <Flame className={cn(
                            "w-10 h-10 transition-all duration-700",
                            is_active_today
                                ? "text-orange-500 fill-orange-500 animate-pulse drop-shadow-lg filter"
                                : "text-muted-foreground"
                        )} />

                        {/* CSS Fire Effect if active */}
                        {is_active_today && (
                            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-orange-500"></div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-baseline gap-1">
                            <h3 className={cn(
                                "text-4xl font-black",
                                is_active_today ? "text-orange-500" : "text-muted-foreground"
                            )}>
                                {current_streak}
                            </h3>
                            <span className="text-muted-foreground font-medium uppercase text-xs tracking-wider">kun</span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Streak rejimi</p>
                    </div>
                </div>

                {/* Freeze Status */}
                <div className="flex flex-col items-end gap-2">
                    <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={buyFreeze}
                        title="Muzlatish (Kun o'tkazib yuborilganda asqatadi)"
                    >
                        <Snowflake className="w-4 h-4" />
                        <span className="font-bold text-sm">{freeze_count}</span>
                        <span className="text-[10px] uppercase font-bold opacity-70">Freeze</span>
                    </div>
                    {!is_active_today && (
                        <div className="text-xs text-orange-600 font-bold animate-bounce">
                            🔥 Bugun dars qiling!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StreakStats;
