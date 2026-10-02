import { API_URL as API_BASE } from "@/services/api";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight, Loader2, Target, BookOpen, FileQuestion, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Goal {
    id: number;
    title: string;
    subtitle: string;
    completed: boolean;
    type: 'lesson' | 'test' | 'olympiad' | 'other';
    link?: string;
}

interface Enrollment {
    id: number;
    course: {
        id: number;
        title: string;
    };
    progress: number;
    created_at: string;
}

interface Olympiad {
    id: number;
    title: string;
    subject: string;
}


const DailyGoals = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [completedCount, setCompletedCount] = useState(0);

    useEffect(() => {
        loadDailyGoals();
    }, []);

    const loadDailyGoals = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsLoading(false);
            return;
        }

        const dailyGoals: Goal[] = [];

        try {
            // Fetch enrolled courses for lesson goals
            const coursesRes = await fetch(`${API_BASE}/courses/my_courses/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (coursesRes.ok) {
                const coursesData = await coursesRes.json();
                let courses: Enrollment[] = [];

                if (Array.isArray(coursesData)) {
                    courses = coursesData;
                } else if (coursesData && Array.isArray(coursesData.results)) {
                    courses = coursesData.results;
                }

                // Add incomplete courses as goals
                courses.slice(0, 2).forEach((enrollment, index) => {
                    if (enrollment.progress < 100) {
                        dailyGoals.push({
                            id: 100 + index,
                            title: `${enrollment.course.title}: Davom etish`,
                            subtitle: `${enrollment.progress}% tugallangan`,
                            completed: false,
                            type: 'lesson',
                            link: `/course/${enrollment.course.id}`
                        });
                    }
                });
            }

            // Fetch available olympiads for registration goals
            const olympiadsRes = await fetch(`${API_BASE}/olympiads/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (olympiadsRes.ok) {
                const olympiadsData = await olympiadsRes.json();
                let olympiads: Olympiad[] = [];

                if (Array.isArray(olympiadsData)) {
                    olympiads = olympiadsData;
                } else if (olympiadsData && Array.isArray(olympiadsData.results)) {
                    olympiads = olympiadsData.results;
                }

                // Add upcoming olympiad as goal
                if (olympiads.length > 0) {
                    const nextOlympiad = olympiads[0];
                    dailyGoals.push({
                        id: 200,
                        title: "Olimpiadaga tayyorlanish",
                        subtitle: nextOlympiad.title || 'Yangi olimpiada',
                        completed: false,
                        type: 'olympiad',
                        link: `/olympiad/${nextOlympiad.id}`
                    });
                }
            }

            // Fetch test results to check for completed tests today
            const resultsRes = await fetch(`${API_BASE}/olympiads/my_results/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resultsRes.ok) {
                const resultsData = await resultsRes.json();
                let results = [];

                if (Array.isArray(resultsData)) {
                    results = resultsData;
                } else if (resultsData && Array.isArray(resultsData.results)) {
                    results = resultsData.results;
                }

                // Check for test completed today
                const today = new Date().toDateString();
                const completedToday = results.filter((r: any) =>
                    new Date(r.submitted_at).toDateString() === today
                );

                if (completedToday.length > 0) {
                    dailyGoals.unshift({
                        id: 300,
                        title: "Bugungi testni topshirish",
                        subtitle: completedToday[0].olympiad_title || "Test",
                        completed: true,
                        type: 'test',
                        link: '/results'
                    });
                } else {
                    // Add test goal
                    dailyGoals.push({
                        id: 301,
                        title: "Mashq testini yechish",
                        subtitle: "Kunlik mashq",
                        completed: false,
                        type: 'test',
                        link: '/olympiads'
                    });
                }
            }

        } catch (err) {
            console.error('Error fetching daily goals:', err);
        }

        // If no goals generated, add default ones
        if (dailyGoals.length === 0) {
            dailyGoals.push({
                id: 1,
                title: "Birinchi kursga yoziling",
                subtitle: "Kurslarni ko'ring va tanlang",
                completed: false,
                type: 'lesson',
                link: '/courses'
            });
            dailyGoals.push({
                id: 2,
                title: "Olimpiadada qatnashing",
                subtitle: "Bilimingizni sinab ko'ring",
                completed: false,
                type: 'olympiad',
                link: '/olympiads'
            });
        }

        setGoals(dailyGoals.slice(0, 3)); // Max 3 goals
        setCompletedCount(dailyGoals.filter(g => g.completed).length);
        setIsLoading(false);
    };

    const getGoalIcon = (type: string) => {
        switch (type) {
            case 'lesson': return <BookOpen className="w-4 h-4" />;
            case 'test': return <FileQuestion className="w-4 h-4" />;
            case 'olympiad': return <Trophy className="w-4 h-4" />;
            default: return <Target className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-[#111827] rounded-[2.5rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group h-full">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-50 group-hover:bg-primary/10 transition-colors" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 font-cinzel tracking-tight">
                            <Target className="w-8 h-8 text-primary" />
                            BUGUNGI MAQSADINGIZ
                        </h2>
                        <p className="text-[10px] text-secondary font-black uppercase tracking-[0.3em] opacity-60">Muvaffaqiyat - bu odat</p>
                    </div>
                    <div className="text-[11px] font-black text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full uppercase tracking-widest leading-none">
                        {completedCount}/{goals.length} Bajarildi
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    {goals.map((goal, index) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`group/item flex items-center p-5 rounded-[1.5rem] border transition-all duration-300 ${goal.completed
                                ? 'bg-primary/5 border-primary/20 opacity-60'
                                : 'bg-white/5 border-white/5 hover:border-primary/30 hover:bg-white/[0.08]'
                                }`}
                        >
                            <button className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-5 transition-all duration-500 ${goal.completed
                                ? 'border-primary bg-primary text-background shadow-gold scale-110'
                                : 'border-white/20 group-hover/item:border-primary'
                                }`}>
                                {goal.completed ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-transparent group-hover/item:bg-primary transition-colors" />}
                            </button>

                            <div className="w-12 h-12 rounded-xl bg-[#0B0F1A] border border-white/10 flex items-center justify-center mr-4 text-primary group-hover/item:scale-110 transition-transform">
                                {getGoalIcon(goal.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className={`font-black text-sm uppercase tracking-tight ${goal.completed ? 'text-secondary line-through' : 'text-white'
                                    }`}>
                                    {goal.title}
                                </h3>
                                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60 truncate">{goal.subtitle}</p>
                            </div>

                            {!goal.completed && goal.link && (
                                <Link to={goal.link} className="ml-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-primary group-hover/item:text-background transition-all opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 pt-8 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-60">Kunlik Progress</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{Math.round((completedCount / goals.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedCount / goals.length) * 100}%` }}
                            className="h-full bg-primary rounded-full shadow-gold overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyGoals;
