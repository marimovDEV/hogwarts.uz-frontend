import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Trophy,
    ArrowLeft,
    Search,
    Filter,
    Edit,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    ChevronRight,
    MessageSquare,
    Save,
    Eye,
    ClipboardCheck,
    AlertTriangle,
    Check
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface OlympiadSubmissionResult {
    id: number;
    user_id: number;
    student: string;
    region?: string | null;
    score: number;
    percentage: number;
    time_taken: number;
    status: string;
    feedback?: string | null;
    answers?: Record<string, string | number>;
}

interface OlympiadQuestionReview {
    id: number;
    title?: string;
    text: string;
    correct_answer: string;
    points: number;
    explanation?: string;
}

interface TeacherOlympiadDetail {
    title: string;
    questions?: OlympiadQuestionReview[];
}

interface OlympiadPrize {
    id: number;
    name: string;
    condition?: string;
}

interface PaginatedResponse<T> {
    results?: T[];
}

interface ConfirmWinnersResponse {
    success?: boolean;
    message?: string;
}

const TeacherOlympiadResultsPage = () => {
    const { id } = useParams();
    const [results, setResults] = useState<OlympiadSubmissionResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedResult, setSelectedResult] = useState<OlympiadSubmissionResult | null>(null);
    const [gradingScore, setGradingScore] = useState<string>("");
    const [gradingComment, setGradingComment] = useState("");
    const [isGrading, setIsGrading] = useState(false);
    const [olympiad, setOlympiad] = useState<TeacherOlympiadDetail | null>(null);
    const [prizes, setPrizes] = useState<OlympiadPrize[]>([]);
    const [selectedWinners, setSelectedWinners] = useState<Record<number, OlympiadSubmissionResult | null>>({}); // {position: result}
    const [isConfirming, setIsConfirming] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewResult, setReviewResult] = useState<OlympiadSubmissionResult | null>(null);

    const fetchOlympiadDetails = useCallback(async () => {
        try {
            const res = await axios.get<TeacherOlympiadDetail>(`${API_URL}/olympiads/${id}/`, { headers: getAuthHeader() });
            setOlympiad(res.data);
        } catch (error) {
            console.error(error);
        }
    }, [id]);

    const fetchPrizes = useCallback(async () => {
        try {
            const res = await axios.get<PaginatedResponse<OlympiadPrize>>(`${API_URL}/olympiad-prizes/?olympiad=${id}`, { headers: getAuthHeader() });
            setPrizes(res.data.results || []);
        } catch (error) {
            console.error(error);
        }
    }, [id]);

    const fetchResults = useCallback(async () => {
        try {
            const res = await axios.get<PaginatedResponse<OlympiadSubmissionResult>>(`${API_URL}/olympiads/${id}/submissions/`, { headers: getAuthHeader() });
            setResults(res.data.results || []);
        } catch (error) {
            console.error(error);
            toast.error("Natijalarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void fetchResults();
        void fetchOlympiadDetails();
        void fetchPrizes();
    }, [fetchOlympiadDetails, fetchPrizes, fetchResults]);

    const handleGrade = async () => {
        if (!selectedResult || !gradingScore) return;

        setIsGrading(true);
        try {
            await axios.post(
                `${API_URL}/olympiads/${id}/grade_result/`,
                {
                    user_id: selectedResult.user_id,
                    score: parseInt(gradingScore),
                    comment: gradingComment
                },
                { headers: getAuthHeader() }
            );
            toast.success("Natija yangilandi");
            setSelectedResult(null);
            await fetchResults();
        } catch (error) {
            console.error(error);
            toast.error("Xatolik yuz berdi");
        } finally {
            setIsGrading(false);
        }
    };

    const handleConfirmWinners = async () => {
        if (Object.keys(selectedWinners).length === 0) {
            toast.error("Iltimos, g'oliblarni tanlang");
            return;
        }

        setIsConfirming(true);
        try {
            const winnersList = Object.entries(selectedWinners).flatMap(([pos, result]) => result ? [{
                user_id: result.user_id,
                position: parseInt(pos),
                prize_id: prizes.find(p => p.condition?.includes(pos))?.id
            }] : []);

            const res = await axios.post<ConfirmWinnersResponse>(
                `${API_URL}/olympiads/${id}/confirm_winners/`,
                { winners: winnersList },
                { headers: getAuthHeader() }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                setShowConfirmModal(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("G'oliblarni tasdiqlashda xatolik");
        } finally {
            setIsConfirming(false);
        }
    };

    const filteredResults = results.filter(r =>
        r.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.region && r.region.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const totalQuestionPoints = olympiad?.questions?.reduce((acc, q) => acc + q.points, 0) ?? 0;
    const topCandidates = [...results].sort((a, b) => b.score - a.score).slice(0, 10);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/teacher/olympiads">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Natijalarni Tekshirish</h1>
                    <p className="text-muted-foreground">{olympiad?.title || "Olimpiada natijalari"}</p>
                </div>
                <div className="flex-1" />
                <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary shadow-gold">
                            <Trophy className="w-4 h-4" />
                            G'oliblarni tasdiqlash
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>G'oliblarni Tasdiqlash</DialogTitle>
                            <DialogDescription>
                                Olimpiada yakunlangach, top 3 o'rinni egallagan ishtirokchilarni tasdiqlang.
                                Ularga Telegram orqali xabar yuboriladi.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            {[1, 2, 3].map(pos => (
                                <div key={pos} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-muted/30">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${pos === 1 ? 'bg-yellow-400 text-yellow-950 shadow-gold' :
                                        pos === 2 ? 'bg-slate-300 text-slate-800' :
                                            'bg-amber-600 text-amber-50'
                                        }`}>
                                        {pos}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{pos}-o'rin egalovchisi</p>
                                        <select
                                            className="w-full bg-background border border-border rounded-lg p-2 text-sm font-medium"
                                            value={selectedWinners[pos]?.user_id || ""}
                                            onChange={(e) => {
                                                const res = results.find(r => r.user_id === parseInt(e.target.value));
                                                setSelectedWinners(prev => ({ ...prev, [pos]: res }));
                                            }}
                                        >
                                            <option value="">Tanlang...</option>
                                            {topCandidates.map(r => (
                                                <option key={r.user_id} value={r.user_id}>
                                                    {r.student} ({r.score} ball)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Sovrin</p>
                                        <p className="text-sm font-bold text-primary">
                                            {prizes.find(p => p.condition?.includes(pos.toString()))?.name || "Belgilanmagan"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Bekor qilish</Button>
                            <Button onClick={handleConfirmWinners} disabled={isConfirming} className="bg-primary text-primary-foreground">
                                {isConfirming ? "Yuborilmoqda..." : "Tasdiqlash va Xabar yuborish"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Ishtirokchi yoki viloyat bo'yicha qidirish..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                        Jami: {filteredResults.length} ta natija
                    </span>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12">Yuklanmoqda...</div>
                    ) : filteredResults.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground font-medium">
                            Hech qanday natija topilmadi
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ishtirokchi</TableHead>
                                    <TableHead>Viloyat</TableHead>
                                    <TableHead>Ball</TableHead>
                                    <TableHead>Vaqt</TableHead>
                                    <TableHead>Holat</TableHead>
                                    <TableHead className="text-right">Amallar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredResults.map((res) => (
                                    <TableRow key={res.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                    {res.student.charAt(0)}
                                                </div>
                                                <span className="font-medium">{res.student}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{res.region || "Noma'lum"}</TableCell>
                                        <TableCell>
                                            <span className="font-bold text-lg">{res.score}</span>
                                            <span className="text-xs text-muted-foreground ml-1">({res.percentage}%)</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatTime(res.time_taken)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${res.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                res.status === 'DISQUALIFIED' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {res.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="sm" className="gap-2 text-primary" onClick={() => {
                                                    setReviewResult(res);
                                                    setShowReviewModal(true);
                                                }}>
                                                    <Eye className="w-4 h-4" />
                                                    Ko'rish
                                                </Button>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => {
                                                            setSelectedResult(res);
                                                            setGradingScore(res.score.toString());
                                                            setGradingComment(res.feedback || "");
                                                        }}>
                                                            <Edit className="w-4 h-4" />
                                                            Baholash
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Baholash: {res.student}</DialogTitle>
                                                            <DialogDescription>
                                                                Ushbu ishtirokchi uchun yakuniy ballni belgilang.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="score" className="text-right font-bold">Ball</Label>
                                                                <Input
                                                                    id="score"
                                                                    type="number"
                                                                    className="col-span-3"
                                                                    value={gradingScore}
                                                                    onChange={(e) => setGradingScore(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <Label htmlFor="comment" className="font-bold">Izoh / Feedback</Label>
                                                                <Textarea
                                                                    id="comment"
                                                                    placeholder="O'quvchi uchun izoh yoki xatoliklar haqida feedback yozing..."
                                                                    className="min-h-[120px] bg-muted/30 border-border/50 focus:border-primary/50"
                                                                    value={gradingComment}
                                                                    onChange={(e) => setGradingComment(e.target.value)}
                                                                />
                                                                <p className="text-[10px] text-muted-foreground italic">
                                                                    Ushbu izoh o'quvchining shaxsiy kabinetida ko'rinadi.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setSelectedResult(null)}>Bekor qilish</Button>
                                                            <Button onClick={handleGrade} disabled={isGrading}>
                                                                <Save className="w-4 h-4 mr-2" />
                                                                Saqlash
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )
                    }
                </CardContent >
            </Card >

            {/* Answer Review Dialog */}
            < Dialog open={showReviewModal} onOpenChange={setShowReviewModal} >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-primary/20 bg-[#0B0F1A]/95 backdrop-blur-xl">
                    <DialogHeader className="p-6 pb-2 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <ClipboardCheck className="w-6 h-6" />
                                    </div>
                                    {reviewResult?.student} - Javoblar tahlili
                                </DialogTitle>
                                <DialogDescription className="mt-1">
                                    Olimpiada savollariga berilgan javoblar va to'g'ri javoblar bilan solishtirish.
                                </DialogDescription>
                            </div>
                            <div className="text-right px-4">
                                <p className="text-sm font-bold text-primary">{reviewResult?.score} / {totalQuestionPoints} ball</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{reviewResult?.percentage}% natija</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar">
                        <div className="space-y-6">
                            {olympiad?.questions?.map((q, idx: number) => {
                                const studentAnswer = reviewResult?.answers?.[q.id.toString()];
                                // Normalized comparison
                                const normalizedStudent = studentAnswer?.toString().trim().toLowerCase() || "";
                                const normalizedCorrect = q.correct_answer?.toString().trim().toLowerCase() || "";

                                const isAnswered = studentAnswer !== undefined && studentAnswer !== "";
                                const isCorrect = isAnswered && normalizedStudent === normalizedCorrect;

                                return (
                                    <div key={q.id} className={`p-5 rounded-2xl border transition-all duration-300 ${isCorrect
                                        ? 'bg-green-500/5 border-green-500/20'
                                        : !isAnswered
                                            ? 'bg-slate-500/5 border-slate-500/20 opacity-80'
                                            : 'bg-red-500/5 border-red-500/20'
                                        }`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex gap-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${isCorrect
                                                    ? 'bg-green-500 text-white'
                                                    : !isAnswered
                                                        ? 'bg-slate-500 text-white'
                                                        : 'bg-red-500 text-white'
                                                    }`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="text-lg font-bold leading-tight mb-2 break-words">{q.title || `Savol - ${idx + 1}`}</h4>
                                                    <div className="prose prose-invert prose-sm text-muted-foreground max-w-none break-words" dangerouslySetInnerHTML={{ __html: q.text }} />
                                                </div>
                                            </div>
                                            <Badge variant={isCorrect ? "default" : "destructive"} className={isCorrect
                                                ? "bg-green-600/20 text-green-400 border-green-500/30 whitespace-nowrap"
                                                : !isAnswered
                                                    ? "bg-slate-600/20 text-slate-400 border-slate-500/30 whitespace-nowrap"
                                                    : "bg-red-600/20 text-red-400 border-red-500/30 whitespace-nowrap"
                                            }>
                                                {isCorrect ? "To'g'ri" : !isAnswered ? "Javobsiz" : "Xato"}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                                            <div className={`p-3 rounded-xl border ${isCorrect ? 'bg-green-500/5 border-green-500/20' : !isAnswered ? 'bg-background/30 border-border/50' : 'bg-red-500/5 border-red-500/20'}`}>
                                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">O'quvchi javobi</p>
                                                <p className={`font-bold ${isCorrect ? 'text-green-400' : !isAnswered ? 'text-muted-foreground italic' : 'text-red-400'}`}>
                                                    {studentAnswer || "Javob berilmagan"}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                                                <p className="text-[10px] font-black uppercase text-primary/70 mb-1 tracking-widest">To'g'ri javob</p>
                                                <p className="font-extrabold text-primary">{q.correct_answer || "Belgilanmagan"}</p>
                                            </div>
                                        </div>

                                        {q.explanation && (
                                            <div className="mt-4 ml-12 p-3 rounded-xl bg-white/5 border border-white/10 flex gap-3">
                                                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-yellow-500/70 mb-1 tracking-widest">Tushuntirish</p>
                                                    <p className="text-sm text-muted-foreground italic">{q.explanation}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter className="p-6 border-t border-white/5 bg-muted/20">
                        <Button variant="outline" className="border-border/50" onClick={() => setShowReviewModal(false)}>
                            Yopish
                        </Button>
                        <Button className="gap-2 bg-primary shadow-gold" onClick={() => {
                            setShowReviewModal(false);
                            setSelectedResult(reviewResult);
                            setGradingScore(reviewResult?.score?.toString());
                            setGradingComment(reviewResult?.feedback || "");
                        }}>
                            <Edit className="w-4 h-4" />
                            Baholashni boshlash
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    );
};

export default TeacherOlympiadResultsPage;
