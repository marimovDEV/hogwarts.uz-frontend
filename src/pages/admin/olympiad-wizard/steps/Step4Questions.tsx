import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit2, GripVertical, Check, Clock, HelpCircle, Upload, FileSpreadsheet, Download } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";

interface Question {
    id?: number;
    text: string;
    type: "MCQ" | "NUMERIC" | "TEXT" | "CODE";
    options: string[]; // JSON list
    correct_answer: string;
    points: number;
    order: number;
    explanation: string;
    time_limit: number;
    code_template?: string;
}

interface OlympiadQuestionSettings {
    is_random?: boolean;
    time_limit_per_question?: number;
}

const getQuestionErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (typeof data === "object" && data !== null) {
            const record = data as Record<string, unknown>;
            if (typeof record.error === "string") return record.error;
            if (typeof record.detail === "string") return record.detail;
        }
    }
    return fallback;
};

const Step4Questions = ({ olympiadId, isEdit }: { olympiadId: number, isEdit: boolean }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [editingQ, setEditingQ] = useState<Question | null>(null);

    // Form State for Dialog
    const [qForm, setQForm] = useState<Question>({
        text: "",
        type: "MCQ",
        options: ["", "", "", ""],
        correct_answer: "0",
        points: 1,
        order: 0,
        explanation: "",
        time_limit: 0,
        code_template: ""
    });

    const [olympiadSettings, setOlympiadSettings] = useState<OlympiadQuestionSettings | null>(null);

    const fetchOlympiadSettings = useCallback(async () => {
        try {
            const res = await axios.get<OlympiadQuestionSettings>(`${API_URL}/olympiads/${olympiadId}/`, { headers: getAuthHeader() });
            setOlympiadSettings(res.data);
        } catch (error) {
            console.error("Failed to fetch settings");
        }
    }, [olympiadId]);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            // Use dedicated admin endpoint to fetch questions
            const res = await axios.get<Question[]>(`${API_URL}/olympiads/${olympiadId}/get_questions/`, { headers: getAuthHeader() });

            if (Array.isArray(res.data)) {
                setQuestions([...res.data].sort((a, b) => a.order - b.order));
            }
        } catch (error) {
            console.error("Failed to load questions");
        } finally {
            setLoading(false);
        }
    }, [olympiadId]);

    useEffect(() => {
        if (!olympiadId) return;
        void fetchQuestions();
        void fetchOlympiadSettings();
    }, [fetchOlympiadSettings, fetchQuestions, olympiadId]);

    const handleSaveQuestion = async () => {
        if (!olympiadId) {
            toast.error("Xatolik: Olimpiada ID topilmadi. Iltimos sahifani yangilang.");
            return;
        }
        if (!qForm.text) {
            toast.error("Savol matnini kiriting");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...qForm,
                olympiad: olympiadId,
                olympiad_id: olympiadId, // Send both to be sure
                // Ensure options is a valid array for MCQ
                options: qForm.type === 'MCQ' ? qForm.options.filter(o => o.trim() !== "") : null
            };

            if (editingQ?.id) {
                await axios.put(`${API_URL}/questions/${editingQ.id}/`, payload, { headers: getAuthHeader() });
                toast.success("Savol yangilandi");
            } else {
                await axios.post(`${API_URL}/questions/`, payload, { headers: getAuthHeader() });
                toast.success("Savol qo'shildi");
            }
            setIsDialogOpen(false);
            await fetchQuestions();
        } catch (error: unknown) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === "object" && error.response.data !== null && "errors" in error.response.data) {
                // Validation errors
                const errors = (error.response.data as { errors: Record<string, string> }).errors;
                Object.keys(errors).forEach(key => {
                    toast.error(`${key}: ${errors[key]}`);
                });
            } else {
                if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === "object" && error.response.data !== null && "request_data" in error.response.data) {
                    console.log("Request Data:", (error.response.data as { request_data: unknown }).request_data);
                }
                toast.error(`Xatolik: ${getQuestionErrorMessage(error, "Xatolik yuz berdi")}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
        try {
            await axios.delete(`${API_URL}/questions/${id}/`, { headers: getAuthHeader() });
            toast.success("O'chirildi");
            await fetchQuestions();
        } catch (err) {
            toast.error("O'chirishda xatolik");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!olympiadId) {
            toast.error("Avval olimpiadani saqlang");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading("Yuklanmoqda...");

        try {
            const res = await axios.post(`${API_URL}/olympiads/${olympiadId}/import_questions/`, formData, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.dismiss(toastId);
            if (res.data.success) {
                toast.success(res.data.message);
                await fetchQuestions();
            } else {
                toast.error(res.data.error || "Yuklashda xatolik");
            }
        } catch (error: unknown) {
            toast.dismiss(toastId);
            console.error(error);
            toast.error(getQuestionErrorMessage(error, "Yuklashda xatolik yuz berdi"));
        }

        // Reset input
        e.target.value = '';
    };

    const openNew = () => {
        setEditingQ(null);
        setQForm({
            text: "",
            type: "MCQ",
            options: ["", "", "", ""],
            correct_answer: "0",
            points: 1,
            order: questions.length + 1,
            explanation: "",
            time_limit: 0,
            code_template: ""
        });
        setIsDialogOpen(true);
    };

    const openEdit = (q: Question) => {
        setEditingQ(q);
        setQForm({
            ...q,
            options: q.options || ["", "", "", ""],
            correct_answer: q.correct_answer || ""
        });
        setIsDialogOpen(true);
    };

    if (!olympiadId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <p className="text-muted-foreground">Savollar qo'shish uchun avval asosiy ma'lumotlarni saqlang.</p>
                <p className="text-sm text-yellow-600">"Keyingi" tugmasini bosing (agar yangi bo'lsa, avtomatik saqlanadi).</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Savollar ({questions.length})</h2>
                <div className="flex gap-2">
                    <div className="relative">
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv,.docx"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" className="gap-2">
                            <Upload className="w-4 h-4" /> Import (Excel/Word)
                        </Button>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsHelpOpen(true)} title="Import Qo'llanmasi">
                        <HelpCircle className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Yangi Savol</Button>
                </div>
            </div>

            <div className="space-y-3">
                {questions.length === 0 && (
                    <p className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-xl">
                        Hozircha savollar yo'q. "Yangi Savol" tugmasi orqali qo'shing.
                    </p>
                )}
                {questions.map((q) => (
                    <Card key={q.id} className="group hover:border-primary transition-colors">
                        <CardContent className="p-4 flex items-start gap-4">
                            <div className="mt-1 cursor-grab text-muted-foreground"><GripVertical className="w-5 h-5" /></div>
                            <div className="flex-grow space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg bg-muted px-2 rounded">#{q.order}</span>
                                    <span className="font-semibold text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{q.type}</span>
                                    <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">{q.points} Ball</span>
                                    {q.time_limit > 0 && <span className="text-sm flex items-center gap-1"><Clock className="w-3 h-3" /> {q.time_limit}s</span>}
                                </div>
                                <p className="text-foreground line-clamp-2">{q.text}</p>
                                {q.type === 'MCQ' && (
                                    <p className="text-sm text-muted-foreground">
                                        To'g'ri javob: <span className="text-green-600 font-medium">{q.options?.[Number(q.correct_answer)] || q.correct_answer}</span>
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" onClick={() => openEdit(q)}><Edit2 className="w-4 h-4" /></Button>
                                <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(q.id!)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Question Editor Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingQ ? "Savolni Tahrirlash" : "Yangi Savol"}</DialogTitle>
                        <DialogDescription>
                            Olimpiada uchun savol ma'lumotlarini kiriting. * bilan belgilangan maydonlar majburiy.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-6 py-4">

                        <div className="flex gap-4">
                            <div className="flex-grow space-y-2">
                                <Label>Savol Matni</Label>
                                <Textarea
                                    value={qForm.text}
                                    onChange={(e) => setQForm({ ...qForm, text: e.target.value })}
                                    placeholder="Savol matnini kiriting..."
                                />
                            </div>
                            <div className="w-1/3 space-y-2">
                                <Label>Turi</Label>
                                <Select value={qForm.type} onValueChange={(val: Question["type"]) => setQForm({ ...qForm, type: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MCQ">Test (Variantli)</SelectItem>
                                        <SelectItem value="TEXT">Yozma Javob</SelectItem>
                                        <SelectItem value="NUMERIC">Raqamli Javob</SelectItem>
                                        <SelectItem value="CODE">Kod Yozish</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* MCQ Options */}
                        {qForm.type === "MCQ" && (
                            <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                                <Label>Variantlar <span className="text-xs text-muted-foreground">(To'g'ri javobni tanlang)</span></Label>
                                {qForm.options.map((opt, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Button
                                            size="icon"
                                            variant={qForm.correct_answer === String(idx) ? "default" : "outline"}
                                            className={qForm.correct_answer === String(idx) ? "bg-green-600 hover:bg-green-700" : ""}
                                            onClick={() => setQForm({ ...qForm, correct_answer: String(idx) })}
                                        >
                                            {String.fromCharCode(65 + idx)}
                                        </Button>
                                        <Input
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...qForm.options];
                                                newOpts[idx] = e.target.value;
                                                setQForm({ ...qForm, options: newOpts });
                                            }}
                                            placeholder={`${String.fromCharCode(65 + idx)} varianti`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Other Types Correct Answer */}
                        {qForm.type !== "MCQ" && qForm.type !== "CODE" && (
                            <div className="space-y-2">
                                <Label>To'g'ri Javob</Label>
                                <Input
                                    value={qForm.correct_answer}
                                    onChange={(e) => setQForm({ ...qForm, correct_answer: e.target.value })}
                                    placeholder={qForm.type === 'NUMERIC' ? "Masalan: 42" : "Kutilayotgan matn"}
                                />
                            </div>
                        )}

                        {/* Common Meta */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ball</Label>
                                <Input type="number" value={qForm.points} onChange={(e) => setQForm({ ...qForm, points: Number(e.target.value) })} />
                            </div>

                            {/* Hide Time if global time limit is set (fetched via context or prop logic) 
                                For now, we unfortunately don't have the full Olympiad object in this component easily without fetching.
                                But we can check our fetched questions list or just keep it simple.
                                
                                Wait, the user specifically asked: "hafsizlikda tasodifiy savollar belgilab qoyibman vaqtni ham... shunga qarab logika qilib ishlagin"
                                We need to know the Olympiad settings here.
                            */}

                            {/* We will fetch Olympiad details in Step4Questions to know settings */}
                        </div>

                        {/* Order & Time Conditional */}
                        {(olympiadSettings?.time_limit_per_question === 0) && (
                            <div className="space-y-2">
                                <Label>Vaqt (sekund)</Label>
                                <Input type="number" placeholder="0 = Cheklovsiz" value={qForm.time_limit} onChange={(e) => setQForm({ ...qForm, time_limit: Number(e.target.value) })} />
                            </div>
                        )}

                        {(!olympiadSettings?.is_random) && (
                            <div className="space-y-2">
                                <Label>Tartib (Order)</Label>
                                <Input type="number" value={qForm.order} onChange={(e) => setQForm({ ...qForm, order: Number(e.target.value) })} />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Izoh (Explanation)</Label>
                            <p className="text-xs text-muted-foreground">O'quvchi javob bergandan keyin ko'rsatiladigan tushuntirish.</p>
                            <Textarea
                                value={qForm.explanation}
                                onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                                placeholder="Javob nima uchun bundayligini tushuntiring..."
                            />
                        </div>

                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Bekor qilish</Button>
                        <Button onClick={handleSaveQuestion} disabled={loading}>{loading ? "Saqlanmoqda..." : "Saqlash"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Help Dialog */}
            <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            Savollarni Import Qilish Yo'riqnomasi
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="p-4 border rounded-lg bg-green-50/50">
                            <h3 className="font-semibold text-green-800 mb-2">Excel (.xlsx, .csv) formati</h3>
                            <ul className="list-disc list-inside text-sm space-y-1 text-green-900">
                                <li><strong>savol</strong>: Savol matni (majburiy)</li>
                                <li><strong>type</strong>: MCQ (Test), TEXT (Yozma), CODE (Kod)</li>
                                <li><strong>javob</strong>: To'g'ri javob matni</li>
                                <li><strong>a, b, c, d</strong>: Variantlar (Test uchun)</li>
                                <li><strong>points</strong>: Necha ball (standart: 1)</li>
                            </ul>
                            <div className="mt-3 pt-3 border-t border-green-200">
                                <a
                                    href="/samples/olympiad_questions_template.xlsx"
                                    download="Olimpiada_Namuna.xlsx"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 hover:underline"
                                >
                                    <Download className="w-4 h-4" />
                                    Namuna faylni yuklab olish (Python misolida)
                                </a>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-blue-50/50">
                            <h3 className="font-semibold text-blue-800 mb-2">Word (.docx) formati</h3>
                            <div className="text-sm space-y-2 text-blue-900">
                                <p>Har bir savol raqam bilan boshlanishi kerak.</p>
                                <div className="bg-white p-2 rounded border font-mono text-xs">
                                    1. O'zbekiston poytaxti qaysi shahar?<br />
                                    A) Samarqand<br />
                                    B) Toshkent<br />
                                    C) Buxoro<br />
                                    Javob: B
                                </div>
                                <p>Variantlar A), B) yoki A., B. kabi belgilanishi mumkin.</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsHelpOpen(false)}>Tushunarli</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Step4Questions;
