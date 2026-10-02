import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Camera,
    ChevronRight,
    ChevronLeft,
    Check,
    GraduationCap,
    Briefcase,
    Globe,
    Send,
    Instagram,
    Youtube,
    Loader2,
    Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import ImageCropper from "@/components/common/ImageCropper";
import { useTranslation } from "react-i18next";

const TeacherOnboarding = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        bio: "",
        specialization: "",
        experience_years: 0,
        telegram_username: "",
        instagram_username: "",
        youtube_channel: "",
        linkedin_profile: ""
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_URL}/auth/me/`, { headers: getAuthHeader() });
                const user = res.data.user;
                setFormData({
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    bio: user.teacher_profile?.bio || "",
                    specialization: user.teacher_profile?.specialization || "",
                    experience_years: user.teacher_profile?.experience_years || 0,
                    telegram_username: user.teacher_profile?.telegram_username || "",
                    instagram_username: user.teacher_profile?.instagram_username || "",
                    youtube_channel: user.teacher_profile?.youtube_channel || "",
                    linkedin_profile: user.teacher_profile?.linkedin_profile || ""
                });
                if (user.avatar_url) setAvatarPreview(user.avatar_url);

                // If already verified or submission is pending (has bio), they shouldn't be here
                if (user.teacher_profile?.verification_status === 'APPROVED' ||
                    (user.teacher_profile?.verification_status === 'PENDING' && user.teacher_profile?.bio)) {
                    navigate('/teacher/dashboard');
                }
            } catch (error) {
                toast.error("Profilni yuklashda xatolik");
            } finally {
                setLoading(false);
            }
        };

        void fetchProfile();
    }, [navigate]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.first_name || !formData.last_name) {
                toast.error("Ism va familiyani kiriting");
                return;
            }
        }
        if (step === 2) {
            if (!formData.specialization || !formData.bio) {
                toast.error("Mutaxassislik va bio ma'lumotlarini kiriting");
                return;
            }
        }
        if (step === 3) {
            // Already handled in handleSubmit
        }
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Upload avatar if changed
            if (avatarFile) {
                const avatarData = new FormData();
                avatarData.append('avatar', avatarFile);
                await axios.post(`${API_URL}/auth/upload-avatar/`, avatarData, {
                    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
                });
            }

            const profileData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                profileData.append(key, String(value));
            });

            await axios.post(`${API_URL}/users/me/update_teacher_profile/`, profileData, {
                headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
            });

            // Submit for verification
            await axios.post(`${API_URL}/users/me/verify_teacher/`, { status: "PENDING" }, { headers: getAuthHeader() });

            toast.success("Ma'lumotlar saqlandi va moderatorga yuborildi!");

            // Re-fetch me to update localStorage and redirect
            const meRes = await axios.get(`${API_URL}/auth/me/`, { headers: getAuthHeader() });
            localStorage.setItem('user', JSON.stringify(meRes.data.user));

            navigate('/teacher/dashboard');
        } catch (error) {
            toast.error("Saqlashda xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-muted/40 py-12 px-4 flex items-center justify-center">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-3">{t('teacher.onboarding.welcome', { defaultValue: "Xush kelibsiz!" })} 👋</h1>
                    <p className="text-muted-foreground text-lg font-medium">{t('teacher.onboarding.intro', { defaultValue: "Tizimda ishlashni boshlash uchun profilingizni to'ldiring." })}</p>

                    {/* Progress Bar */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step === s ? "bg-primary text-white shadow-lg" :
                                    step > s ? "bg-green-500 text-white" : "bg-muted text-muted-foreground border-2 border-border"
                                    }`}>
                                    {step > s ? <Check className="w-5 h-5" /> : s}
                                </div>
                                {s < 3 && <div className={`w-12 h-1 mx-2 rounded-full ${step > s ? "bg-green-500" : "bg-muted"}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="rounded-[32px] border-none shadow-2xl shadow-primary/5 overlow-hidden">
                    <CardHeader className="pt-10 px-10">
                        <CardTitle className="text-2xl font-black">
                            {step === 1 && "Shaxsiy ma'lumotlar"}
                            {step === 2 && "Kasbiy ma'lumotlar"}
                            {step === 3 && "Ijtimoiy tarmoqlar"}
                        </CardTitle>
                        <CardDescription className="text-base font-medium">
                            {step === 1 && "Ismingiz va professional rasmingizni yuklang."}
                            {step === 2 && "O'zingiz va tajribangiz haqida batafsil so'zlab bering."}
                            {step === 3 && "O'quvchilar sizni ijtimoiy tarmoqlarda topishlari uchun."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-10">
                        {step === 1 && (
                            <div className="space-y-8">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-[24px] bg-primary/5 flex items-center justify-center text-primary border-4 border-muted overflow-hidden">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <User className="w-12 h-12 opacity-20" />
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                            <Camera className="w-5 h-5" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                        </label>
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground">Professional rasm (Avatar) yuklash</p>
                                </div>

                                {imageToCrop && (
                                    <ImageCropper
                                        image={imageToCrop}
                                        open={showCropper}
                                        onOpenChange={setShowCropper}
                                        aspect={1}
                                        onCropComplete={(croppedFile) => {
                                            setAvatarFile(croppedFile);
                                            setAvatarPreview(URL.createObjectURL(croppedFile));
                                        }}
                                    />
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Ism *</Label>
                                        <Input
                                            placeholder="Ismingiz"
                                            className="h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Familiya *</Label>
                                        <Input
                                            placeholder="Familiyangiz"
                                            className="h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Mutaxassislik *</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                placeholder="Matematika p'qituvchisi"
                                                className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20"
                                                value={formData.specialization}
                                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Tajriba (yil) *</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                placeholder="Masalan: 5"
                                                className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20"
                                                value={formData.experience_years || ""}
                                                onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">O'zingiz haqingizda (Bio) *</Label>
                                    <Textarea
                                        placeholder="O'quvchilaringiz va mentorlar bo'limi uchun qisqacha ma'lumot..."
                                        className="rounded-2xl min-h-[160px] bg-muted/30 border-2 border-transparent focus:border-primary/20 p-5"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Telegram (Username) (Ixtiyoriy)</Label>
                                        <div className="relative">
                                            <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0088cc]" />
                                            <Input
                                                placeholder="@username"
                                                className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 font-bold"
                                                value={formData.telegram_username}
                                                onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Instagram (Username) (Ixtiyoriy)</Label>
                                        <div className="relative">
                                            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#bc1888]" />
                                            <Input
                                                placeholder="@username"
                                                className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20 font-bold"
                                                value={formData.instagram_username}
                                                onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">YouTube Kanal (Link) (Ixtiyoriy)</Label>
                                        <div className="relative">
                                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                                            <Input
                                                placeholder="https://..."
                                                className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20"
                                                value={formData.youtube_channel}
                                                onChange={(e) => setFormData({ ...formData, youtube_channel: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">LinkedIn Profil (Link) (Ixtiyoriy)</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-700" />
                                            <Input
                                                placeholder="https://..."
                                                className="h-14 pl-12 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/20"
                                                value={formData.linkedin_profile}
                                                onChange={(e) => setFormData({ ...formData, linkedin_profile: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </CardContent>

                    <CardFooter className="p-10 pt-0 flex justify-between gap-4">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                className="h-14 px-8 rounded-2xl font-black border-2"
                                onClick={() => setStep(step - 1)}
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" /> Orqaga
                            </Button>
                        )}
                        <Button
                            className={`h-14 px-10 rounded-2xl font-black transition-all shadow-lg ${step === 3 ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "bg-primary shadow-primary/20 ml-auto"}`}
                            onClick={step === 3 ? handleSubmit : handleNext}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>
                                    {step === 3 ? "Tugatish va yuborish" : "Keyingisi"}
                                    {step !== 3 && <ChevronRight className="w-5 h-5 ml-2" />}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default TeacherOnboarding;
