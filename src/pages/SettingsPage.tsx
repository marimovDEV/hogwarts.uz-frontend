import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Lock, Globe,
    Save, Loader2, ChevronRight, CheckCircle2, AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import authService from "@/services/authService";
import { useToast } from "@/components/ui/use-toast";

const SettingsPage = () => {
    const { t, i18n } = useTranslation();
    const { toast: uiToast } = useToast();
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        phone: '',
        email: ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getMe();
                setUser(userData);
                setProfileData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    username: userData.username || '',
                    phone: userData.phone || '',
                    email: userData.email || ''
                });
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await authService.updateProfile(profileData);
            toast.success(t('settings.profile_updated', 'Profil muvaffaqiyatli yangilandi'));
            // Update local user
            const updatedUser = { ...user, ...profileData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error: any) {
            toast.error(error.response?.data?.error || t('settings.profile_error', 'Xatolik yuz berdi'));
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error(t('settings.password_mismatch', 'Parollar mos kelmadi'));
            return;
        }
        setSaving(true);
        try {
            await authService.changePassword({
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            });
            toast.success(t('settings.password_updated', 'Parol muvaffaqiyatli o\'zgartirildi'));
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.error || t('settings.password_error', 'Eski parol noto\'g\'ri'));
        } finally {
            setSaving(false);
        }
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
        toast.info(t('settings.language_changed', 'Til o\'zgartirildi'));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 animate-fade-in pb-24 lg:pb-8">
            <header className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full lg:hidden">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground uppercase font-cinzel">
                        {t('settings.title', 'Sozlamalar')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('settings.description', 'Profilingiz va ilova sozlamalarini boshqaring')}
                    </p>
                </div>
            </header>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-2xl">
                    <TabsTrigger value="profile" className="gap-2 rounded-xl py-2.5">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('settings.tabs.profile', 'Profil')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2 rounded-xl py-2.5">
                        <Lock className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('settings.tabs.security', 'Xavfsizlik')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2 rounded-xl py-2.5">
                        <Globe className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('settings.tabs.preferences', 'Afzalliklar')}</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-border/40 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-xl font-bold">{t('settings.profile.title', 'Shaxsiy ma\'lumotlar')}</CardTitle>
                            <CardDescription>{t('settings.profile.desc', 'Ismingiz va bog\'lanish ma\'lumotlarini yangilang')}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleProfileSave} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">{t('settings.profile.first_name', 'Ism')}</Label>
                                        <Input
                                            id="first_name"
                                            value={profileData.first_name}
                                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                            className="rounded-xl h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">{t('settings.profile.last_name', 'Familiya')}</Label>
                                        <Input
                                            id="last_name"
                                            value={profileData.last_name}
                                            onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                            className="rounded-xl h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="username">{t('settings.profile.username', 'Foydalanuvchi nomi')}</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">@</span>
                                            <Input
                                                id="username"
                                                value={profileData.username}
                                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                                className="rounded-xl h-11 pl-8 bg-muted/20 border-border/50 focus:bg-background transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{t('settings.profile.phone', 'Telefon')}</Label>
                                        <Input
                                            id="phone"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="rounded-xl h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                                            placeholder="+998"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('settings.profile.email', 'Email (Ixtiyoriy)')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="rounded-xl h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                                        placeholder="example@mail.com"
                                    />
                                </div>
                                <div className="pt-2">
                                    <Button type="submit" disabled={saving} className="w-full sm:w-auto px-8 rounded-xl h-12 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                        {t('settings.save', 'Saqlash')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-border/40 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-xl font-bold">{t('settings.security.title', 'Xavfsizlik')}</CardTitle>
                            <CardDescription>{t('settings.security.desc', 'Profilingiz himoyasini kuchaytiring')}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="old_password">{t('settings.security.old_password', 'Eski parol')}</Label>
                                        <Input
                                            id="old_password"
                                            type="password"
                                            value={passwordData.old_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                            className="rounded-xl h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password">{t('settings.security.new_password', 'Yangi parol')}</Label>
                                            <Input
                                                id="new_password"
                                                type="password"
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                className="rounded-xl h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm_password">{t('settings.security.confirm_password', 'Parolni tasdiqlang')}</Label>
                                            <Input
                                                id="confirm_password"
                                                type="password"
                                                value={passwordData.confirm_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                                className="rounded-xl h-11 bg-muted/20 border-border/50 focus:bg-background transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Button type="submit" disabled={saving} className="w-full sm:w-auto px-8 rounded-xl h-12 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                                        {t('settings.security.change_password', 'Parolni o\'zgartirish')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                    {/* Language Settings */}
                    <Card className="border-border/40 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-xl font-bold">{t('settings.preferences.language', 'Til sozlamalari')}</CardTitle>
                            <CardDescription>{t('settings.preferences.language_desc', 'Ilova tilini tanlang')}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button
                                    variant={i18n.language === 'uz' ? 'default' : 'outline'}
                                    className={`h-20 rounded-2xl flex flex-col gap-1 transition-all ${i18n.language === 'uz' ? 'shadow-xl shadow-primary/20' : 'bg-muted/10'}`}
                                    onClick={() => handleLanguageChange('uz')}
                                >
                                    <span className="text-lg font-black tracking-widest">O'ZBEKCHA</span>
                                    <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Lotin yozuvida</span>
                                </Button>
                                <Button
                                    variant={i18n.language === 'ru' ? 'default' : 'outline'}
                                    className={`h-20 rounded-2xl flex flex-col gap-1 transition-all ${i18n.language === 'ru' ? 'shadow-xl shadow-primary/20' : 'bg-muted/10'}`}
                                    onClick={() => handleLanguageChange('ru')}
                                >
                                    <span className="text-lg font-black tracking-widest">РУССКИЙ</span>
                                    <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Кириллица</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsPage;
