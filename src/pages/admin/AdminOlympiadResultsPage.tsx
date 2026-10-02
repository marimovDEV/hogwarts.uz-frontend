
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Trophy,
    ArrowLeft,
    Users,
    CheckCircle2,
    AlertCircle,
    Clock,
    Filter,
    Download,
    UserX
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL, getAuthHeader } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Result {
    id: number;
    user_id: number;
    student: string;
    score: number;
    percentage: number;
    time_taken: number;
    status: string;
    submitted_at: string;
    region?: string;
}

interface Stats {
    total_registrations: number;
    total_submissions: number;
    total_paid: number;
    total_disqualified: number;
    avg_score: number;
    max_score: number;
    region_breakdown: Array<{ region: string, count: number }>;
}

const AdminOlympiadResultsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [results, setResults] = useState<Result[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [disqualifyReason, setDisqualifyReason] = useState("");
    const [selectedUser, setSelectedUser] = useState<{ id: number, name: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resultsRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/olympiads/${id}/submissions/`, { headers: getAuthHeader() }),
                axios.get(`${API_URL}/olympiads/${id}/stats/`, { headers: getAuthHeader() })
            ]);
            setResults(resultsRes.data.results);
            setStats(statsRes.data.stats);
        } catch (error) {
            console.error(error);
            toast({ title: t('common.error'), description: t('admin.loadDataError'), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDisqualify = async () => {
        if (!selectedUser || !disqualifyReason) return;
        try {
            await axios.post(`${API_URL}/olympiads/${id}/disqualify/`, {
                user_id: selectedUser.id,
                reason: disqualifyReason
            }, { headers: getAuthHeader() });

            toast({ title: t('common.success'), description: t('admin.studentDisqualified') });
            setDisqualifyReason("");
            setSelectedUser(null);
            fetchData();
        } catch (error) {
            console.error(error);
            toast({ title: t('common.error'), description: t('common.errorOccurred'), variant: "destructive" });
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ' ' + t('common.hours_short') + ' ' : ''}${m}${t('common.minutes_short')} ${s}${t('common.seconds_short')}`;
    };

    if (loading) {
        return <div className="p-8 text-center">{t('common.loading')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-foreground">{t('admin.olympiadResults')}</h1>
                    <p className="text-muted-foreground text-sm">{t('admin.olympiadResultsSubtitle')}</p>
                </div>
            </div>

            {/* STATS GRID */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">{t('admin.participants')}</CardTitle>
                            <Users className="w-4 h-4 text-blue-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-black">{stats.total_submissions} / {stats.total_registrations}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">{t('admin.registrationRatio')}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">{t('admin.avgScore')}</CardTitle>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-black text-green-500">{stats.avg_score}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">{t('admin.maxScoreLabel', { count: stats.max_score })}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">{t('common.payments')}</CardTitle>
                            <div className="text-amber-500 font-bold text-lg">$</div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-black">{stats.total_paid}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">{t('admin.successfulPayments')}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">{t('admin.disqualification')}</CardTitle>
                            <UserX className="w-4 h-4 text-red-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-black text-red-500">{stats.total_disqualified}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">{t('admin.disqualifiedDesc')}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* RESULTS TABLE */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-bold flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        {t('admin.topRanking')}
                    </h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                            <Filter className="w-3.5 h-3.5 mr-2" /> {t('common.filter')}
                        </Button>
                        <Button variant="outline" size="sm" className="h-8">
                            <Download className="w-3.5 h-3.5 mr-2" /> {t('admin.export')}
                        </Button>
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="border-border">
                            <TableHead className="w-[60px]">{t('admin.order')}</TableHead>
                            <TableHead>{t('admin.student')}</TableHead>
                            <TableHead>{t('admin.region')}</TableHead>
                            <TableHead>{t('admin.score')}</TableHead>
                            <TableHead>{t('admin.time')}</TableHead>
                            <TableHead>{t('admin.status')}</TableHead>
                            <TableHead className="text-right">{t('admin.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((res, index) => (
                            <TableRow key={res.id} className="hover:bg-muted/50 border-border group">
                                <TableCell className="font-bold text-muted-foreground">{index + 1}</TableCell>
                                <TableCell>
                                    <div className="font-bold">{res.student}</div>
                                    <div className="text-[10px] text-muted-foreground">{new Date(res.submitted_at).toLocaleString()}</div>
                                </TableCell>
                                <TableCell>{res.region || t('common.unknown')}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-black text-primary">{res.score}</span>
                                        <span className="text-[10px] text-muted-foreground">{res.percentage}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(res.time_taken)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {res.status === 'COMPLETED' ? (
                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-none">{t('admin.completed')}</Badge>
                                    ) : res.status === 'DISQUALIFIED' ? (
                                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-none">{t('admin.disqualification')}</Badge>
                                    ) : (
                                        <Badge variant="outline">{res.status}</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => setSelectedUser({ id: res.user_id, name: res.student })}
                                                disabled={res.status === 'DISQUALIFIED'}
                                            >
                                                <UserX className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-card border-border">
                                            <DialogHeader>
                                                <DialogTitle>{t('admin.disqualifyUser')}</DialogTitle>
                                                <DialogDescription>
                                                    {t('admin.disqualifyReasonLabel', { name: selectedUser?.name })}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <p className="text-sm font-medium mb-2">{t('admin.disqualifyReason')}</p>
                                                <Textarea
                                                    placeholder={t('admin.disqualifyReasonPlaceholder')}
                                                    value={disqualifyReason}
                                                    onChange={(e) => setDisqualifyReason(e.target.value)}
                                                    className="bg-background border-border"
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setSelectedUser(null)}>{t('common.cancel')}</Button>
                                                <Button variant="destructive" onClick={handleDisqualify}>{t('admin.disqualifyUser')}</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminOlympiadResultsPage;
