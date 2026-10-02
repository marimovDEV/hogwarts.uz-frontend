import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Search, Briefcase, Map, Star, GraduationCap, Layout, Trophy, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import * as Icons from "lucide-react";

interface Subject {
    id: number;
    name: string;
}

interface Profession {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    is_active: boolean;
    order: number;
    suitability: string;
    requirements: string;
    salary_range: string;
    learning_time: string;
    certification_info: string;
    career_opportunities: string;
    primary_subject: number | null;
    required_xp: number;
    roadmap_steps_count?: number;
    subjects_count?: number;
}

const AdminProfessionsPage = () => {
    const { t } = useTranslation();
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Create/Edit State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProfession, setEditingProfession] = useState<Profession | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        icon: "Briefcase",
        color: "bg-blue-600",
        is_active: true,
        order: 0,
        suitability: "",
        requirements: "",
        salary_range: "",
        learning_time: "",
        certification_info: "",
        career_opportunities: "",
        primary_subject: null as number | null,
        required_xp: 0
    });

    useEffect(() => {
        fetchProfessions();
        fetchSubjects();
    }, []);

    const fetchProfessions = async () => {
        try {
            const res = await axios.get(`${API_URL}/professions/`, { headers: getAuthHeader() });
            setProfessions(res.data.results || res.data);
        } catch (error) {
            console.error(error);
            toast.error(t('admin.loadProfessionsError'));
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`${API_URL}/subjects/`, { headers: getAuthHeader() });
            setSubjects(res.data.results || res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenDialog = (profession?: Profession) => {
        if (profession) {
            setEditingProfession(profession);
            setFormData({
                name: profession.name,
                description: profession.description,
                icon: profession.icon,
                color: profession.color,
                is_active: profession.is_active,
                order: profession.order,
                suitability: profession.suitability || "",
                requirements: profession.requirements || "",
                salary_range: profession.salary_range || "",
                learning_time: profession.learning_time || "",
                certification_info: profession.certification_info || "",
                career_opportunities: profession.career_opportunities || "",
                primary_subject: profession.primary_subject,
                required_xp: profession.required_xp || 0
            });
        } else {
            setEditingProfession(null);
            setFormData({
                name: "",
                description: "",
                icon: "Briefcase",
                color: "bg-blue-600",
                is_active: true,
                order: 0,
                suitability: "",
                requirements: "",
                salary_range: "",
                learning_time: "",
                certification_info: "",
                career_opportunities: "",
                primary_subject: null,
                required_xp: 0
            });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error(t('admin.professionNameRequired'));
            return;
        }

        try {
            if (editingProfession) {
                await axios.put(`${API_URL}/professions/${editingProfession.id}/`, formData, { headers: getAuthHeader() });
                toast.success(t('admin.professionUpdated'));
            } else {
                await axios.post(`${API_URL}/professions/`, formData, { headers: getAuthHeader() });
                toast.success(t('admin.professionCreated'));
            }

            setDialogOpen(false);
            fetchProfessions();
        } catch (error) {
            console.error(error);
            toast.error(t('admin.errorOccurred'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.deleteProfessionConfirm'))) return;
        try {
            await axios.delete(`${API_URL}/professions/${id}/`, { headers: getAuthHeader() });
            toast.success(t('admin.professionDeleted'));
            fetchProfessions();
        } catch (error) {
            toast.error(t('admin.deleteProfessionError'));
        }
    };

    // Helper to render dynamic icon
    const renderIcon = (iconName: string, className = "w-4 h-4") => {
        // @ts-ignore
        const Icon = Icons[iconName] || Icons.Briefcase;
        return <Icon className={className} />;
    };

    // Filter
    const filtered = professions.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-black tracking-tight">{t('admin.professions')}</h1>
                    <p className="text-muted-foreground">{t('admin.professionsSubtitle')}</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-xl font-bold" onClick={() => handleOpenDialog()}>
                            <Plus className="w-4 h-4" />
                            {t('admin.addProfession')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">{editingProfession ? t('admin.editProfession') : t('admin.newProfession')}</DialogTitle>
                            <DialogDescription>
                                Kasb ma'lumotlarini tahrirlash va Karyera Engine sozlamalarini o'rnatish.
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="general" className="w-full mt-4">
                            <TabsList className="grid w-full grid-cols-2 rounded-xl">
                                <TabsTrigger value="general" className="font-bold">Asosiy ma'lumotlar</TabsTrigger>
                                <TabsTrigger value="requirements" className="font-bold">Ecosystem & Talablar</TabsTrigger>
                            </TabsList>

                            <TabsContent value="general" className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="font-bold">{t('admin.name')}</Label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t('admin.professionPlaceholder')} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">{t('admin.description')}</Label>
                                    <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t('admin.descriptionPlaceholder')} className="rounded-xl" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold">{t('admin.iconLucideName')}</Label>
                                        <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder={t('admin.iconPlaceholderProfession')} className="rounded-xl" />
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            {t('admin.preview')}: {renderIcon(formData.icon)}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">{t('admin.colorTailwind')}</Label>
                                        <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder={t('admin.colorPlaceholder')} className="rounded-xl" />
                                        <div className={`mt-1 h-4 w-full rounded-full ${formData.color.split(' ')[0]}`}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold">{t('admin.salaryRange')}</Label>
                                        <Input value={formData.salary_range} onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })} placeholder={t('admin.salaryPlaceholder')} className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">{t('admin.learningTime')}</Label>
                                        <Input value={formData.learning_time} onChange={(e) => setFormData({ ...formData, learning_time: e.target.value })} placeholder={t('admin.learningTimePlaceholder')} className="rounded-xl" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-dashed border-border/50">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-bold">{t('admin.active')}</Label>
                                        <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label className="font-bold">{t('admin.order')}</Label>
                                        <Input type="number" className="w-20 rounded-lg text-foreground bg-background" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="requirements" className="space-y-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Layout className="w-5 h-5 text-primary" />
                                            <Label className="font-black text-lg">Asosiy Tizim Fani</Label>
                                        </div>
                                        <Select
                                            value={formData.primary_subject?.toString() || "none"}
                                            onValueChange={(v) => setFormData({ ...formData, primary_subject: v === "none" ? null : parseInt(v) })}
                                        >
                                            <SelectTrigger className="rounded-xl border-primary/20 bg-background text-foreground shadow-sm">
                                                <SelectValue placeholder="Fan tanlang" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tanlanmagan</SelectItem>
                                                {subjects.map(s => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[10px] text-slate-500 italic mt-2">Ushbu fan sahifasida ushbu kasb "Asosiy" bo'lib ko'rinadi</p>
                                    </div>

                                    <div className="space-y-2 p-6 bg-yellow-500/5 rounded-[2rem] border border-yellow-500/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-5 h-5 text-yellow-600" />
                                            <Label className="font-black text-lg">Kerakli XP (Bosqich)</Label>
                                        </div>
                                        <Input
                                            type="number"
                                            value={formData.required_xp}
                                            onChange={(e) => setFormData({ ...formData, required_xp: parseInt(e.target.value) || 0 })}
                                            className="rounded-xl border-yellow-500/20 bg-background shadow-sm font-black text-xl text-yellow-700 dark:text-yellow-500"
                                        />
                                        <p className="text-[10px] text-slate-500 italic mt-2">Kasbni to'liq ochish uchun talab etiladigan umumiy XP</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold">{t('admin.requirements')}</Label>
                                    <Input value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} placeholder={t('admin.requirementsPlaceholder')} className="rounded-xl" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-bold">{t('admin.certificationInfo')}</Label>
                                    <Input value={formData.certification_info} onChange={(e) => setFormData({ ...formData, certification_info: e.target.value })} placeholder={t('admin.certificationPlaceholder')} className="rounded-xl" />
                                </div>

                                <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Map className="w-6 h-6 text-primary" />
                                        <h3 className="text-xl font-black">Hogwords Karyera Tizimi</h3>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Kasb bosqichlari, vazifalar va XP iqtisodiyotini boshqarish uchun Karyera Quruvchi sahifasiga o'ting.
                                    </p>
                                    <Button
                                        variant="secondary"
                                        className="w-full rounded-xl font-bold bg-white/10 hover:bg-white/20 border-none text-white"
                                        disabled={!editingProfession?.id}
                                        onClick={() => {
                                            if (editingProfession?.id) {
                                                window.location.href = `/admin/professions/${editingProfession.id}/builder`;
                                            }
                                        }}
                                    >
                                        {!editingProfession?.id ? "Avval kasbni saqlang" : "Karyera Quruvchini ochish"}
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex gap-4 mt-6">
                            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 rounded-xl font-bold">Bekor qilish</Button>
                            <Button onClick={handleSubmit} className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20">{t('admin.save')}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((profession) => (
                    <Card key={profession.id} className="hover:shadow-lg transition-shadow overflow-hidden group">
                        <div className={`h-2 ${profession.color}`}></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className={`w-12 h-12 rounded-xl ${profession.color} flex items-center justify-center text-white shadow-md`}>
                                {renderIcon(profession.icon, "w-6 h-6")}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenDialog(profession)}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(profession.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-xl mb-2">{profession.name}</CardTitle>
                            <CardDescription className="line-clamp-2 h-10 text-xs mb-4">
                                {profession.description}
                            </CardDescription>

                            <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1" title={t('admin.requiredSubjects')}>
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        <span>{profession.subjects_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1" title={t('admin.roadmapSteps')}>
                                        <Map className="w-3.5 h-3.5" />
                                        <span>{profession.roadmap_steps_count || 0}</span>
                                    </div>
                                </div>
                                {profession.is_active ? (
                                    <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{t('admin.active')}</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px]">{t('admin.inactive')}</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminProfessionsPage;
