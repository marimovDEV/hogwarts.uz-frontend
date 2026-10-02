
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle, Monitor, Globe, ShieldAlert, ArrowLeft, Download, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuestionDetail {
    id: number;
    text: string;
    type: string;
    points: number;
    user_answer: string | null;
    correct_answer: string;
    status: 'CORRECT' | 'INCORRECT' | 'SKIPPED';
    is_correct: boolean;
    explanation?: string;
}

interface ResultData {
    user: {
        id: number;
        name: string;
        avatar: string | null;
    };
    stats: {
        score: number;
        max_score: number;
        time_taken: number;
        tab_switches: number;
        ip: string | null;
        device: string | null;
        submitted_at: string;
    };
    questions: QuestionDetail[];
}

export default function AdminParticipantAnalysisPage() {
    const { id: olympiadId, userId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [data, setData] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId && olympiadId) {
            fetchDetails();
        }
    }, [userId, olympiadId]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/olympiads/${olympiadId}/result_detail/${userId}/`, {
                headers: getAuthHeader()
            });
            if (res.data.success) {
                setData(res.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const formatAnswer = (ans: string | null) => {
        if (ans === null || ans === undefined || ans === '') return null;
        if (/^\d+$/.test(ans)) {
            const idx = parseInt(ans);
            if (idx >= 0 && idx < 26) return String.fromCharCode(65 + idx);
        }
        return ans;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CORRECT': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'INCORRECT': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto py-8 text-center text-muted-foreground">
                Ma'lumot topilmadi
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(`/admin/olympiads/${olympiadId}/participants`)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Ishtirokchilarga qaytish
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <h1 className="text-2xl font-bold">Natija Tahlili</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> PDF Yuklash
                    </Button>
                </div>
            </div>

            {/* User & Stats Card Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Info */}
                <Card className="lg:col-span-1 shadow-md border-primary/10">
                    <CardHeader className="bg-muted/10">
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                                {data.user.avatar ? (
                                    <img src={data.user.avatar} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    data.user.name.charAt(0)
                                )}
                            </div>
                            <div>
                                {data.user.name}
                                <div className="text-sm font-normal text-muted-foreground mt-1">ID: #{data.user.id}</div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                            <div className="text-muted-foreground text-sm font-medium">To'plangan Ball</div>
                            <div className="font-bold text-xl text-primary">{data.stats.score} <span className="text-sm text-muted-foreground">/ {data.stats.max_score}</span></div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                            <div className="text-muted-foreground text-sm font-medium">Sarflangan Vaqt</div>
                            <div className="font-bold text-xl">{formatTime(data.stats.time_taken)}</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200/50">
                            <div className="text-amber-700 dark:text-amber-400 text-sm font-medium flex gap-2 items-center">
                                <AlertTriangle className="w-4 h-4" /> Tab Switches
                            </div>
                            <div className="font-bold text-xl text-amber-700 dark:text-amber-400">{data.stats.tab_switches}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Stats */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle>Texnik Tafsilotlar</CardTitle>
                        <CardDescription>Qurilma va tarmoq ma'lumotlari</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                <Globe className="w-3 h-3" /> IP Address
                            </span>
                            <div className="p-3 bg-muted/30 rounded-lg font-mono text-sm border">
                                {data.stats.ip || "Noma'lum"}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                <Monitor className="w-3 h-3" /> Device Info
                            </span>
                            <div className="p-3 bg-muted/30 rounded-lg font-mono text-sm border truncate" title={data.stats.device || ""}>
                                {data.stats.device || "Noma'lum"}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Submitted At
                            </span>
                            <div className="p-3 bg-muted/30 rounded-lg font-mono text-sm border">
                                {new Date(data.stats.submitted_at).toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Questions Analysis */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" /> Savollar Tahlili
                </h2>

                <div className="grid grid-cols-1 gap-6">
                    {data.questions.map((q, idx) => (
                        <Card key={q.id} className={cn("overflow-hidden border-2 transition-all hover:shadow-md", getStatusColor(q.status))}>
                            <CardHeader className="bg-white/10 dark:bg-black/10 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-white",
                                            q.status === 'CORRECT' ? "bg-green-600" : q.status === 'INCORRECT' ? "bg-red-500" : "bg-gray-400"
                                        )}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Savol #{idx + 1}</CardTitle>
                                            <CardDescription className="font-mono text-xs opacity-70">{q.points} Ball</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={q.status === 'CORRECT' ? 'default' : 'destructive'} className={cn(
                                        q.status === 'SKIPPED' ? "bg-gray-500 hover:bg-gray-600" : q.status === 'CORRECT' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                                    )}>
                                        {q.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <p className="text-lg font-medium leading-relaxed">
                                    {q.text}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold uppercase opacity-70">O'quvchi Javobi</span>
                                        <div className={cn(
                                            "p-4 rounded-xl font-bold text-lg border-2",
                                            q.status === 'CORRECT' ? "bg-green-100 border-green-300 text-green-800" :
                                                q.status === 'INCORRECT' ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200"
                                        )}>
                                            {formatAnswer(q.user_answer) || "Javob yo'q"}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold uppercase opacity-70">To'g'ri Javob</span>
                                        <div className="p-4 rounded-xl font-bold text-lg border-2 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                                            {formatAnswer(q.correct_answer)}
                                        </div>
                                    </div>
                                </div>

                                {q.explanation && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-sm">
                                        <p className="font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-2">
                                            <ExternalLink className="w-3 h-3" /> Izoh
                                        </p>
                                        <p className="text-blue-900 dark:text-blue-100">{q.explanation}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
