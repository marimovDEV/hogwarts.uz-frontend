import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Trash2,
    Save,
    X,
    MessageSquare,
    CheckCircle2,
    Clock,
    MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Question {
    id?: number;
    text: string;
    type: 'MCQ' | 'NUMERIC' | 'TEXT' | 'CODE';
    options: string[];
    correct_answer: string;
    points: number;
    time_limit: number;
    explanation: string;
}

interface QuizEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lessonId: number;
    lessonTitle: string;
}

const QuizEditor = ({ open, onOpenChange, lessonId, lessonTitle }: QuizEditorProps) => {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [minPassScore, setMinPassScore] = useState(70);
    const [isFinal, setIsFinal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchQuizData();
        }
    }, [open, lessonId]);

    const fetchQuizData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/lessons/${lessonId}/`, { headers: getAuthHeader() });
            const test = res.data.test;
            if (test) {
                setQuestions(test.questions || []);
                setMinPassScore(test.min_pass_score || 70);
                setIsFinal(test.is_final || false);
            } else {
                setQuestions([]);
                setMinPassScore(70);
                setIsFinal(false);
            }
        } catch (error) {
            console.error("Quiz fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            text: "",
            type: 'MCQ',
            options: ["", "", "", ""],
            correct_answer: "0",
            points: 10,
            time_limit: 0,
            explanation: ""
        };
        setQuestions([...questions, newQuestion]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                test: {
                    min_pass_score: minPassScore,
                    is_final: isFinal,
                    questions: questions.map((q, i) => ({
                        ...q,
                        order: i + 1,
                        options: q.options.filter(o => o.trim() !== "") // Clean empty options
                    }))
                }
            };
            await axios.patch(`${API_URL}/lessons/${lessonId}/`, payload, { headers: getAuthHeader() });
            toast.success(t('admin.quizSaved') || "Test saqlandi");
            onOpenChange(false);
        } catch (error) {
            toast.error(t('admin.curriculum.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 rounded-[3rem] overflow-hidden border-none shadow-2xl">
                <div className="bg-card p-8 border-b border-border flex justify-between items-center">
                    <div>
                        <DialogTitle className="text-3xl font-black">{t('admin.quizEditor') || "Test muharriri"}</DialogTitle>
                        <p className="text-muted-foreground font-medium mt-1">{lessonTitle}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{t('admin.curriculum.isFinalExam')}</label>
                                <p className="text-[9px] text-blue-400 font-bold max-w-[120px] leading-tight mt-0.5">{t('admin.curriculum.isFinalExamDesc')}</p>
                            </div>
                            <Switch
                                checked={isFinal}
                                onCheckedChange={setIsFinal}
                            />
                        </div>
                        <div className="flex items-center gap-4 bg-muted/50 px-6 py-3 rounded-2xl border border-border">
                            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">{t('admin.passScore') || "O'tish bali"} (%)</label>
                            <Input
                                type="number"
                                value={minPassScore}
                                onChange={(e) => setMinPassScore(parseInt(e.target.value))}
                                className="w-16 h-8 bg-background border-none text-center font-bold"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-muted/20">
                    {questions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm space-y-6 group/q animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-lg shadow-primary/20">
                                        {qIdx + 1}
                                    </div>
                                    <Badge variant="outline" className="h-8 rounded-full border-primary/20 text-primary font-bold">
                                        MCQ (Ko'p variantli)
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleRemoveQuestion(qIdx)}>
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">{t('admin.questionText') || "Savol matni"}</label>
                                <Textarea
                                    value={q.text}
                                    onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)}
                                    placeholder="Masalan: 2+2 nechaga teng?"
                                    className="rounded-2xl bg-background border-none shadow-inner p-4 font-bold text-lg resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {q.options.map((option, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-3 group/opt">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border-2 ${q.correct_answer === oIdx.toString()
                                                ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
                                                : 'bg-background border-border text-muted-foreground hover:border-primary/30'
                                                }`}
                                            onClick={() => handleQuestionChange(qIdx, 'correct_answer', oIdx.toString())}
                                        >
                                            {String.fromCharCode(65 + oIdx)}
                                        </div>
                                        <Input
                                            value={option}
                                            onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                            placeholder={`Variant ${String.fromCharCode(65 + oIdx)}`}
                                            className="h-12 rounded-xl bg-background border-none shadow-sm font-medium"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-border grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">{t('admin.explanation') || "Tushuntirish (Ixtiyoriy)"}</label>
                                    <Input
                                        value={q.explanation}
                                        onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                                        placeholder="To'g'ri javob sababi..."
                                        className="h-12 rounded-xl bg-background border-none shadow-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">{t('admin.points') || "Ball"}</label>
                                        <Input
                                            type="number"
                                            value={q.points}
                                            onChange={(e) => handleQuestionChange(qIdx, 'points', parseInt(e.target.value))}
                                            className="h-12 rounded-xl bg-background border-none shadow-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">{t('admin.timeLimit') || "Vaqt (sekund)"}</label>
                                        <Input
                                            type="number"
                                            value={q.time_limit}
                                            onChange={(e) => handleQuestionChange(qIdx, 'time_limit', parseInt(e.target.value))}
                                            placeholder="0 = vaqt cheksiz"
                                            className="h-12 rounded-xl bg-background border-none shadow-sm font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        className="w-full h-20 rounded-[2rem] border-dashed border-2 bg-background/50 hover:bg-primary/5 hover:border-primary/40 transition-all group"
                        onClick={handleAddQuestion}
                    >
                        <Plus className="w-6 h-6 mr-3 text-primary group-hover:scale-125 transition-transform" />
                        <span className="text-lg font-black">{t('admin.addQuestion') || "Yangi savol qo'shish"}</span>
                    </Button>
                </div>

                <div className="bg-muted/50 p-8 flex gap-4">
                    <Button variant="ghost" className="h-14 flex-1 rounded-2xl font-bold" onClick={() => onOpenChange(false)}>
                        {t('admin.cancel')}
                    </Button>
                    <Button className="h-14 flex-[2] rounded-2xl font-black shadow-xl shadow-primary/20" onClick={handleSave} disabled={loading}>
                        <Save className="w-5 h-5 mr-3" /> {t('admin.saveQuiz') || "Testni saqlash"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuizEditor;
