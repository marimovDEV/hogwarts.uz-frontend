import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, ChevronRight, Zap, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { useState, useEffect } from "react";
import { homepageService } from "@/services/homepageService";

const PublicOlympiadsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [olympiads, setOlympiads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirect students to their dashboard version
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role === 'STUDENT') {
                    navigate('/olympiads', { replace: true });
                }
            } catch (e) {
                // Ignore
            }
        }
    }, [navigate]);

    useEffect(() => {
        const fetchOlympiads = async () => {
            try {
                const data = await homepageService.getPublicOlympiads();
                const items = data.olympiads || (Array.isArray(data) ? data : data.results || []);
                const mapped = items.map((o: any) => ({
                    id: o.id,
                    title: o.title,
                    subject: o.subject || o.subject_name || o.subject_id_display || o.subject?.name,
                    date: o.start_date,
                    participants: o.participants_count || 0,
                    price: o.price === "0.00" || o.price === 0 ? t('common.free') : parseFloat(o.price).toLocaleString(),
                    gradient: getGradientForSubject(o.subject || o.subject_name || o.subject?.name),
                    iconColor: "text-white"
                }));
                setOlympiads(mapped);
            } catch (err) {
                console.error("Failed to fetch olympiads:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOlympiads();
    }, []);

    const getGradientForSubject = (subject: string) => {
        const s = subject?.toLowerCase() || '';
        if (s.includes('matematika') || s.includes('math')) return "from-blue-500 to-indigo-600";
        if (s.includes('fizika') || s.includes('physics')) return "from-emerald-400 to-teal-500";
        if (s.includes('informatika') || s.includes('it')) return "from-orange-400 to-red-500";
        if (s.includes('ingliz') || s.includes('english')) return "from-purple-500 to-pink-500";
        return "from-primary to-secondary";
    };

    return (
        <div className="relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-blob opacity-50" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-4000 opacity-50" />
            </div>

            <main className="pb-20 container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur border border-border shadow-sm mb-6">
                        <Sparkles className="w-4 h-4 text-warning animate-pulse" />
                        <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            {t('olympiadsSection.calendar_badge')}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        <Trans i18nKey="olympiadsSection.all_olympiads" components={{ 1: <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient-xy" /> }} />
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        {t('olympiadsSection.hero_desc')}
                    </p>
                </div>

                {/* Creative Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {olympiads.map((olympiad, index) => (
                            <div
                                key={olympiad.id}
                                className="group relative bg-card border border-border rounded-3xl p-1 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 dark:bg-white/5 dark:backdrop-blur-xl"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Inner Card */}
                                <div className="bg-background/50 dark:bg-card/40 rounded-[1.3rem] p-6 h-full flex flex-col relative overflow-hidden">
                                    {/* Gradient Blob in Card */}
                                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${olympiad.gradient} opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700`} />

                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${olympiad.gradient} flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300`}>
                                            <Trophy className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="bg-muted backdrop-blur px-3 py-1.5 rounded-xl border border-border shadow-sm">
                                            <span className="font-bold text-primary">{olympiad.price}</span>
                                            <span className="text-[10px] text-muted-foreground ml-1 uppercase">{t('olympiadsSection.currency')}</span>
                                        </div>
                                    </div>

                                    <div className="mb-6 relative z-10">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                            <Zap className="w-3 h-3 text-warning" />
                                            {olympiad.subject}
                                        </span>
                                        <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
                                            {olympiad.title}
                                        </h3>
                                    </div>

                                    <div className="mt-auto space-y-3 relative z-10">
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span>{olympiad.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span>{olympiad.participants} {t('olympiadsSection.participants')}</span>
                                        </div>
                                    </div>

                                    <Link to="/auth" className="mt-6 relative z-10">
                                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/20 rounded-xl h-12 font-medium group/btn">
                                            {t('olympiadsSection.register')}
                                            <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PublicOlympiadsPage;
