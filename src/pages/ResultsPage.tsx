import { API_URL as API_BASE } from "@/services/api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
    Trophy,
    Award,
    Calendar,
    CheckCircle2,
    XCircle,
    ArrowRight,
    TrendingUp,
    Download,
    RotateCcw,
    Zap,
    BarChart3,
    Filter
} from "lucide-react";

// Enhanced Mock Data helper

const ResultsPage = () => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('all');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const categories = [
        { id: 'all', label: t('resultsPage.tabs.all') },
        { id: 'olympiad', label: t('resultsPage.tabs.olympiads') },
        { id: 'course', label: t('resultsPage.tabs.courses') },
        // { id: 'practice', label: t('resultsPage.tabs.practice') }
    ];

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/test-results/`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : data.results || [];
                // Map backend structure to UI structure
                const mapped = list.map((item: any) => ({
                    id: item.id,
                    title: item.olympiad?.title || item.lesson?.title || 'Test',
                    date: item.completed_at,
                    score: parseFloat(item.percentage) || 0, // Ensure number
                    maxScore: 100,
                    correct: Number(item.score) || 0, // Ensure number
                    incorrect: 0,
                    timeSpent: item.time_taken ? (item.time_taken < 60 ? '< 1 daqiqa' : `${Math.floor(item.time_taken / 60)} daqiqa`) : '-',
                    status: (parseFloat(item.percentage) || 0) >= 80 ? 'Ajoyib' : (parseFloat(item.percentage) || 0) >= 60 ? 'Yaxshi' : (parseFloat(item.percentage) || 0) >= 40 ? 'Qoniqarli' : 'Qoniqarsiz',
                    category: item.olympiad ? 'olympiad' : 'course',
                    object_id: item.olympiad?.id,
                    improvement: 0,
                    ratingImpact: Math.floor((Number(item.score) || 0) * 2),
                    topicsStrong: [],
                    topicsWeak: [],
                    certificate: null
                }));
                setResults(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch results", error);
        } finally {
            setLoading(false);
        }
    };

    // ... (filteredResults, stats logic same)
    const filteredResults = activeTab === 'all'
        ? results
        : results.filter(r => r.category === activeTab);

    // Stats
    const totalTests = results.length;
    const avgScore = totalTests > 0 ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / totalTests) : 0;
    const bestResult = totalTests > 0 ? Math.max(...results.map(r => r.score)) : 0;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat(i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(date);
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-5xl mx-auto min-h-screen">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t('resultsPage.title')}</h1>
                    <p className="text-muted-foreground">{t('resultsPage.emptyDesc')}</p>
                </div>

                {/* Categories Tab */}
                <div className="bg-muted p-1 rounded-xl flex gap-1 overflow-x-auto max-w-full">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === cat.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
            ) : results.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border border-dashed">
                    <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-muted-foreground">{t('resultsPage.empty')}</h3>
                </div>
            ) : (
                <>
                    {/* Top Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-primary rounded-2xl p-6 text-background shadow-lg shadow-gold/20">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-background/70 font-bold text-xs uppercase">{t('resultsPage.avgScore')}</span>
                                <BarChart3 className="w-5 h-5 text-background/70" />
                            </div>
                            <span className="text-3xl font-black">{avgScore}%</span>
                        </div>
                        <div className="bg-emerald-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-900/20">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-emerald-100 font-bold text-xs uppercase">{t('resultsPage.bestResult')}</span>
                                <Trophy className="w-5 h-5 text-emerald-100" />
                            </div>
                            <span className="text-3xl font-black">{bestResult}%</span>
                        </div>
                        <div className="bg-primary/20 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 text-foreground shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-muted-foreground font-bold text-xs uppercase">{t('resultsPage.attempts')}</span>
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-3xl font-black">{totalTests}</span>
                        </div>
                    </div>

                    {/* Results Feed */}
                    <div className="space-y-6">
                        {filteredResults.map((item) => (
                            <div key={item.id} className="bg-card rounded-[1.5rem] p-6 shadow-sm border border-border hover:shadow-md transition-all flex flex-col gap-6">

                                {/* Header Row */}
                                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${item.score >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : item.score >= 60 ? 'bg-primary/20 text-primary' : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>
                                            {Math.round(item.score)}%
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                                                {item.category === 'olympiad' && <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1"><Trophy className="w-3 h-3" /> {t('resultsPage.tabs.olympiads')}</span>}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-3">
                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(item.date)}</span>
                                                <span className="w-1 h-1 rounded-full bg-border"></span>
                                                <span>{item.timeSpent}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-muted p-2 rounded-xl border border-border">
                                        <div className="flex flex-col items-center px-2">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">{t('resultsPage.correct')}</span>
                                            <span className="text-green-600 dark:text-green-400 font-bold">{Math.round(item.correct)}</span>
                                        </div>
                                        <div className="w-px h-6 bg-border"></div>
                                        <div className="flex flex-col items-center px-2">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">{t('resultsPage.ratingImpact')}</span>
                                            <span className={`font-bold flex items-center gap-0.5 text-primary`}>
                                                +{item.ratingImpact}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Analysis & Actions Row */}
                                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border">

                                    {/* Analysis Summary */}
                                    <div className="space-y-3">
                                        {item.status && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    {t('resultsPage.ratingImpact')}: <span className="text-foreground">{item.status}</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 justify-end items-end">
                                        {/* Link to leaderboard or detailed view if available */}
                                        {item.category === 'olympiad' && (
                                            <Link to={`/olympiad/${item.object_id}/results`}>
                                                <Button variant="secondary" className="w-full sm:w-auto">
                                                    <ArrowRight className="w-4 h-4 mr-2" /> {t('common.view')}
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ResultsPage;
