import { API_URL as API_BASE } from "@/services/api";
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Trophy, Loader2, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

interface TestResult {
    id: number;
    olympiad_title?: string;
    olympiad?: { title: string };
    score: number;
    percentage: number;
    time_taken: number;
    submitted_at: string;
}

interface SubjectStat {
    subject: string;
    score: string;
    trend: number;
    status: string;
    count: number;
}


const AnalyticsResults = () => {
    const { t } = useTranslation();
    const [results, setResults] = useState<TestResult[]>([]);
    const [stats, setStats] = useState<SubjectStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // Fetch user's test results
            const res = await fetch(`${API_BASE}/olympiads/my_results/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                const resultList = data.results || data || [];
                setResults(resultList);

                // Calculate subject statistics from results
                calculateStats(resultList);
            }
        } catch (err) {
            console.error('Error fetching results:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (resultList: TestResult[]) => {
        // Group results by subject (extracted from olympiad title)
        const subjectMap: Record<string, { total: number; count: number; scores: number[] }> = {};

        resultList.forEach(result => {
            // Try to extract subject from title
            const title = String(result.olympiad_title || '').toLowerCase();
            let subject = 'general';

            if (title.includes('matematika')) subject = 'matematika';
            else if (title.includes('fizika')) subject = 'fizika';
            else if (title.includes('kimyo')) subject = 'kimyo';
            else if (title.includes('biologiya')) subject = 'biologiya';
            else if (title.includes('informatika')) subject = 'informatika';
            else if (title.includes('ingliz')) subject = 'ingliz';
            else if (title.includes('ona tili')) subject = 'onatili';
            else if (title.includes('mantiq')) subject = 'mantiq';

            if (!subjectMap[subject]) {
                subjectMap[subject] = { total: 0, count: 0, scores: [] };
            }
            subjectMap[subject].total += result.percentage;
            subjectMap[subject].count++;
            subjectMap[subject].scores.push(result.percentage);
        });

        // Convert to stats array
        const statsArray: SubjectStat[] = Object.entries(subjectMap).map(([subject, data]) => {
            const avgScore = data.count > 0 ? data.total / data.count : 0;
            const recentScores = data.scores.slice(-2);
            const trend = recentScores.length > 1 ? recentScores[1] - recentScores[0] : 0;

            let status = 'normal';
            if (avgScore >= 80) status = 'kuchli';
            else if (avgScore < 50) status = 'zaif';

            return {
                subject: `${t(`subjects.${subject.toLowerCase().replace(/\s/g, '')}`) !== `subjects.${subject.toLowerCase().replace(/\s/g, '')}` ? t(`subjects.${subject.toLowerCase().replace(/\s/g, '')}`) : subject}`,
                score: `${isNaN(avgScore) ? 0 : Math.round(avgScore)}%`,
                trend: isNaN(trend) ? 0 : Math.round(trend),
                status,
                count: data.count
            };
        });

        // Sort by score descending
        statsArray.sort((a, b) => {
            const scoreA = parseInt(a.score) || 0;
            const scoreB = parseInt(b.score) || 0;
            return scoreB - scoreA;
        });
        setStats(statsArray.slice(0, 3)); // Show top 3
    };

    if (isLoading) {
        return (
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                <h2 className="text-xl font-black text-foreground mb-6 font-cinzel">📈 {t('dashboard.analytics.title')}</h2>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (stats.length === 0) {
        return (
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-foreground font-cinzel">📈 {t('dashboard.analytics.title')}</h2>
                    <Link to="/results" className="text-sm font-semibold text-primary hover:text-primary/80">{t('dashboard.analytics.all')}</Link>
                </div>
                <div className="flex flex-col items-center justify-center text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-2">{t('dashboard.analytics.empty')}</p>
                    <Link to="/olympiads" className="text-primary hover:underline text-sm font-bold">
                        {t('dashboard.analytics.joinOlympiads')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-foreground font-cinzel">📈 {t('dashboard.analytics.title')}</h2>
                <Link to="/results" className="text-sm font-semibold text-primary hover:text-primary/80">{t('dashboard.analytics.all')}</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                    <div key={stat.subject} className="bg-muted/50 rounded-2xl p-4 relative group hover:bg-card hover:shadow-md transition-all border border-transparent hover:border-border">
                        {stat.status === 'kuchli' && (
                            <span className="absolute -top-2 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> {t('dashboard.analytics.status.strong')}
                            </span>
                        )}
                        {stat.status === 'zaif' && (
                            <span className="absolute -top-2 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {t('dashboard.analytics.status.weak')}
                            </span>
                        )}

                        <div className="text-muted-foreground text-sm font-medium mb-1">{stat.subject}</div>
                        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                            <span className="text-3xl font-black text-foreground">{stat.score}</span>
                            <div className={`flex items-center text-xs font-bold ${stat.trend > 0 ? 'text-green-600' : stat.trend < 0 ? 'text-red-500' : 'text-gray-400'
                                }`}>
                                {stat.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> :
                                    stat.trend < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> :
                                        <Minus className="w-3 h-3 mr-1" />}
                                {stat.trend > 0 ? '+' : ''}{stat.trend}%
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>{stat.count} {t('dashboard.analytics.testsCount')}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                            <div className={`h-full rounded-full ${stat.status === 'kuchli' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                                stat.status === 'zaif' ? 'bg-red-500' : 'bg-primary shadow-gold'
                                }`} style={{ width: stat.score }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent results */}
            {results.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                    <h3 className="text-sm font-bold text-foreground mb-3">{t('dashboard.analytics.recentResults')}</h3>
                    <div className="space-y-2">
                        {results.slice(0, 3).map(result => (
                            <div key={result.id} className="flex items-center justify-between text-sm py-1 border-b border-border/10 last:border-0 hover:bg-muted/30 px-1 rounded transition-colors">
                                <span className="text-muted-foreground truncate flex-1 pr-4">{result.olympiad?.title || result.olympiad_title || 'Test'}</span>
                                <span className={`font-bold ${result.percentage >= 80 ? 'text-green-500' :
                                    result.percentage < 50 ? 'text-red-500' : 'text-primary'
                                    }`}>
                                    {result.percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsResults;
