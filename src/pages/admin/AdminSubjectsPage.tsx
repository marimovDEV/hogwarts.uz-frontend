import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Zap, Trophy, BookOpen, Eye, EyeOff, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import * as Icons from "lucide-react";

interface Subject {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    xp_reward: number;
    is_featured: boolean;
    is_active: boolean;
    order: number;
    courses_count: number;
    olympiads_count: number;
    professions_count: number;
}

const AdminSubjectsPage = () => {
    const { t } = useTranslation();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Create/Edit State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        icon: "BookOpen",
        color: "bg-blue-600",
        xp_reward: 50,
        is_featured: true,
        is_active: true,
        order: 0
    });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`${API_URL}/subjects/`, { headers: getAuthHeader() });
            setSubjects(res.data.results || res.data);
        } catch (error) {
            console.error(error);
            toast.error(t('admin.loadSubjectsError'));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (subject?: Subject) => {
        if (subject) {
            setEditingSubject(subject);
            setFormData({
                name: subject.name,
                slug: subject.slug,
                description: subject.description,
                icon: subject.icon,
                color: subject.color,
                xp_reward: subject.xp_reward,
                is_featured: subject.is_featured,
                is_active: subject.is_active,
                order: subject.order
            });
        } else {
            setEditingSubject(null);
            setFormData({
                name: "",
                slug: "",
                description: "",
                icon: "BookOpen",
                color: "bg-blue-600",
                xp_reward: 50,
                is_featured: true,
                is_active: true,
                order: 0
            });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error(t('admin.subjectNameRequired'));
            return;
        }

        try {
            if (editingSubject) {
                await axios.put(`${API_URL}/subjects/${editingSubject.id}/`, formData, { headers: getAuthHeader() });
                toast.success(t('admin.subjectUpdated'));
            } else {
                await axios.post(`${API_URL}/subjects/`, formData, { headers: getAuthHeader() });
                toast.success(t('admin.subjectCreated'));
            }

            setDialogOpen(false);
            fetchSubjects();
        } catch (error) {
            console.error(error);
            toast.error(t('admin.errorOccurred'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.deleteSubjectConfirm'))) return;
        try {
            await axios.delete(`${API_URL}/subjects/${id}/`, { headers: getAuthHeader() });
            toast.success(t('admin.subjectDeleted'));
            fetchSubjects();
        } catch (error) {
            toast.error(t('admin.deleteSubjectError'));
        }
    };

    // Helper to render dynamic icon
    const renderIcon = (iconName: string, className = "w-4 h-4") => {
        const Icon = (Icons as any)[iconName] || Icons.BookOpen;
        return <Icon className={className} />;
    };

    // Filter
    const filtered = subjects.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t('admin.subjects')}</h1>
                    <p className="text-muted-foreground">{t('admin.subjectsSubtitle')}</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => handleOpenDialog()}>
                            <Plus className="w-4 h-4" />
                            {t('admin.addSubject')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingSubject ? t('admin.editSubject') : t('admin.newSubject')}</DialogTitle>
                            <DialogDescription className="sr-only">
                                {editingSubject ? "Edit subject details" : "Create a new subject"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>{t('admin.name')}</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t('admin.subjectPlaceholder')} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.description')}</Label>
                                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t('admin.descriptionPlaceholder')} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('admin.iconLucideName')}</Label>
                                    <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder={t('admin.iconPlaceholder')} />
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        {t('admin.preview')}: {renderIcon(formData.icon)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('admin.colorTailwind')}</Label>
                                    <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder={t('admin.colorPlaceholder')} />
                                    <div className={`mt-1 h-4 w-full rounded ${formData.color.split(' ')[0]}`}></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('admin.xpReward')}</Label>
                                    <Input type="number" value={formData.xp_reward} onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('admin.orderNumber')}</Label>
                                    <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>{t('admin.showOnHome')}</Label>
                                <Switch checked={formData.is_featured} onCheckedChange={(c) => setFormData({ ...formData, is_featured: c })} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>{t('admin.activeStatus')}</Label>
                                    <p className="text-xs text-muted-foreground">{t('admin.activeStatusSubtitle')}</p>
                                </div>
                                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                            </div>

                            {editingSubject && (
                                <div className="p-3 bg-muted rounded-lg text-sm">
                                    <span className="text-muted-foreground">{t('admin.urlSlug')}: </span>
                                    <code className="font-mono">/subject/{formData.slug || editingSubject.slug}</code>
                                </div>
                            )}

                            <Button onClick={handleSubmit} className="w-full">{t('admin.save')}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((subject) => (
                    <Card key={subject.id} className={`hover:shadow-lg transition-shadow overflow-hidden ${!subject.is_active ? 'opacity-60' : ''}`}>
                        <div className={`h-2 ${subject.color}`}></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className={`w-10 h-10 rounded-lg ${subject.color} flex items-center justify-center text-white shadow-md`}>
                                {renderIcon(subject.icon, "w-6 h-6")}
                            </div>
                            <div className="flex gap-1">
                                {!subject.is_active && (
                                    <Badge variant="outline" className="text-xs gap-1">
                                        <EyeOff className="w-3 h-3" /> {t('admin.hidden')}
                                    </Badge>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenDialog(subject)}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(subject.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-xl mb-1">{subject.name}</CardTitle>
                            <CardDescription className="line-clamp-2 h-10 text-xs mb-4">
                                {subject.description || <span className="italic text-muted-foreground/50">{t('admin.noDescription')}</span>}
                            </CardDescription>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                                <div className="bg-muted/50 rounded-lg py-2">
                                    <BookOpen className="w-4 h-4 mx-auto mb-1 text-primary" />
                                    <span className="font-bold">{subject.courses_count}</span>
                                    <p className="text-muted-foreground">{t('admin.course')}</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg py-2">
                                    <Trophy className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                                    <span className="font-bold">{subject.olympiads_count}</span>
                                    <p className="text-muted-foreground">{t('admin.olympiadShort')}</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg py-2">
                                    <GraduationCap className="w-4 h-4 mx-auto mb-1 text-green-500" />
                                    <span className="font-bold">{subject.professions_count}</span>
                                    <p className="text-muted-foreground">{t('admin.profession')}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                                <div className="flex items-center gap-1">
                                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                                    <span>{subject.xp_reward} XP</span>
                                </div>
                                {subject.is_featured && (
                                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminSubjectsPage;
