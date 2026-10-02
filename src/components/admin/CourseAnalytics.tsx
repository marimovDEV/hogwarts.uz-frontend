import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line
} from "recharts";
import {
    Users,
    CheckCircle2,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Activity
} from "lucide-react";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface LessonStat {
    id: number;
    title: string;
    reached_count: number;
    completed_count: number;
    dropoff_rate: number;
}

interface AnalyticsData {
    total_students: number;
    completed_students: number;
    completion_rate: number;
    lessons: LessonStat[];
}

interface CourseAnalyticsProps {
    courseId: number;
}

const CourseAnalytics = ({ courseId }: CourseAnalyticsProps) => {
    const { t } = useTranslation();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [courseId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/courses/${courseId}/analytics/`, { headers: getAuthHeader() });
            setData(res.data);
        } catch (error) {
            console.error("Analytics fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-muted-foreground font-bold">{t('common.loading') || "Yuklanmoqda..."}</div>;
    if (!data) return <div className="p-20 text-center text-muted-foreground">{t('common.noData') || "Ma'lumot topilmadi."}</div>;

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-8 p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase">{t('admin.analytics.totalStudents')}</p>
                        <p className="text-2xl font-black text-foreground">{data.total_students}</p>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase">{t('admin.analytics.completedStudents')}</p>
                        <p className="text-2xl font-black text-foreground">{data.completed_students}</p>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <Activity className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase">{t('admin.analytics.completionRate')}</p>
                        <p className="text-2xl font-black text-foreground">{data.completion_rate.toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            {/* Drop-off Chart */}
            <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-black text-foreground">{t('admin.analytics.lessonDropoff')}</h3>
                        <p className="text-sm text-muted-foreground">{t('admin.analytics.dropoffDesc')}</p>
                    </div>
                    <Badge variant="outline" className="h-8 rounded-full px-4 border-primary/20 text-primary font-bold">
                        <TrendingDown className="w-3.5 h-3.5 mr-2" /> {t('admin.analytics.dropoffRate')}
                    </Badge>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.lessons}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                            <XAxis
                                dataKey="title"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#888888', fontSize: 12, fontWeight: 500 }}
                                hide={data.lessons.length > 10}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: '#88888810' }}
                            />
                            <Bar dataKey="reached_count" radius={[10, 10, 0, 0]} name={t('admin.analytics.reachedStudents')}>
                                {data.lessons.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                <div className="p-8 border-b border-border">
                    <h3 className="text-xl font-black text-foreground">{t('admin.analytics.detailedStats')}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/30">
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.analytics.lessonName')}</th>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">{t('admin.analytics.reachedStudents')}</th>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">{t('admin.analytics.completedStudents')}</th>
                                <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">{t('admin.analytics.dropoff')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.lessons.map((lesson) => (
                                <tr key={lesson.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-8 py-5 font-bold text-foreground">{lesson.title}</td>
                                    <td className="px-8 py-5 text-center font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-blue-500" />
                                            {lesson.reached_count}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            {lesson.completed_count}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${lesson.dropoff_rate > 30 ? 'bg-red-500/10 text-red-500' :
                                            lesson.dropoff_rate > 10 ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-green-500/10 text-green-500'
                                            }`}>
                                            {lesson.dropoff_rate > 10 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {lesson.dropoff_rate.toFixed(1)}%
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CourseAnalytics;
