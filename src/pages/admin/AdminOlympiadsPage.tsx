
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    Search, MoreHorizontal, Plus, Trophy, Calendar,
    Clock, Edit, Trash2, Users, AlertTriangle,
    Activity, LayoutGrid, List, Wallet, TrendingUp, BarChart, Settings, Layers
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import { API_URL, getAuthHeader, getImageUrl } from "@/services/api";
import { cn } from "@/lib/utils";

// API Data Types
interface Olympiad {
    id: number;
    title: string;
    description: string;
    subject: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    registration_start: string;
    registration_end: string;
    start_date: string;
    end_date: string;
    duration: number;
    price: number;
    status: "DRAFT" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "ONGOING" | "CHECKING" | "PUBLISHED";
    is_active: boolean;
    questions_count: number;
    participants_count: number;
    revenue: number;
}

interface AdminStats {
    status_counts: Record<string, number>;
    total_revenue: number;
    monthly_revenue: number;
    total_participants: number;
    avg_participants: number;
}

const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(val);
};

const useCountdown = (targetDate: string) => {
    const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

    useEffect(() => {
        const calculate = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff <= 0) return null;

            return {
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((diff % (1000 * 60)) / 1000),
            };
        };

        const timer = setInterval(() => setTimeLeft(calculate()), 1000);
        setTimeLeft(calculate());
        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
};

const AdminOlympiadsPage = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
    const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [layout, setLayout] = useState<"grid" | "table">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");

    // UI States
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [statusDialog, setStatusDialog] = useState<{ id: number; status: string; currentStatus: string } | null>(null);

    const ALL_STATUSES = ['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'CHECKING', 'PUBLISHED'];

    const STATUS_TRANSITIONS: Record<string, string[]> = {
        'DRAFT': ['REGISTRATION_OPEN'],
        'REGISTRATION_OPEN': ['REGISTRATION_CLOSED', 'DRAFT'],
        'REGISTRATION_CLOSED': ['ONGOING', 'REGISTRATION_OPEN'],
        'ONGOING': ['CHECKING'],
        'CHECKING': ['PUBLISHED', 'ONGOING'],
        'PUBLISHED': [],
    };

    const getAvailableStatuses = (currentStatus: string) => {
        return STATUS_TRANSITIONS[currentStatus] || ALL_STATUSES.filter(s => s !== currentStatus);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [olympiadsRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/olympiads/`, { headers: getAuthHeader() }),
                axios.get(`${API_URL}/olympiads/admin_stats/`, { headers: getAuthHeader() })
            ]);
            setOlympiads(olympiadsRes.data.results || olympiadsRes.data);
            setAdminStats(statsRes.data);
        } catch (error) {
            console.error(error);
            toast({ title: t('common.error'), description: t('admin.olympiads.loadError'), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchOlympiads = fetchData;

    const handlePublishResults = async (id: number) => {
        try {
            const res = await axios.post(`${API_URL}/olympiads/${id}/publish_results/`, {}, { headers: getAuthHeader() });
            if (res.data.success) {
                toast({ title: t('common.success'), description: t('admin.olympiads.publishSuccess') });
                fetchOlympiads();
            }
        } catch (error) {
            console.error(error);
            toast({ title: t('common.error'), description: t('admin.olympiads.publishError'), variant: "destructive" });
        }
    };

    const handleForceStart = async (id: number) => {
        try {
            const res = await axios.post(`${API_URL}/olympiads/${id}/force_start/`, {}, { headers: getAuthHeader() });
            if (res.data.success) {
                toast({ title: t('common.success'), description: t('admin.olympiads.forceStartSuccess') });
                fetchOlympiads();
            }
        } catch (error) {
            console.error(error);
            toast({ title: t('common.error'), description: t('admin.olympiads.forceStartError'), variant: "destructive" });
        }
    };

    // FILTER LOGIC
    const handleExportCSV = () => {
        if (olympiads.length === 0) return;

        const headers = ["ID", "Nomi", "Fan", "Daraja", "Narxi", "Ishtirokchilar", "Holat", "Sana"];
        const rows = filteredOlympiads.map(o => [
            o.id,
            o.title,
            o.subject,
            o.level,
            o.price,
            o.participants_count,
            o.status,
            new Date(o.start_date).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `olympiads_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredOlympiads = olympiads.filter(oly => {
        const matchesSearch = oly.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            oly.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" ? true : oly.status === statusFilter;
        const matchesSubject = subjectFilter === "all" ? true : oly.subject === subjectFilter;
        return matchesSearch && matchesStatus && matchesSubject;
    });

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`${API_URL}/olympiads/${deleteId}/`, { headers: getAuthHeader() });
            setOlympiads(olympiads.filter(c => c.id !== deleteId));
            toast({ title: t('common.deleted'), description: t('admin.olympiads.deleteSuccess'), variant: "destructive" });
            setDeleteId(null);
        } catch (error) {
            console.error(error);
            toast({ title: t('common.error'), description: t('admin.olympiads.deleteError'), variant: "destructive" });
        }
    };

    const handleSaveStatus = async () => {
        if (!statusDialog) return;
        try {
            await axios.patch(`${API_URL}/olympiads/${statusDialog.id}/`, { status: statusDialog.status }, { headers: getAuthHeader() });

            // Update local state
            setOlympiads(olympiads.map(o => o.id === statusDialog.id ? { ...o, status: statusDialog.status as any } : o));

            toast({ title: t('common.success'), description: t('admin.olympiads.statusChangeSuccess') });
            setStatusDialog(null);
        } catch (error: any) {
            console.error(error);
            const errData = error.response?.data;
            let description = t('admin.olympiads.statusChangeError');

            if (errData) {
                if (errData.status) {
                    // Field-level validation error from serializer
                    description = Array.isArray(errData.status) ? errData.status.join(', ') : errData.status;
                } else if (errData.detail) {
                    description = errData.detail;
                } else if (typeof errData === 'string') {
                    description = errData;
                }
            }

            toast({ title: t('common.error'), description, variant: "destructive" });
        }
    };

    const getStatusBadge = (status: string) => {
        const labels: Record<string, string> = {
            'DRAFT': 'Qoralama',
            'REGISTRATION_OPEN': "Ro'yxatga olish",
            'REGISTRATION_CLOSED': "Ro'yxat tugadi",
            'ONGOING': 'Boshlandi',
            'CHECKING': 'Tekshirilmoqda',
            'PUBLISHED': 'Natijalar'
        };

        const colors: Record<string, string> = {
            'DRAFT': 'border-dashed border-muted-foreground text-muted-foreground',
            'REGISTRATION_OPEN': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'REGISTRATION_CLOSED': 'bg-amber-100 text-amber-700 border-amber-200',
            'ONGOING': 'bg-green-100 text-green-700 border-green-200 animate-pulse',
            'CHECKING': 'bg-orange-100 text-orange-700 border-orange-200',
            'PUBLISHED': 'bg-purple-100 text-purple-700 border-purple-200'
        };

        return <Badge className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase", colors[status] || "bg-gray-100 text-gray-600")}>{labels[status] || status}</Badge>;
    };

    const formatMoney = (amount: number) => {
        if (amount === 0) return t('common.free');
        return formatUZS(amount);
    };

    const OlympiadCard = ({ oly }: { oly: Olympiad }) => {
        const countdown = useCountdown(oly.status === 'REGISTRATION_OPEN' ? oly.start_date : oly.registration_start);
        const isLive = oly.status === 'ONGOING';
        const isUpcoming = oly.status === 'REGISTRATION_OPEN' || oly.status === 'REGISTRATION_CLOSED';

        return (
            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border bg-card relative">
                {isLive && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-red-500 text-white animate-pulse border-none shadow-lg shadow-red-500/20">JONLI</Badge>
                    </div>
                )}

                <div className="aspect-video relative overflow-hidden bg-muted">
                    {oly.thumbnail ? (
                        <img src={getImageUrl(oly.thumbnail as any)} alt={oly.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                            <Trophy className="w-12 h-12 text-indigo-500/40" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] bg-white/20 backdrop-blur-md border-white/30 text-white uppercase">{oly.subject}</Badge>
                            <Badge variant="outline" className="text-[10px] bg-white/20 backdrop-blur-md border-white/30 text-white uppercase">{oly.level}</Badge>
                        </div>
                        <h3 className="font-bold text-sm line-clamp-1">{oly.title}</h3>
                    </div>
                </div>

                <CardContent className="p-4 space-y-4">
                    {/* Status & Timing */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            {getStatusBadge(oly.status)}
                            {isUpcoming && countdown && (
                                <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {countdown.d}d {countdown.h}h {countdown.m}m {countdown.s}s
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">{formatMoney(oly.price)}</div>
                            <div className="text-[10px] text-muted-foreground">{oly.duration} daqiqa</div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted/50 p-2 rounded-lg border border-border/50">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" />
                                Ishtirokchilar
                            </div>
                            <div className="text-sm font-black mt-0.5">{oly.participants_count || 0}</div>
                        </div>
                        <div className="bg-muted/50 p-2 rounded-lg border border-border/50">
                            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                                <Wallet className="w-2.5 h-2.5" />
                                Daromad
                            </div>
                            <div className="text-sm font-black mt-0.5">{formatUZS(oly.revenue || 0)}</div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-1.5 text-[10px]">
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span>Ro'yxatdan o'tish</span>
                            <span className="font-medium">{new Date(oly.registration_start).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400 font-bold">
                            <span>Boshlanish vaqti</span>
                            <span>{new Date(oly.start_date).toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 h-8 text-[10px] font-bold"
                        onClick={() => navigate(`/admin/olympiads/${oly.id}/edit`)}
                    >
                        <Edit className="w-3 h-3 mr-1.5" /> Tahrirlash
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => navigate(`/admin/olympiads/${oly.id}/participants`)}>
                                <Users className="w-4 h-4 mr-2" /> Ishtirokchilar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/olympiads/${oly.id}/results`)}>
                                <BarChart className="w-4 h-4 mr-2" /> Monitoring
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusDialog({ id: oly.id, status: oly.status, currentStatus: oly.status })}>
                                <Activity className="w-4 h-4 mr-2" /> Holatni o'zgartirish
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(oly.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> O'chirish
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground">{t('admin.olympiads.title')}</h1>
                    <p className="text-muted-foreground">{t('admin.olympiads.subtitle')}</p>
                </div>

                <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    onClick={() => navigate("/admin/olympiads/new")}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('admin.olympiads.newOlympiad')}
                </Button>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 shadow-none">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xs font-bold uppercase text-indigo-600">{t('admin.olympiads.totalRevenue')}</CardTitle>
                            <div className="p-1.5 bg-indigo-500/10 rounded-lg"><Wallet className="w-4 h-4 text-indigo-600" /></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{formatUZS(adminStats?.total_revenue || 0)}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            {formatUZS(adminStats?.monthly_revenue || 0)} {t('admin.thisMonth')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 shadow-none border-border">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">{t('admin.olympiads.totalParticipants')}</CardTitle>
                            <div className="p-1.5 bg-muted rounded-lg"><Users className="w-4 h-4 text-muted-foreground" /></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{adminStats?.total_participants || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">{t('admin.olympiads.avgPerEvent')}: {adminStats?.avg_participants || 0}</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 shadow-none border-border">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">{t('admin.active')}</CardTitle>
                            <div className="p-1.5 bg-green-500/10 rounded-lg"><Activity className="w-4 h-4 text-green-500" /></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-green-500">{adminStats?.status_counts?.ACTIVE || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">{t('admin.olympiads.liveNow')}</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 shadow-none border-border">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">{t('admin.upcoming')}</CardTitle>
                            <div className="p-1.5 bg-blue-500/10 rounded-lg"><Calendar className="w-4 h-4 text-blue-500" /></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-blue-500">{(adminStats?.status_counts?.REGISTRATION_OPEN || 0) + (adminStats?.status_counts?.REGISTRATION_CLOSED || 0)}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">{t('admin.olympiads.scheduledEvents')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* FILTERS TOOLBAR */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={t('admin.olympiads.searchPlaceholder')}
                            className="pl-9 bg-background border-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex border border-input rounded-md overflow-hidden p-1 bg-background h-10">
                        <Button
                            variant={layout === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className="w-8 h-8 rounded-sm"
                            onClick={() => setLayout("grid")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={layout === "table" ? "secondary" : "ghost"}
                            size="icon"
                            className="w-8 h-8 rounded-sm"
                            onClick={() => setLayout("table")}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex w-full md:w-auto gap-3 overflow-x-auto pb-1 md:pb-0">
                    <Button variant="outline" size="sm" className="h-10 px-4" onClick={handleExportCSV}>
                        <Layers className="w-4 h-4 mr-2" /> Eksport
                    </Button>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger className="w-[140px] bg-background border-input">
                            <SelectValue placeholder={t('admin.subject')} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            <SelectItem value="all">{t('admin.olympiads.allSubjects')}</SelectItem>
                            <SelectItem value="Matematika">{t('admin.math')}</SelectItem>
                            <SelectItem value="Fizika">{t('admin.physics')}</SelectItem>
                            <SelectItem value="Informatika">{t('admin.it')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
                        <TabsList className="bg-muted">
                            <TabsTrigger value="all" className="text-xs">{t('admin.all')}</TabsTrigger>
                            <TabsTrigger value="DRAFT" className="text-xs">Qoralama</TabsTrigger>
                            <TabsTrigger value="REGISTRATION_OPEN" className="text-xs">Ro'yxat</TabsTrigger>
                            <TabsTrigger value="ONGOING" className="text-xs">Boshlandi</TabsTrigger>
                            <TabsTrigger value="CHECKING" className="text-xs">Tekshiruv</TabsTrigger>
                            <TabsTrigger value="PUBLISHED" className="text-xs">Natijalar</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* OLYMPIADS CONTENT */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-[380px] bg-muted rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : layout === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredOlympiads.map(oly => (
                        <OlympiadCard key={oly.id} oly={oly} />
                    ))}
                </div>
            ) : (
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="border-border">
                                <TableHead className="w-[80px]">{t('common.id')}</TableHead>
                                <TableHead>{t('admin.olympiad')}</TableHead>
                                <TableHead>{t('admin.time')}</TableHead>
                                <TableHead>{t('admin.olympiads.levelAndPrice')}</TableHead>
                                <TableHead className="w-[200px]">{t('admin.status')}</TableHead>
                                <TableHead className="text-right">{t('admin.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOlympiads.map((oly) => (
                                <TableRow key={oly.id} className="hover:bg-muted/50 border-b border-border group">
                                    <TableCell className="font-mono text-xs text-muted-foreground">{oly.id}</TableCell>
                                    <TableCell>
                                        <div className="font-bold text-foreground flex items-center gap-2">
                                            <Trophy className={`w-4 h-4 ${oly.subject === 'Matematika' ? 'text-blue-500' : 'text-purple-500'}`} />
                                            {oly.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {oly.subject} • {oly.questions_count || 0} {t('admin.olympiads.questions')}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span className="font-medium text-foreground flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                {new Date(oly.start_date).toLocaleDateString()}
                                            </span>
                                            <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                {new Date(oly.start_date).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit ${oly.level === 'ADVANCED' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' :
                                                oly.level === 'INTERMEDIATE' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                                                    'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {oly.level}
                                            </span>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {formatMoney(oly.price)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(oly.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/olympiads/${oly.id}/edit`)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/admin/olympiads/${oly.id}/participants`)}>
                                                        <Users className="w-4 h-4 mr-2" /> {t('admin.olympiads.participants')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigate(`/admin/olympiads/${oly.id}/results`)}>
                                                        <Trophy className="w-4 h-4 mr-2" /> {t('admin.olympiads.resultsAndAnalytics')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => setStatusDialog({ id: oly.id, status: oly.status, currentStatus: oly.status })}>
                                                        <Activity className="w-4 h-4 mr-2" /> {t('admin.olympiads.changeStatus')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(oly.id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> {t('common.delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {!loading && filteredOlympiads.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center border border-dashed rounded-2xl bg-muted/20">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">{t('admin.olympiads.noOlympiadsFound')}</h3>
                    <p className="text-muted-foreground mb-6">{t('admin.olympiads.noOlympiadsFoundSubtitle')}</p>
                    <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setSubjectFilter("all") }}>
                        {t('admin.clearFilters')}
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            {t('admin.olympiads.deleteConfirm')}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {t('admin.olympiads.deleteConfirmText', { title: olympiads.find(c => c.id === deleteId)?.title })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>{t('common.cancel')}</Button>
                        <Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Change Dialog */}
            <Dialog open={!!statusDialog} onOpenChange={(open) => !open && setStatusDialog(null)}>
                <DialogContent className="bg-card border-border sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('admin.olympiads.changeStatus')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.olympiads.changeStatusDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Select
                                value={statusDialog?.status}
                                onValueChange={(val) => setStatusDialog(prev => prev ? ({ ...prev, status: val }) : null)}
                            >
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue placeholder={t('admin.olympiads.selectStatus')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusDialog && getAvailableStatuses(statusDialog.currentStatus).map(s => (
                                        <SelectItem key={s} value={s} className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    s === 'DRAFT' ? "bg-gray-400" :
                                                        s === 'ONGOING' ? "bg-green-500" :
                                                            s === 'REGISTRATION_OPEN' ? "bg-indigo-500" :
                                                                s === 'REGISTRATION_CLOSED' ? "bg-amber-500" :
                                                                    s === 'PUBLISHED' ? "bg-purple-500" :
                                                                        s === 'CHECKING' ? "bg-orange-500" : "bg-gray-500"
                                                )} />
                                                <span className="font-bold">
                                                    {s === 'DRAFT' ? 'Qoralama' :
                                                        s === 'REGISTRATION_OPEN' ? "Ro'yxatga olish boshlandi" :
                                                            s === 'REGISTRATION_CLOSED' ? "Ro'yxatdan o'tish tugadi" :
                                                                s === 'ONGOING' ? 'Olimpiada boshladi' :
                                                                    s === 'CHECKING' ? 'Tekshirilmoqda' :
                                                                        s === 'PUBLISHED' ? "Natijalar e'lon qilindi" : s}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                    {statusDialog && getAvailableStatuses(statusDialog.currentStatus).length === 0 && (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            {t('admin.olympiads.noTransitions', 'Keyingi holatlar mavjud emas')}
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusDialog(null)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSaveStatus}>{t('admin.save')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default AdminOlympiadsPage;
