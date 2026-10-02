import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface SupportAnalyticsProps {
    categoryData: { name: string; value: number; color?: string }[];
    performanceData: { name: string; date: string; open: number; resolved: number }[];
    responseTimeData: { name: string; time: number }[];
    isLoading: boolean;
}

const SupportAnalytics = ({ categoryData, performanceData, responseTimeData, isLoading }: SupportAnalyticsProps) => {
    const { t } = useTranslation();

    // Localize Data
    // Color mapping for known categories
    const COLORS: Record<string, string> = {
        'Payment': '#f87171', // Red
        'Technical': '#60a5fa', // Blue
        'Course': '#fbbf24', // Yellow
        'Olympiad': '#a78bfa', // Purple
        'Other': '#9ca3af', // Gray
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[280px] bg-gray-100/50 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    // Localize Category Names and Assign Colors
    const localizedCategoryData = categoryData.map((d, index) => ({
        ...d,
        name: t(`admin.ticketCategories.${d.name}` as any, { defaultValue: d.name }),
        color: COLORS[d.name] || COLORS['Other']
    }));

    const localizedPerformanceData = performanceData.map(d => ({
        ...d,
        name: t(`admin.days.${d.name}` as any)
    }));

    const localizedResponseTimeData = responseTimeData.map(d => ({
        ...d,
        name: t(`admin.days.${d.name}` as any)
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Category Distribution */}
            <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold">{t('admin.ticketCategoriesTitle')}</CardTitle>
                    <CardDescription>{t('admin.mostCommonIssues')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={localizedCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {localizedCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => [`${value}%`, t('admin.share')]} />
                                <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Trend */}
            <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold">{t('admin.agentEfficiency')}</CardTitle>
                    <CardDescription>{t('admin.weeklyTicketStats')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={localizedPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                                <Bar dataKey="resolved" name={t('admin.statusResolved')} stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} barSize={20} />
                                <Bar dataKey="open" name={t('admin.statusOpen')} stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Response Time Trend */}
            <Card className="shadow-sm border-gray-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold">{t('admin.responseTime')}</CardTitle>
                    <CardDescription>{t('admin.avgInMinutes')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={localizedResponseTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => [`${value} ${t('common.min')}`, t('common.time')]} />
                                <Line type="monotone" dataKey="time" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SupportAnalytics;
