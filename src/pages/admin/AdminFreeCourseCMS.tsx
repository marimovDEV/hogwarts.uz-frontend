import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { homepageService, FreeCourseSection } from "@/services/homepageService";
import { Save, Plus, Edit2, Trash2 } from "lucide-react";

const AdminFreeCourseCMS = () => {
    const { t } = useTranslation();
    const [sections, setSections] = useState<FreeCourseSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<FreeCourseSection | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const [formData, setFormData] = useState({
        title_uz: "MUTLAQO BEPUL",
        title_ru: "АБСОЛЮТНО БЕСПЛАТНО",
        subtitle_uz: "O'rganishni hoziroq boshlang",
        subtitle_ru: "Начните учиться прямо сейчас",
        description_uz: "Hech qanday to'lovsiz, ro'yxatdan o'tmasdan ham ko'rishingiz mumkin bo'lgan darslar.",
        description_ru: "Уроки, которые вы можете посмотреть без какой-либо оплаты, даже без регистрации.",
        button_text_uz: "Barcha bepul darslar",
        button_text_ru: "Все бесплатные уроки",
        button_link: "/courses?filter=free",
        is_active: true,
        show_on_homepage: true,
        order: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await homepageService.getFreeCourseSection();
            setSections(Array.isArray(res) ? res : res.results || []);
        } catch (error) {
            console.error(error);
            toast.error(t('admin.loadDataError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async () => {
        try {
            if (editingSection) {
                await homepageService.updateFreeCourseSection(editingSection.id, formData);
                toast.success(t('admin.updated'));
            } else {
                await homepageService.createFreeCourseSection(formData);
                toast.success(t('admin.created'));
            }
            fetchData();
            resetForm();
        } catch (error) {
            toast.error(t('admin.errorOccurred'));
        }
    };

    const handleEdit = (section: FreeCourseSection) => {
        setEditingSection(section);
        setFormData(section);
        setIsCreating(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.deleteConfirm'))) return;
        try {
            await homepageService.deleteFreeCourseSection(id);
            toast.success(t('common.deleted'));
            fetchData();
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const resetForm = () => {
        setFormData({
            title_uz: "MUTLAQO BEPUL",
            title_ru: "АБСОЛЮТНО БЕСПЛАТНО",
            subtitle_uz: "O'rganishni hoziroq boshlang",
            subtitle_ru: "Начните учиться прямо сейчас",
            description_uz: "Hech qanday to'lovsiz, ro'yxatdan o'tmasdan ham ko'rishingiz mumkin bo'lgan darslar.",
            description_ru: "Уроки, которые вы можете посмотреть без какой-либо оплаты, даже без регистрации.",
            button_text_uz: "Barcha bepul darslar",
            button_text_ru: "Все бесплатные уроки",
            button_link: "/courses?filter=free",
            is_active: true,
            show_on_homepage: true,
            order: 0
        });
        setEditingSection(null);
        setIsCreating(false);
    };

    if (loading) return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">{t('admin.freeCourseSection', 'Bepul Kurslar Bo\'limi')}</h2>
                    <p className="text-muted-foreground text-sm">{t('admin.freeCourseSectionDesc', 'Bosh sahifadagi bepul kurslar bo\'limini boshqaring')}</p>
                    <p className="text-xs text-muted-foreground mt-1">💡 {t('admin.freeCourseHint', 'Bepul kurslar avtomatik ravishda price=0 bo\'lgan kurslardan olinadi')}</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "outline" : "default"}>
                    {isCreating ? t('common.cancel') : <><Plus className="w-4 h-4 mr-2" /> {t('admin.addNew')}</>}
                </Button>
            </div>

            {/* Create/Edit Form */}
            {isCreating && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingSection ? t('admin.edit') : t('admin.create')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('admin.titleUz', 'Sarlavha (UZ)')}</Label>
                                <Input value={formData.title_uz} onChange={(e) => setFormData({ ...formData, title_uz: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.titleRu', 'Sarlavha (RU)')}</Label>
                                <Input value={formData.title_ru} onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('admin.subtitleUz', 'Kichik sarlavha (UZ)')}</Label>
                                <Input value={formData.subtitle_uz} onChange={(e) => setFormData({ ...formData, subtitle_uz: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.subtitleRu', 'Kichik sarlavha (RU)')}</Label>
                                <Input value={formData.subtitle_ru} onChange={(e) => setFormData({ ...formData, subtitle_ru: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('admin.descriptionUz', 'Tavsif (UZ)')}</Label>
                                <Textarea value={formData.description_uz} onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })} rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.descriptionRu', 'Tavsif (RU)')}</Label>
                                <Textarea value={formData.description_ru} onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })} rows={3} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('admin.buttonTextUz', 'Tugma matni (UZ)')}</Label>
                                <Input value={formData.button_text_uz} onChange={(e) => setFormData({ ...formData, button_text_uz: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.buttonTextRu', 'Tugma matni (RU)')}</Label>
                                <Input value={formData.button_text_ru} onChange={(e) => setFormData({ ...formData, button_text_ru: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('admin.buttonLink', 'Tugma havolasi')}</Label>
                            <Input value={formData.button_link} onChange={(e) => setFormData({ ...formData, button_link: e.target.value })} placeholder="/courses?filter=free" />
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                                <Label>{t('admin.isActive', 'Faol')}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={formData.show_on_homepage} onCheckedChange={(checked) => setFormData({ ...formData, show_on_homepage: checked })} />
                                <Label>{t('admin.showOnHomepage', 'Bosh sahifada ko\'rsatish')}</Label>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.order', 'Tartib')}</Label>
                                <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} className="w-20" />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleSubmit} className="flex-1">
                                <Save className="w-4 h-4 mr-2" />
                                {editingSection ? t('admin.update') : t('admin.create')}
                            </Button>
                            <Button onClick={resetForm} variant="outline">
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List */}
            <div className="grid gap-4">
                {sections.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            {t('admin.noData', 'Ma\'lumot yo\'q')}
                        </CardContent>
                    </Card>
                ) : (
                    sections.map((section) => (
                        <Card key={section.id} className={!section.is_active ? 'opacity-50' : ''}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold">{section.title_uz} / {section.title_ru}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{section.subtitle_uz}</p>
                                        <p className="text-sm mt-2">{section.description_uz}</p>
                                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                            <span>Tugma: {section.button_text_uz}</span>
                                            <span>Havola: {section.button_link}</span>
                                            <span>Tartib: {section.order}</span>
                                            {section.is_active && <span className="text-green-600">✓ Faol</span>}
                                            {section.show_on_homepage && <span className="text-blue-600">✓ Bosh sahifada</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(section)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(section.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminFreeCourseCMS;
