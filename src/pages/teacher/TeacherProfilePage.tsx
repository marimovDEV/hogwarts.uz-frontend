import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    User, MapPin, Phone, Briefcase, BookOpen, Clock, Globe,
    Linkedin, Youtube, Send, Camera, Save, Lock, Loader2,
    CheckCircle, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_URL, getAuthHeader, getImageUrl } from "@/services/api";
import axios from "axios";
import { useTranslation } from "react-i18next";

// Types
interface TeacherProfile {
    bio: string;
    experience_years: number;
    specialization: string;
    telegram_username: string;
    instagram_username: string;
    youtube_channel: string;
    linkedin_profile: string;
}

interface Subject {
    id: number;
    name: string;
    color: string;
}

interface UserData {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    avatar: string | null;
    avatar_url: string | null;
    role: string;
    teacher_profile?: TeacherProfile;
    subjects?: Subject[];
}

const TeacherProfilePage = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        bio: '',
        specialization: '',
        experience_years: 0,
        telegram_username: '',
        instagram_username: '',
        youtube_channel: '',
        linkedin_profile: ''
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/me/`, { headers: getAuthHeader() });
            if (res.data.success) {
                const userData = res.data.user;
                setUser(userData);

                // Initialize form
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    phone: userData.phone || '',
                    bio: userData.teacher_profile?.bio || '',
                    specialization: userData.teacher_profile?.specialization || '',
                    experience_years: userData.teacher_profile?.experience_years || 0,
                    telegram_username: userData.teacher_profile?.telegram_username || '',
                    instagram_username: userData.teacher_profile?.instagram_username || '',
                    youtube_channel: userData.teacher_profile?.youtube_channel || '',
                    linkedin_profile: userData.teacher_profile?.linkedin_profile || ''
                });

                // Update local storage just to be safe (sync basics)
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (error) {
            console.error(error);
            toast({ title: t('teacherProfile.error'), description: t('teacherProfile.loadError'), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Upload Avatar if changed
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                await axios.post(`${API_URL}/auth/upload-avatar/`, formData, {
                    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
                });
            }

            // 2. Update Profile Data
            const payload = {
                ...formData,
                // Ensure experience is number
                experience_years: Number(formData.experience_years)
            };

            const res = await axios.put(`${API_URL}/auth/profile/`, payload, { headers: getAuthHeader() });

            if (res.data.success) {
                toast({ title: t('common.success'), description: t('teacher.profile.saveSuccess') });
                fetchProfile(); // Refresh
            }
        } catch (error) {
            console.error(error);
            toast({ title: t('teacherProfile.error'), description: t('teacherProfile.error'), variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const getAvatarSrc = (path: string | null) => {
        if (!path) return '';
        if (path.startsWith('blob:')) return path;
        return getImageUrl(path);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!user) return <div>User not found</div>;

    const displayAvatar = avatarPreview || getAvatarSrc(user.avatar_url || user.avatar);

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8 animate-fade-in">
            {/* Header Profile Card */}
            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden transition-all duration-500">
                <div className="h-40 bg-gradient-to-r from-secondary-light via-secondary to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:24px_24px] opacity-20"></div>
                    <div className="absolute top-6 right-6">
                        <Badge className="bg-primary/20 text-primary border border-primary/30 backdrop-blur-md px-4 py-1 font-cinzel tracking-widest">
                            ID: {user.username}
                        </Badge>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-16 mb-8 gap-6">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                            <div className="relative group">
                                <div className="w-36 h-36 rounded-2xl bg-card p-1 shadow-gold transition-transform duration-500 hover:scale-105">
                                    <div className="w-full h-full rounded-xl overflow-hidden bg-muted relative">
                                        {displayAvatar ? (
                                            <img
                                                src={displayAvatar}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-4xl font-cinzel">
                                                {user.first_name?.[0]}
                                            </div>
                                        )}
                                        {/* Overlay for upload */}
                                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="text-primary w-10 h-10" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center md:text-left mb-2">
                                <h1 className="text-3xl font-black text-foreground tracking-tight font-cinzel">{user.first_name} {user.last_name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                                    <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-widest text-[10px] px-3">
                                        {t('teacher.management')}
                                    </Badge>
                                    {formData.specialization && (
                                        <Badge variant="outline" className="text-muted-foreground border-border flex items-center gap-1 font-medium">
                                            <Briefcase className="w-3 h-3 text-primary" />
                                            {formData.specialization}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary-light h-12 px-8 rounded-xl font-bold shadow-gold transition-all duration-300">
                            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            {t('common.save')}
                        </Button>
                    </div>

                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full md:w-[600px] grid-cols-3 mb-10 bg-muted/30 p-1 rounded-2xl border border-border">
                            <TabsTrigger value="personal" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-gold font-bold transition-all py-3">{t('admin.teacher.profile.title')}</TabsTrigger>
                            <TabsTrigger value="professional" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-gold font-bold transition-all py-3">{t('teacher.dashboard.stats.rating')}</TabsTrigger>
                            <TabsTrigger value="security" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-gold font-bold transition-all py-3">{t('common.password')}</TabsTrigger>
                        </TabsList>

                        {/* Personal Info Tab */}
                        <TabsContent value="personal" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('teacherProfile.personal.title')}</CardTitle>
                                    <CardDescription>{t('teacherProfile.personal.description')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('teacherProfile.personal.fname')}</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    value={formData.first_name}
                                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('teacherProfile.personal.lname')}</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    value={formData.last_name}
                                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t('teacherProfile.personal.phone')}</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Professional Info Tab */}
                        <TabsContent value="professional" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('teacherProfile.professional.title')}</CardTitle>
                                    <CardDescription>{t('teacherProfile.professional.description')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('teacherProfile.professional.specialization')}</Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder={t('teacherProfile.professional.specPlaceholder')}
                                                    value={formData.specialization}
                                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('teacherProfile.professional.experience')}</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    value={formData.experience_years}
                                                    onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t('teacherProfile.professional.bio')}</Label>
                                        <Textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder={t('teacherProfile.professional.bioPlaceholder')}
                                            className="min-h-[100px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Telegram Username</Label>
                                            <div className="relative">
                                                <Send className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="@username"
                                                    value={formData.telegram_username}
                                                    onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Instagram Username</Label>
                                            <div className="relative">
                                                <Camera className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="@username"
                                                    value={formData.instagram_username}
                                                    onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>YouTube Kanal</Label>
                                            <div className="relative">
                                                <Youtube className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="https://youtube.com/..."
                                                    value={formData.youtube_channel}
                                                    onChange={(e) => setFormData({ ...formData, youtube_channel: e.target.value })}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>LinkedIn Profil</Label>
                                            <div className="relative">
                                                <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="https://linkedin.com/in/..."
                                                    value={formData.linkedin_profile}
                                                    onChange={(e) => setFormData({ ...formData, linkedin_profile: e.target.value })}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subjects Display (Read Only) */}
                                    <div className="space-y-3 pt-4 border-t">
                                        <Label className="text-base">{t('teacherProfile.professional.subjects')}</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {user.subjects && user.subjects.length > 0 ? (
                                                user.subjects.map(sub => (
                                                    <Badge key={sub.id} className={`${sub.color} text-white px-3 py-1`}>
                                                        {sub.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">
                                                    {t('teacherProfile.professional.noSubjects')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('teacherProfile.security.title')}</CardTitle>
                                    <CardDescription>{t('teacherProfile.security.description')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-500 mb-4">
                                        {t('teacherProfile.security.notAvailable')}
                                    </div>
                                    {/* Placeholder for change password form */}
                                    <div className="space-y-4 opacity-50 pointer-events-none">
                                        <div className="space-y-2">
                                            <Label>{t('teacherProfile.security.oldPass')}</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input type="password" className="pl-9" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('teacherProfile.security.newPass')}</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input type="password" className="pl-9" />
                                            </div>
                                        </div>
                                        <Button>{t('teacherProfile.security.updateBtn')}</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfilePage;
