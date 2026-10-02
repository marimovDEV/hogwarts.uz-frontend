import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
    Users,
    DollarSign,
    TrendingUp,
    BookOpen,
    Trophy,
    Calendar,
    Loader2,
    Plus,
    Bell,
    CheckCircle,
    AlertCircle,
    UserPlus,
    CreditCard,
    ChevronRight,
    Search,
    UserCheck,
    Megaphone,
    Award
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { toast } from "sonner";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { uz, ru } from 'date-fns/locale';

const AdminDashboard = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const dateLocale = i18n.language === 'ru' ? ru : uz;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Overview (KPIs, Alerts, Activities)
                const overviewRes = await axios.get(`${API_URL}/admin/dashboard/overview/`, { headers: getAuthHeader() });
                if (overviewRes.data.success) {
                    setData(overviewRes.data);
                }

                // Fetch Chart
                const chartRes = await axios.get(`${API_URL}/admin/dashboard/chart/`, { headers: getAuthHeader() });
                if (chartRes.data.success) {
                    setChartData(chartRes.data.chart_data || []);
                }

            } catch (error) {
                console.error(error);
                toast.error(t('admin.dashboard.loadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse font-medium">{t('common.loading')}...</p>
                </div>
            </div>
        );
    }

    const kpis = [
        { label: t('admin.totalUsers'), value: data?.kpis?.total_users || 0, sub: `+${data?.kpis?.new_users_today || 0} ${t('common.today').toLowerCase()}`, icon: Users, color: "text-primary", bg: "bg-primary/10" },
        { label: t('admin.teachers.title'), value: data?.kpis?.teachers_count || 0, sub: t('admin.dashboard.activeMentors'), icon: UserCheck, color: "text-primary", bg: "bg-primary/10" },
        { label: t('admin.courses.title'), value: data?.kpis?.active_courses || 0, sub: t('admin.dashboard.coursesOnSale'), icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
        { label: t('admin.olympiads.title'), value: data?.kpis?.active_olympiads || 0, sub: t('admin.dashboard.olympiadsStatus'), icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
        { label: t('admin.revenue'), value: `${(data?.kpis?.revenue_month || 0).toLocaleString()} UZS`, sub: `${(data?.kpis?.revenue_today || 0).toLocaleString()} ${t('common.today').toLowerCase()}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    ];

    const quickActions = [
        { label: t('admin.dashboard.createCourse'), icon: Plus, link: "/admin/courses", color: "bg-primary text-primary-foreground shadow-gold" },
        { label: t('admin.dashboard.createOlympiad'), icon: Trophy, link: "/admin/olympiads", color: "bg-primary text-primary-foreground shadow-gold" },
        { label: t('admin.dashboard.issueCertificate'), icon: Award, link: "/admin/certificates", color: "bg-primary text-primary-foreground shadow-gold" },
        { label: t('admin.dashboard.sendNotification'), icon: Megaphone, link: "/admin/notifications", color: "bg-primary text-primary-foreground shadow-gold" },
        { label: t('admin.dashboard.addSubject'), icon: Plus, link: "/admin/subjects", color: "bg-primary text-primary-foreground shadow-gold" },
    ];

    const alerts = [
        { label: t('admin.pendingCourses'), value: data?.alerts?.pending_courses || 0, icon: BookOpen, color: "text-yellow-500", bg: "bg-yellow-500/10", link: "/admin/courses" },
        { label: t('admin.openTickets'), value: data?.alerts?.open_tickets || 0, icon: Megaphone, color: "text-red-500", bg: "bg-red-500/10", link: "/admin/support" },
        { label: t('admin.pendingCertificates'), value: data?.alerts?.pending_certificates || 0, icon: Award, color: "text-primary", bg: "bg-primary/10", link: "/admin/certificates" },
    ];

    const getActivityIcon = (iconName: string) => {
        switch (iconName) {
            case 'UserPlus': return <UserPlus className="w-4 h-4 text-primary" />;
            case 'CreditCard': return <CreditCard className="w-4 h-4 text-emerald-500" />;
            case 'Trophy': return <Trophy className="w-4 h-4 text-orange-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const localizeActivity = (text: string) => {
        if (!text) return "";

        // Payment Success
        const paymentMatch = text.match(/^To'lov muvaffaqiyatli: (.*)$/);
        if (paymentMatch) {
            return t('admin.activity.paymentSuccess', { amount: paymentMatch[1] });
        }

        // Registered
        if (text === "Olimpiadaga ro'yxatdan o'tdi") {
            return t('admin.activity.registered');
        }

        // New User
        const userMatch = text.match(/^Yangi foydalanuvchi: (.*)$/);
        if (userMatch) {
            return t('admin.activity.newUser', { name: userMatch[1] });
        }

        return text;
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight">{t('admin.dashboard.title')}</h1>
                        <p className="text-muted-foreground text-sm font-medium">{t('admin.dashboard.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            placeholder={`${t('common.search')}...`}
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl h-10 border-border">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date().toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'long', year: 'numeric' })}
                    </Button>
                </div>
            </header>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {kpis.map((kpi, i) => (
                    <Card key={i} className="border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                                <h3 className="text-2xl font-black text-foreground tracking-tight">{kpi.value}</h3>
                                <p className="text-[10px] font-semibold text-muted-foreground/80">{kpi.sub}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Area (Left 2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            {t('teacher.dashboard.quickActions')}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            {quickActions.map((action, i) => (
                                <Link
                                    key={i}
                                    to={action.link}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center text-white shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                                        <action.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-black text-center leading-tight">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Alerts / Attention Required */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            {t('admin.dashboard.attentionRequired')}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {alerts.map((alert, i) => (
                                <Link to={alert.link} key={i}>
                                    <Card className={`border-none ${alert.value > 0 ? alert.bg : 'bg-muted/30'} transition-all hover:opacity-90`}>
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full bg-white dark:bg-black/20 flex items-center justify-center ${alert.color}`}>
                                                <alert.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className={`text-xl font-black ${alert.color}`}>{alert.value}</div>
                                                <div className="text-xs font-semibold text-muted-foreground">{alert.label}</div>
                                            </div>
                                            {alert.value > 0 && (
                                                <ChevronRight className={`ml-auto w-4 h-4 ${alert.color}`} />
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <Card className="border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-black tracking-tight flex items-center gap-2 uppercase">
                                    <Users className="w-4 h-4 text-primary" />
                                    {t('admin.dashboard.userGrowth')}
                                </CardTitle>
                                drum
                            </CardHeader>
                            <CardContent className="pl-0">
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '10px' }}
                                                labelFormatter={(name) => t(`months.${name.toLowerCase()}`)}
                                            />
                                            <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-black tracking-tight flex items-center gap-2 uppercase">
                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                    {t('admin.dashboard.revenueStats')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pl-0">
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                                            <YAxis hide />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '10px' }}
                                                labelFormatter={(name) => t(`months.${name.toLowerCase()}`)}
                                                formatter={(val: any) => [`${val.toLocaleString()} UZS`, t('admin.revenue')]}
                                            />
                                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Activity Feed (Right 1/3) */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        {t('teacher.dashboard.recentActivity')}
                    </h2>
                    <Card className="border-border shadow-sm min-h-[500px]">
                        <CardContent className="p-6">
                            <div className="space-y-8 relative">
                                {/* Vertical line */}
                                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border -z-10" />

                                {data?.activities?.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors">
                                                {getActivityIcon(item.icon)}
                                            </div>
                                            {i === 0 && (
                                                <div className="absolute top-0 right-0 w-3 h-3 bg-primary border-2 border-background rounded-full" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1 pt-1">
                                            <p className="text-sm font-black text-foreground leading-tight group-hover:text-primary transition-colors cursor-default">
                                                {localizeActivity(item.title)}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {item.subtitle}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold">
                                                {formatDistanceToNow(new Date(item.time), { addSuffix: true, locale: dateLocale })}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {(!data?.activities || data.activities.length === 0) && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                        <Bell className="w-12 h-12 mb-4" />
                                        <p className="text-sm font-medium">{t('teacher.dashboard.noActivity')}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Button variant="outline" className="w-full rounded-xl border-dashed py-6 hover:bg-muted text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {t('admin.dashboard.viewAllActivity')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
