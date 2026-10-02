import { useState, useEffect } from "react";
import {
    Plus, Edit2, Trash2, MessageSquare, ExternalLink,
    CheckCircle, XCircle, Search, ThumbsUp, ThumbsDown,
    ArrowRight, Sparkles, MessageCircle, BarChart3, TestTube2,
    Calendar, User, HelpCircle, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import AIAssistant from "@/components/support/AIAssistant";
import { format } from "date-fns";
import { useTranslation } from 'react-i18next';

interface AIAssistantFAQ {
    id: number;
    question_uz: string;
    question_ru: string;
    answer_uz: string;
    answer_ru: string;
    category: string;
    action_label_uz: string | null;
    action_label_ru: string | null;
    action_link: string | null;
    order: number;
    priority: number;
    search_tags: string;
    is_active: boolean;
}

interface UnansweredQuery {
    id: number;
    question: string;
    context_url: string;
    created_at: string;
    is_resolved: boolean;
}

const AdminAIAssistantPage = () => {
    const { t } = useTranslation();
    const [faqs, setFaqs] = useState<AIAssistantFAQ[]>([]);
    const [unanswered, setUnanswered] = useState<UnansweredQuery[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Create/Edit State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<AIAssistantFAQ | null>(null);
    const [pendingUnansweredId, setPendingUnansweredId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        question_uz: "",
        question_ru: "",
        answer_uz: "",
        answer_ru: "",
        category: "GENERAL",
        action_label_uz: "",
        action_label_ru: "",
        action_link: "",
        priority: 0,
        search_tags: "",
        order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = getAuthHeader();
            const [faqsRes, unansweredRes] = await Promise.all([
                axios.get(`${API_URL}/ai-assistant-faq/`, { headers }),
                axios.get(`${API_URL}/ai-unanswered/`, { headers })
            ]);
            setFaqs(faqsRes.data.results || faqsRes.data);
            setUnanswered(unansweredRes.data.results || unansweredRes.data);
        } catch (error) {
            console.error(error);
            toast.error(t('admin.ai.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (faq?: AIAssistantFAQ | UnansweredQuery) => {
        if (faq && 'question_uz' in faq) {
            // Editing FAQ
            setEditingFaq(faq);
            setFormData({
                question_uz: faq.question_uz,
                question_ru: faq.question_ru,
                answer_uz: faq.answer_uz,
                answer_ru: faq.answer_ru,
                category: faq.category,
                action_label_uz: faq.action_label_uz || "",
                action_label_ru: faq.action_label_ru || "",
                action_link: faq.action_link || "",
                priority: faq.priority || 0,
                search_tags: faq.search_tags || "",
                order: faq.order,
                is_active: faq.is_active
            });
            setPendingUnansweredId(null);
        } else if (faq && 'question' in faq) {
            // Converting Unanswered to FAQ
            setEditingFaq(null);
            setFormData({
                question_uz: faq.question,
                question_ru: "",
                answer_uz: "",
                answer_ru: "",
                category: faq.context_url?.includes('course') ? "COURSES" : "GENERAL",
                action_label_uz: "",
                action_label_ru: "",
                action_link: "",
                priority: 1,
                search_tags: "",
                order: faqs.length,
                is_active: true
            });
            setPendingUnansweredId(faq.id);
        } else {
            // New FAQ
            setEditingFaq(null);
            setFormData({
                question_uz: "",
                question_ru: "",
                answer_uz: "",
                answer_ru: "",
                category: "GENERAL",
                action_label_uz: "",
                action_label_ru: "",
                action_link: "",
                priority: 0,
                search_tags: "",
                order: faqs.length,
                is_active: true
            });
            setPendingUnansweredId(null);
        }
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.question_uz || !formData.answer_uz) {
            toast.error(t('admin.ai.fillRequired'));
            return;
        }

        try {
            const headers = getAuthHeader();
            if (editingFaq) {
                await axios.put(`${API_URL}/ai-assistant-faq/${editingFaq.id}/`, formData, { headers });
                toast.success(t('admin.ai.editSuccess'));
            } else {
                await axios.post(`${API_URL}/ai-assistant-faq/`, formData, { headers });

                // If it was from an unanswered query, resolve it
                if (pendingUnansweredId) {
                    await axios.patch(`${API_URL}/ai-unanswered/${pendingUnansweredId}/`, { is_resolved: true }, { headers });
                }

                toast.success(t('admin.ai.addSuccess'));
            }
            fetchData();
            setDialogOpen(false);
        } catch (error) {
            toast.error(t('admin.ai.saveError'));
        }
    };

    const handleResolveUnanswered = async (id: number) => {
        try {
            await axios.patch(`${API_URL}/ai-unanswered/${id}/`, { is_resolved: true }, { headers: getAuthHeader() });
            toast.success(t('admin.ai.close'));
            fetchData();
        } catch (error) {
            toast.error(t('admin.ai.error'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('global.confirmDelete'))) return;
        try {
            await axios.delete(`${API_URL}/ai-assistant-faq/${id}/`, { headers: getAuthHeader() });
            toast.success(t('admin.delete'));
            fetchData();
        } catch (error) {
            toast.error(t('admin.ai.deleteError'));
        }
    };

    const filteredFaqs = faqs.filter(f => {
        const matchesCategory = categoryFilter === "ALL" || f.category === categoryFilter;
        const matchesSearch = f.question_uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.search_tags?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                        {t('admin.ai.controlCenter')}
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none">v2.0 PRO</Badge>
                    </h1>
                    <p className="text-muted-foreground">{t('admin.ai.analyticsSubtitle')}</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 h-10 shadow-lg shadow-indigo-500/20" onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('admin.ai.newKnowledge')}
                </Button>
            </div>

            <main className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3">
                    <Tabs defaultValue="knowledge" className="w-full">
                        <TabsList className="bg-muted/50 p-1 mb-6">
                            <TabsTrigger value="knowledge" className="gap-2">
                                <MessageCircle className="w-4 h-4" /> {t('admin.ai.knowledgeBase')}
                            </TabsTrigger>
                            <TabsTrigger value="unanswered" className="gap-2">
                                <HelpCircle className="w-4 h-4" />
                                {t('admin.ai.unansweredQuestions')}
                                {unanswered.filter(u => !u.is_resolved).length > 0 && (
                                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                        {unanswered.filter(u => !u.is_resolved).length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="gap-2">
                                <BarChart3 className="w-4 h-4" /> {t('admin.ai.analytics')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="knowledge" className="space-y-4">
                            <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('admin.ai.searchPlaceholder')}
                                        className="pl-10 h-10 bg-muted/30 border-border"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[180px] h-10">
                                        <SelectValue placeholder={t('admin.ai.category')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">{t('admin.ai.allCategories')}</SelectItem>
                                        <SelectItem value="GENERAL">{t('admin.ai.categoryGeneral')}</SelectItem>
                                        <SelectItem value="COURSES">{t('admin.ai.categoryCourses')}</SelectItem>
                                        <SelectItem value="OLYMPIADS">{t('admin.ai.categoryOlympiads')}</SelectItem>
                                        <SelectItem value="PAYMENTS">{t('admin.ai.categoryPayments')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-[80px]">{t('admin.ai.priority')}</TableHead>
                                                <TableHead>{t('admin.ai.questionAnswer')}</TableHead>
                                                <TableHead>{t('admin.ai.category')}</TableHead>
                                                <TableHead>{t('admin.ai.status')}</TableHead>
                                                <TableHead className="text-right">{t('admin.ai.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></TableCell></TableRow>
                                            ) : filteredFaqs.length === 0 ? (
                                                <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">{t('admin.ai.noResults')}</TableCell></TableRow>
                                            ) : filteredFaqs.map((faq) => (
                                                <TableRow key={faq.id} className="group hover:bg-indigo-50/30 transition-colors">
                                                    <TableCell>
                                                        <Badge variant="secondary" className="font-mono">{faq.priority}</Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-md">
                                                        <div className="font-bold text-foreground">{faq.question_uz}</div>
                                                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{faq.answer_uz}</div>
                                                        {faq.search_tags && (
                                                            <div className="flex gap-1 mt-2">
                                                                {faq.search_tags.split(',').map(t => (
                                                                    <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t.trim()}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">{faq.category.toLowerCase()}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {faq.is_active ?
                                                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {t('admin.ai.active')}
                                                            </div> :
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> {t('admin.ai.inactive')}
                                                            </div>
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleOpenDialog(faq)}>
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(faq.id)}>
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="unanswered" className="space-y-4">
                            <Card className="border-indigo-100 bg-indigo-50/20">
                                <CardHeader>
                                    <CardTitle className="text-lg">{t('admin.ai.unansweredTitle')}</CardTitle>
                                    <CardDescription>{t('admin.ai.unansweredDesc')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {unanswered.filter(u => !u.is_resolved).map(q => (
                                            <div key={q.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-indigo-100/20 shadow-sm transition-all hover:shadow-md">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-indigo-900">"{q.question}"</div>
                                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(q.created_at), 'dd.MM HH:mm')}</span>
                                                        <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {q.context_url || t('admin.ai.unknownPage')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-green-600 h-8" onClick={() => handleResolveUnanswered(q.id)}>
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        {t('admin.ai.close')}
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 h-8" onClick={() => handleOpenDialog(q)}>
                                                        {t('admin.ai.addToFaq')}
                                                        <ArrowRight className="w-3 h-3 ml-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {unanswered.filter(u => !u.is_resolved).length === 0 && (
                                            <div className="text-center py-12 text-muted-foreground bg-white rounded-xl border border-dashed">
                                                {t('admin.ai.allResolved')}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-none">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-white/20 rounded-lg"><MessageCircle className="w-6 h-6" /></div>
                                            <Badge className="bg-white/20 text-white border-none">Bugun</Badge>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-3xl font-black">128</h3>
                                            <p className="text-indigo-100 text-xs mt-1">{t('admin.ai.totalConversations')}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-white/20 rounded-lg"><ThumbsUp className="w-6 h-6" /></div>
                                            <Badge className="bg-white/20 text-white border-none">+12%</Badge>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-3xl font-black">94%</h3>
                                            <p className="text-green-500 text-xs mt-1">{t('admin.ai.positiveRating')}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-orange-500 to-rose-600 text-white border-none">
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-white/20 rounded-lg"><HelpCircle className="w-6 h-6" /></div>
                                            <span className="text-xs">{t('admin.ai.actionRequired')}</span>
                                        </div>
                                        <div className="mt-4">
                                            <h3 className="text-3xl font-black">{unanswered.filter(u => !u.is_resolved).length}</h3>
                                            <p className="text-orange-100 text-xs mt-1">{t('admin.ai.unansweredQuestions')}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="mt-8 border-none shadow-sm overflow-hidden bg-card">
                                <CardHeader className="bg-muted/20">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-orange-500" />
                                        {t('admin.ai.popularTopics')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {[
                                            { t: "Kurslarni sotib olish", c: 45, r: 98 },
                                            { t: "Olimpiada natijalari", c: 32, r: 85 },
                                            { t: "Sertifikat olish", c: 28, r: 92 },
                                            { t: "Parolni tiklash", c: 15, r: 70 },
                                        ].map((item, i) => (
                                            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-muted/10">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-black text-muted/30">#0{i + 1}</span>
                                                    <span className="font-medium text-foreground">{item.t}</span>
                                                </div>
                                                <div className="flex items-center gap-8 text-sm">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold">{item.c} ta</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">{t('admin.ai.conversation')}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className={`font-bold ${item.r > 80 ? 'text-green-500' : 'text-orange-500'}`}>{item.r}%</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">{t('admin.ai.rating')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="xl:col-span-1 space-y-6">
                    <Card className="border-none shadow-2xl overflow-hidden sticky top-6">
                        <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white pb-6">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TestTube2 className="w-5 h-5" />
                                {t('admin.ai.testPlayground')}
                            </CardTitle>
                            <CardDescription className="text-indigo-100 text-xs">
                                {t('admin.ai.testPlaygroundDesc')}
                            </CardDescription>
                        </CardHeader>
                        <div className="h-[600px] border-l border-r border-b">
                            <AIAssistant onTalkToAdmin={() => toast.info(t('admin.ai.testModeAdminNotice'))} />
                        </div>
                    </Card>
                </div>
            </main>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl px-6 py-8">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-black">{editingFaq ? t('admin.ai.editKnowledge') : t('admin.ai.addKnowledge')}</DialogTitle>
                        <DialogDescription className="sr-only">
                            AI yordamchisi uchun bilimlar bazasini tahrirlash yoki yangi ma'lumot qo'shish formasi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.ai.questionUz')} *</Label>
                                <Input
                                    value={formData.question_uz}
                                    onChange={e => setFormData({ ...formData, question_uz: e.target.value })}
                                    className="bg-muted/30 focus:bg-card transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.ai.questionRu')}</Label>
                                <Input
                                    value={formData.question_ru}
                                    onChange={e => setFormData({ ...formData, question_ru: e.target.value })}
                                    className="bg-muted/30 focus:bg-card transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.ai.answerUz')} *</Label>
                                <Textarea
                                    rows={4}
                                    value={formData.answer_uz}
                                    onChange={e => setFormData({ ...formData, answer_uz: e.target.value })}
                                    className="bg-muted/30 focus:bg-card transition-colors min-h-[120px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.ai.answerRu')}</Label>
                                <Textarea
                                    rows={4}
                                    value={formData.answer_ru}
                                    onChange={e => setFormData({ ...formData, answer_ru: e.target.value })}
                                    className="bg-muted/30 focus:bg-card transition-colors min-h-[120px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.ai.category')}</Label>
                                <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger className="bg-muted/30">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GENERAL">{t('admin.ai.categoryGeneral')}</SelectItem>
                                        <SelectItem value="COURSES">{t('admin.ai.categoryCourses')}</SelectItem>
                                        <SelectItem value="OLYMPIADS">{t('admin.ai.categoryOlympiads')}</SelectItem>
                                        <SelectItem value="PAYMENTS">{t('admin.ai.categoryPayments')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.ai.priority')} (0-100)</Label>
                                <Input
                                    type="number"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                    className="bg-muted/30"
                                />
                                <p className="text-[10px] text-muted-foreground italic">{t('admin.ai.priorityHint')}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.ai.searchTags')}</Label>
                                <Input
                                    value={formData.search_tags}
                                    onChange={e => setFormData({ ...formData, search_tags: e.target.value })}
                                    placeholder={t('admin.ai.searchTagsPlaceholder')}
                                    className="bg-muted/30"
                                />
                            </div>
                            <div className="space-y-2 pt-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.ai.actionButton')}</Label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <Input placeholder={t('admin.ai.actionLabelPlaceholder')} value={formData.action_label_uz} onChange={e => setFormData({ ...formData, action_label_uz: e.target.value })} className="h-8 text-xs bg-muted/30" />
                                    <Input placeholder="Link" value={formData.action_link} onChange={e => setFormData({ ...formData, action_link: e.target.value })} className="h-8 text-xs bg-muted/30" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">{t('admin.ai.order')}</Label>
                                    <Input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="h-8 text-xs" />
                                </div>
                                <div className="flex flex-col justify-end pb-1.5 pl-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={formData.is_active} onCheckedChange={v => setFormData({ ...formData, is_active: v })} />
                                        <Label className="text-xs font-bold">{t('admin.ai.active')}</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-6 gap-2">
                        <Button variant="ghost" className="hover:bg-muted/50" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
                        <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-200 transition-all font-bold px-8" onClick={handleSubmit}>
                            {t('admin.ai.saveChanges')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAIAssistantPage;
