import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { homepageService, HomePageConfig, HomeStat, HomeStep, HomeAdvantage, Banner, Testimonial } from "@/services/homepageService";
import { Trash2, Plus, GripVertical, Save, Edit2, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import AdminFreeCourseCMS from "./AdminFreeCourseCMS";
import { getBaseUrl, getImageUrl } from "@/services/api";

const AdminHomeCMSPage = () => {
    const { t } = useTranslation();
    const [config, setConfig] = useState<HomePageConfig | null>(null);
    const [stats, setStats] = useState<HomeStat[]>([]);
    const [steps, setSteps] = useState<HomeStep[]>([]);

    const [advantages, setAdvantages] = useState<HomeAdvantage[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [confRes, statsRes, stepsRes, advRes] = await Promise.all([
                homepageService.getConfig(),
                homepageService.getStats(),
                homepageService.getSteps(),
                homepageService.getAdvantages(),
            ]);
            setConfig(confRes.config);
            setStats(Array.isArray(statsRes) ? statsRes : statsRes.results || []);
            setSteps(Array.isArray(stepsRes) ? stepsRes : stepsRes.results || []);
            setAdvantages(Array.isArray(advRes) ? advRes : advRes.results || []);

            // Fetch CMS Items
            const [banRes, testRes] = await Promise.all([
                homepageService.getBanners(),
                homepageService.getTestimonials()
            ]);
            setBanners(Array.isArray(banRes) ? banRes : banRes.results || []);
            setTestimonials(Array.isArray(testRes) ? testRes : testRes.results || []);

        } catch (error) {

            console.error(error);
            toast.error(t('admin.loadDataError'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateConfig = async () => {
        if (!config) return;
        try {
            await homepageService.updateConfig(config);
            toast.success(t('admin.settingsSaved'));
        } catch (error) {
            toast.error(t('admin.errorOccurred'));
        }
    };

    // Generic handlers could be used, but for clarity separate them
    const deleteStat = async (id: number) => {
        if (!confirm(t('common.deleteConfirm'))) return;
        try { await homepageService.deleteStat(id); fetchData(); toast.success(t('common.deleted')); } catch (e) { toast.error(t('common.error')); }
    };

    const deleteStep = async (id: number) => {
        if (!confirm(t('common.deleteConfirm'))) return;
        try { await homepageService.deleteStep(id); fetchData(); toast.success(t('common.deleted')); } catch (e) { toast.error(t('common.error')); }
    };

    const deleteAdvantage = async (id: number) => {
        if (!confirm(t('common.deleteConfirm'))) return;
        try { await homepageService.deleteAdvantage(id); fetchData(); toast.success(t('common.deleted')); } catch (e) { toast.error(t('common.error')); }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t('admin.homeCMS')}</h1>
            <p className="text-muted-foreground">{t('admin.homeCMSSubtitle')}</p>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-4 flex flex-wrap h-auto">
                    <TabsTrigger value="general">{t('admin.heroSection')}</TabsTrigger>
                    <TabsTrigger value="banners">{t('admin.banners')}</TabsTrigger>
                    <TabsTrigger value="stats">{t('admin.stats')}</TabsTrigger>
                    <TabsTrigger value="steps">{t('admin.showSteps')}</TabsTrigger>
                    <TabsTrigger value="advantages">{t('admin.advantages')}</TabsTrigger>
                    <TabsTrigger value="free-courses">{t('admin.freeCourses', 'Bepul Kurslar')}</TabsTrigger>
                    <TabsTrigger value="testimonials">{t('admin.testimonials')}</TabsTrigger>
                </TabsList>

                {/* GENERAL CONFIG */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin.heroSection')}</CardTitle>
                            <CardDescription>{t('admin.heroSectionSubtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {config && (
                                <>
                                    <div className="grid gap-2">
                                        <Label>{t('admin.heroTitleLabel')}</Label>
                                        <Input value={config.hero_title} onChange={(e) => setConfig({ ...config, hero_title: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>{t('admin.heroSubtitleLabel')}</Label>
                                        <Textarea value={config.hero_subtitle} onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>{t('admin.buttonText')}</Label>
                                            <Input value={config.hero_button_text} onChange={(e) => setConfig({ ...config, hero_button_text: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label>{t('admin.buttonLink')}</Label>
                                            <Input value={config.hero_button_link} onChange={(e) => setConfig({ ...config, hero_button_link: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t mt-4">
                                        <h3 className="text-lg font-semibold mb-4">{t('admin.ctaSection')}</h3>
                                        <div className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label>{t('common.title')}</Label>
                                                <Input value={config.cta_title} onChange={(e) => setConfig({ ...config, cta_title: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>{t('common.description')}</Label>
                                                <Input value={config.cta_subtitle} onChange={(e) => setConfig({ ...config, cta_subtitle: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t mt-4">
                                        <h3 className="text-lg font-semibold mb-4">{t('admin.teaserSection', 'Teaser bo\'limi (Tez kunda)')}</h3>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>{t('common.titleUz', 'Sarlavha (UZ)')}</Label>
                                                    <Input value={config.teaser_title_uz} onChange={(e) => setConfig({ ...config, teaser_title_uz: e.target.value })} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>{t('common.titleRu', 'Sarlavha (RU)')}</Label>
                                                    <Input value={config.teaser_title_ru} onChange={(e) => setConfig({ ...config, teaser_title_ru: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>{t('common.subtitleUz', 'Tavsif (UZ)')}</Label>
                                                    <Textarea value={config.teaser_subtitle_uz} onChange={(e) => setConfig({ ...config, teaser_subtitle_uz: e.target.value })} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>{t('common.subtitleRu', 'Tavsif (RU)')}</Label>
                                                    <Textarea value={config.teaser_subtitle_ru} onChange={(e) => setConfig({ ...config, teaser_subtitle_ru: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>{t('admin.buttonTextUz', 'Tugma matni (UZ)')}</Label>
                                                    <Input value={config.teaser_button_text_uz} onChange={(e) => setConfig({ ...config, teaser_button_text_uz: e.target.value })} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>{t('admin.buttonTextRu', 'Tugma matni (RU)')}</Label>
                                                    <Input value={config.teaser_button_text_ru} onChange={(e) => setConfig({ ...config, teaser_button_text_ru: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>{t('admin.buttonLink', 'Tugma havolasi')}</Label>
                                                <Input value={config.teaser_button_link} onChange={(e) => setConfig({ ...config, teaser_button_link: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>{t('admin.teaserImage', 'Fon rasmi')}</Label>
                                                <div className="flex items-center gap-4">
                                                    {config.teaser_image && (
                                                        <img
                                                            src={getImageUrl(config.teaser_image)}
                                                            className="w-20 h-20 object-cover rounded-lg border"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <Input
                                                            type="file"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const formData = new FormData();
                                                                    formData.append('teaser_image', file);
                                                                    try {
                                                                        const res = await homepageService.updateConfig(formData);
                                                                        setConfig(res.config);
                                                                        toast.success(t('admin.imageUploaded'));
                                                                    } catch (err) {
                                                                        toast.error(t('admin.errorUploading'));
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {t('admin.teaserImageHint', 'Tavsiya etilgan o\'lcham: 1200x400px. Format: JPG, PNG.')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button onClick={handleUpdateConfig} className="w-full mt-4 gap-2">
                                        <Save className="w-4 h-4" /> {t('admin.save')}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section Toggles */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>{t('admin.manageSections')}</CardTitle>
                            <CardDescription>{t('admin.manageSectionsSubtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {config && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor="show_stats">{t('admin.showStats')}</Label>
                                        <Switch id="show_stats" checked={config.show_stats} onCheckedChange={(c) => setConfig({ ...config, show_stats: c })} />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor="show_olympiads">{t('admin.showOlympiads')}</Label>
                                        <Switch id="show_olympiads" checked={config.show_olympiads} onCheckedChange={(c) => setConfig({ ...config, show_olympiads: c })} />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor="show_courses">{t('admin.showCourses')}</Label>
                                        <Switch id="show_courses" checked={config.show_courses} onCheckedChange={(c) => setConfig({ ...config, show_courses: c })} />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor="show_professions">{t('admin.showProfessions')}</Label>
                                        <Switch id="show_professions" checked={config.show_professions} onCheckedChange={(c) => setConfig({ ...config, show_professions: c })} />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor="show_testimonials">{t('admin.showTestimonials')}</Label>
                                        <Switch id="show_testimonials" checked={config.show_testimonials} onCheckedChange={(c) => setConfig({ ...config, show_testimonials: c })} />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor="show_mentors">{t('admin.showMentors')}</Label>
                                        <Switch id="show_mentors" checked={config.show_mentors} onCheckedChange={(c) => setConfig({ ...config, show_mentors: c })} />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor="show_winners">{t('admin.showWinners')}</Label>
                                        <Switch id="show_winners" checked={config.show_winners} onCheckedChange={(c) => setConfig({ ...config, show_winners: c })} />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor="show_steps">{t('admin.showSteps')}</Label>
                                        <Switch id="show_steps" checked={config.show_steps} onCheckedChange={(c) => setConfig({ ...config, show_steps: c })} />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor="show_cta">{t('admin.showCTA')}</Label>
                                        <Switch id="show_cta" checked={config.show_cta} onCheckedChange={(c) => setConfig({ ...config, show_cta: c })} />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                        <Label htmlFor="show_faq">{t('admin.showFAQ')}</Label>
                                        <Switch id="show_faq" checked={config.show_faq} onCheckedChange={(c) => setConfig({ ...config, show_faq: c })} />
                                    </div>
                                </div>
                            )}
                            <Button onClick={handleUpdateConfig} className="w-full mt-6 gap-2">
                                <Save className="w-4 h-4" /> {t('admin.saveAllChanges')}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* STATS */}
                <TabsContent value="stats">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('admin.stats')}</h2>
                        <Dialog>
                            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> {t('common.add')}</Button></DialogTrigger>
                            <DialogContent>
                                <DialogDescription className="sr-only">Statistika qo'shish formasi.</DialogDescription>
                                <StatsForm onSuccess={fetchData} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="grid gap-4">
                        {stats.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <div className="flex items-center gap-4">
                                    <GripVertical className="text-muted-foreground w-4 h-4" />
                                    <div className="font-bold text-xl">{item.value}</div>
                                    <div className="text-muted-foreground">{item.label}</div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteStat(item.id)} className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* STEPS */}
                <TabsContent value="steps">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('admin.showSteps')}</h2>
                        <Dialog>
                            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> {t('common.add')}</Button></DialogTrigger>
                            <DialogContent>
                                <DialogDescription className="sr-only">Step qo'shish formasi.</DialogDescription>
                                <StepsForm onSuccess={fetchData} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="grid gap-4">
                        {steps.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <div>
                                    <div className="font-bold">{item.title}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-1">{item.description}</div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteStep(item.id)} className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* ADVANTAGES */}
                <TabsContent value="advantages">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('admin.advantages')}</h2>
                        <Dialog>
                            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> {t('common.add')}</Button></DialogTrigger>
                            <DialogContent>
                                <DialogDescription className="sr-only">Afzallik qo'shish formasi.</DialogDescription>
                                <AdvantageForm onSuccess={fetchData} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="grid gap-4">
                        {advantages.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <div>
                                    <div className="font-bold">{item.title}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-1">{item.description}</div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteAdvantage(item.id)} className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </TabsContent>


                {/* TESTIMONIALS */}
                <TabsContent value="testimonials">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{t('admin.testimonials')}</h2>
                        <Dialog>
                            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> {t('common.add')}</Button></DialogTrigger>
                            <DialogContent>
                                <DialogDescription className="sr-only">Fikr-mulohaza qo'shish formasi.</DialogDescription>
                                <TestimonialForm onSuccess={fetchData} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="grid gap-4">
                        {testimonials.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <div className="flex items-center gap-4">
                                    {item.image ? (
                                        <img src={getImageUrl(item.image)} alt={item.name} className="w-10 h-10 object-cover rounded-full" />
                                    ) : <div className="w-10 h-10 bg-muted rounded-full"></div>}
                                    <div>
                                        <div className="font-bold">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">{item.profession}</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={async () => {
                                    if (confirm(t('common.deleteConfirm'))) {
                                        await homepageService.deleteTestimonial(item.id); fetchData(); toast.success(t('common.deleted'));
                                    }
                                }} className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </TabsContent>
                {/* FREE COURSES SECTION */}
                <TabsContent value="free-courses">
                    <AdminFreeCourseCMS />
                </TabsContent>
            </Tabs>
        </div>
    );
};

// --- Sub-components (Forms) ---

const StatsForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const { t } = useTranslation();
    const [data, setData] = useState({ label: '', value: '', icon: 'Users', order: 0 });
    const handleSubmit = async () => {
        try { await homepageService.createStat(data); onSuccess(); toast.success(t('common.added')); }
        catch { toast.error(t('common.error')); }
    };
    return (
        <div className="space-y-4 py-4">
            <DialogHeader><DialogTitle>{t('admin.addStat')}</DialogTitle></DialogHeader>
            <Input placeholder={t('admin.labelPlaceholder')} value={data.label} onChange={e => setData({ ...data, label: e.target.value })} />
            <Input placeholder={t('admin.valuePlaceholder')} value={data.value} onChange={e => setData({ ...data, value: e.target.value })} />
            <Input placeholder={t('admin.iconPlaceholder')} value={data.icon} onChange={e => setData({ ...data, icon: e.target.value })} />
            <Input type="number" placeholder={t('admin.order')} value={data.order} onChange={e => setData({ ...data, order: +e.target.value })} />
            <Button onClick={handleSubmit} className="w-full">{t('admin.save')}</Button>
        </div>
    );
};


const StepsForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const { t } = useTranslation();
    const [data, setData] = useState({ title: '', description: '', icon: 'Check', order: 0 });
    const handleSubmit = async () => {
        try { await homepageService.createStep(data); onSuccess(); toast.success(t('common.added')); }
        catch { toast.error(t('common.error')); }
    };
    return (
        <div className="space-y-4 py-4">
            <DialogHeader><DialogTitle>{t('admin.addStep')}</DialogTitle></DialogHeader>
            <Input placeholder={t('common.title')} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
            <Textarea placeholder={t('common.description')} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} />
            <Input placeholder={t('admin.iconPlaceholder')} value={data.icon} onChange={e => setData({ ...data, icon: e.target.value })} />
            <Input type="number" placeholder={t('admin.order')} value={data.order} onChange={e => setData({ ...data, order: +e.target.value })} />
            <Button onClick={handleSubmit} className="w-full">{t('admin.save')}</Button>
        </div>
    );
};

const AdvantageForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const { t } = useTranslation();
    const [data, setData] = useState({ title: '', description: '', icon: 'Shield', order: 0 });
    const handleSubmit = async () => {
        try { await homepageService.createAdvantage(data); onSuccess(); toast.success(t('common.added')); }
        catch { toast.error(t('common.error')); }
    };
    return (
        <div className="space-y-4 py-4">
            <DialogHeader><DialogTitle>{t('admin.addAdvantage')}</DialogTitle></DialogHeader>
            <Input placeholder={t('common.title')} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
            <Textarea placeholder={t('common.description')} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} />
            <Input placeholder={t('admin.iconPlaceholder')} value={data.icon} onChange={e => setData({ ...data, icon: e.target.value })} />
            <Input type="number" placeholder={t('admin.order')} value={data.order} onChange={e => setData({ ...data, order: +e.target.value })} />
            <Button onClick={handleSubmit} className="w-full">{t('admin.save')}</Button>
        </div>
    );
};


// ... existing forms ...

const BannerForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const { t } = useTranslation();
    // Basic implementation for MVP - supports creating without File Upload for now (url) or add file upload later
    // Actually standard forms need File Upload. Let's use simple text inputs for MVP or implement proper file handling
    // For now, let's assume image upload via separate endpoint or just text url if external, 
    // BUT we defined ImageField in backend. We need FormData.
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        if (image) formData.append('image', image);

        try { await homepageService.createBanner(formData); onSuccess(); toast.success(t('common.added')); }
        catch { toast.error(t('common.error')); }
    };

    return (
        <div className="space-y-4 py-4">
            <DialogHeader><DialogTitle>{t('admin.addBanner')}</DialogTitle></DialogHeader>
            <Input placeholder={t('common.title')} value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder={t('admin.heroSubtitleLabel')} value={subtitle} onChange={e => setSubtitle(e.target.value)} />
            <div className="grid gap-2">
                <Label>{t('admin.imageDesktop')}</Label>
                <Input type="file" onChange={e => setImage(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={handleSubmit} className="w-full">{t('admin.save')}</Button>
        </div>
    );
};

const TestimonialForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [profession, setProfession] = useState("");
    const [textUz, setTextUz] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [instagramUrl, setInstagramUrl] = useState("");

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('profession', profession);
        formData.append('text_uz', textUz);
        formData.append('text_ru', textUz); // Fallback
        if (image) formData.append('image', image);
        if (instagramUrl) formData.append('instagram_url', instagramUrl);

        try {
            await homepageService.createTestimonial(formData);
            onSuccess();
            toast.success(t('common.added'));
        }
        catch (error: any) {
            console.error('Testimonial creation error:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.detail || error.response?.data?.error || t('common.error');
            toast.error(errorMessage);
        }
    };

    return (
        <div className="space-y-4 py-4">
            <DialogHeader><DialogTitle>{t('admin.addTestimonial')}</DialogTitle></DialogHeader>
            <Input placeholder={t('admin.fullNamePlaceholder')} value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder={t('admin.professionPlaceHolder')} value={profession} onChange={e => setProfession(e.target.value)} />
            <Textarea placeholder={t('admin.testimonialTextPlaceholder')} value={textUz} onChange={e => setTextUz(e.target.value)} />

            <div className="grid gap-2">
                <Label>Video muqovasi (Thumbnail)</Label>
                <Input
                    type="file"
                    accept="image/*"
                    onChange={e => setImage(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">Video muqovasi uchun rasm yuklang</p>
            </div>

            <div className="grid gap-2">
                <Label>Instagram Video URL</Label>
                <Input
                    type="url"
                    placeholder="https://www.instagram.com/reel/..."
                    value={instagramUrl}
                    onChange={e => setInstagramUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Ustiga bosganda ochilishi uchun Instagram havola</p>
            </div>

            <Button onClick={handleSubmit} className="w-full">{t('admin.save')}</Button>
        </div>
    );
};

export default AdminHomeCMSPage;
