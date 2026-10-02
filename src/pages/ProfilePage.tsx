import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
    User, Award, Zap, Camera, ArrowLeft, Loader2, CheckCircle, XCircle,
    BookOpen, CreditCard, ChevronRight, Settings, LogOut, HelpCircle, Trophy, Calendar
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { API_URL, getAuthHeader, getImageUrl } from "@/services/api";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageCropper from "@/components/common/ImageCropper";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PaymentModal from "@/components/payment/PaymentModal";

// --- Types ---
interface UserData {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    avatar: string | null;
    role: string;
    xp: number;
    level: number;
    birth_date?: string;
    region?: string;
    school?: string;
    grade?: string;
    balance?: string;
    ranking?: number;
    certificates_count?: number;
    level_progress?: {
        current: number;
        next: number;
        xp_current: number;
        xp_next: number;
        xp_left: number;
        progress_percent: number;
    };
}

interface Course {
    id: number;
    title: string;
    subject: string;
    level: string;
    lessons_count: number;
    duration: string;
    enrolled_count: number;
    rating: number;
    thumbnail: string;
    is_free: boolean;
    price: number;
    description: string;
    teacher_name?: string;
}

interface Enrollment {
    id: number;
    course: Course;
    enrolled_at: string;
    progress: number;
    is_completed: boolean;
}

const REGIONS = [
    "Toshkent shahri", "Toshkent viloyati", "Andijon viloyati", "Buxoro viloyati",
    "Farg'ona viloyati", "Jizzax viloyati", "Xorazm viloyati", "Namangan viloyati",
    "Navoiy viloyati", "Qashqadaryo viloyati", "Qoraqalpog'iston", "Samarqand viloyati",
    "Sirdaryo viloyati", "Surxondaryo viloyati",
];

const GRADES = [
    { value: "5", label: "5-sinf" }, { value: "6", label: "6-sinf" },
    { value: "7", label: "7-sinf" }, { value: "8", label: "8-sinf" },
    { value: "9", label: "9-sinf" }, { value: "10", label: "10-sinf" },
    { value: "11", label: "11-sinf" }, { value: "STUDENT", label: "Talaba" },
    { value: "GRADUATE", label: "Bitiruvchi" },
];

// --- Profile Edit Component ---
const EditProfileDialog = ({ user, onClose, onSave }: { user: UserData, onClose: () => void, onSave: (u: UserData) => void }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState(user.username || '');
    const [firstName, setFirstName] = useState(user.first_name || '');
    const [lastName, setLastName] = useState(user.last_name || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [birthDate, setBirthDate] = useState(user.birth_date || '');
    const [region, setRegion] = useState(user.region || '');
    const [school, setSchool] = useState(user.school || '');
    const [grade, setGrade] = useState(user.grade || '');
    const { toast } = useToast();

    // Username validation
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    const checkUsername = async (newUsername: string) => {
        if (!newUsername || newUsername.length < 3 || newUsername === user.username) return;
        setUsernameStatus('checking');
        try {
            const res = await fetch(`${API_URL}/auth/check-username/?username=${newUsername}`);
            const data = await res.json();
            setUsernameStatus(data.available ? 'available' : 'taken');
        } catch {
            setUsernameStatus('available');
        }
    };

    const handleSave = async () => {
        if (usernameStatus === 'taken') {
            toast({ title: t('dashboard.profile.info.error'), description: t('dashboard.profile.info.usernameTaken'), variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const res = await axios.put(`${API_URL}/auth/profile/`, {
                username, first_name: firstName, last_name: lastName, phone,
                birth_date: birthDate || null, region, school, grade
            }, { headers: getAuthHeader() });

            if (res.data.success) {
                onSave({ ...user, ...res.data.user });
                toast({ title: t('dashboard.profile.info.saved') });
                onClose();
            }
        } catch (err: any) {
            toast({ title: t('dashboard.profile.info.error'), description: err.response?.data?.error || "Error", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed flex inset-0 z-50 bg-background/80 backdrop-blur-sm pt-14 lg:pt-0 overflow-y-auto w-full h-full">
            <div className="m-auto w-full max-w-lg bg-card rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-border">
                <div className="p-4 border-b flex justify-between items-center bg-card sticky top-0 z-10">
                    <h2 className="font-bold text-lg">Profilni tahrirlash</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><XCircle className="w-5 h-5" /></Button>
                </div>
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Username</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                            <input type="text" value={username} onChange={(e) => { const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''); setUsername(val); if (val.length >= 3) checkUsername(val); else setUsernameStatus('idle'); }} className={`w-full h-11 pl-8 pr-10 rounded-xl border bg-background focus:ring-1 focus:ring-primary outline-none transition-all ${usernameStatus === 'taken' ? 'border-red-500' : 'border-border'}`} />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                                {usernameStatus === 'available' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {usernameStatus === 'taken' && <XCircle className="w-4 h-4 text-red-500" />}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Ism</label>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-primary outline-none" placeholder="Ism" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Familiya</label>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-primary outline-none" placeholder="Familiya" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Telefon</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-primary outline-none" placeholder="+998" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Viloyat</label>
                        <Select value={region || ""} onValueChange={setRegion}>
                            <SelectTrigger className="w-full h-11 rounded-xl bg-background border-border">
                                <SelectValue placeholder="Viloyatni tanlang" />
                            </SelectTrigger>
                            <SelectContent>
                                {REGIONS.map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Sinf</label>
                            <Select value={grade || ""} onValueChange={setGrade}>
                                <SelectTrigger className="w-full h-11 rounded-xl bg-background border-border">
                                    <SelectValue placeholder="Sinf tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {GRADES.map(g => (<SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Maktab / OTM</label>
                            <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-primary outline-none" placeholder="Maktab qismi" />
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-muted/20">
                    <Button onClick={handleSave} disabled={isLoading || usernameStatus === 'taken'} className="w-full h-12 rounded-xl text-base font-bold bg-primary hover:bg-primary/90">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Saqlash
                    </Button>
                </div>
            </div>
        </div>
    )
}

// --- Main Profile Page Component ---

const ProfilePage = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState<UserData | null>(null);
    const [activeCourse, setActiveCourse] = useState<Enrollment | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Avatar states
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        loadUser();
        fetchActiveCourse();
    }, []);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get(`${API_URL}/auth/me/`, { headers: getAuthHeader() });
                if (res.data.success && res.data.user) {
                    updateLocalUser(res.data.user);
                }
            } catch (err) {
                console.error('Error fetching user from API');
            }
        }
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                updateLocalUser(userData);
            } catch (e) {
                console.error('Error parsing user data');
            }
        }
    };

    const updateLocalUser = (userData: UserData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setAvatarPreview(userData.avatar || null);
    };

    const fetchActiveCourse = async () => {
        try {
            const res = await axios.get(`${API_URL}/courses/my_courses/`, { headers: getAuthHeader() });
            if (res.data.success && res.data.enrollments && res.data.enrollments.length > 0) {
                // Find highest progress that is not 100%, or just the first course
                const inProgress = res.data.enrollments.find((e: Enrollment) => !e.is_completed);
                setActiveCourse(inProgress || res.data.enrollments[0]);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async (croppedFile: File) => {
        const formData = new FormData();
        formData.append('avatar', croppedFile);
        try {
            const res = await axios.post(`${API_URL}/auth/upload-avatar/`, formData, {
                headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.avatar_url && user) {
                updateLocalUser({ ...user, avatar: res.data.avatar_url });
            }
        } catch (err) {
            toast({ title: "Xatolik", description: "Avatar yuklashda xatolik yuz berdi", variant: "destructive" });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/login');
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[100dvh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
    const initials = (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase();
    const displayAvatar = avatarPreview || user.avatar;

    return (
        <div className="min-h-screen bg-hogwarts-light dark:bg-background pb-24 w-full animate-fade-in overflow-x-hidden md:max-w-xl md:mx-auto lg:max-w-7xl lg:px-8 lg:border-none shadow-sm">
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />

            {editMode && <EditProfileDialog user={user} onClose={() => setEditMode(false)} onSave={updateLocalUser} />}

            {/* 1. Compact Header */}
            <header className="sticky top-0 w-full bg-hogwarts-light/90 dark:bg-card/80 backdrop-blur-xl h-14 flex items-center justify-between px-4 z-40 lg:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-hogwarts-dark dark:text-foreground active:scale-95 transition">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-extrabold text-lg text-hogwarts-dark dark:text-foreground tracking-tight uppercase font-cinzel">Profil</h1>
                <button onClick={() => navigate('/settings')} className="p-2 -mr-2 text-hogwarts-dark/70 dark:text-muted-foreground hover:text-hogwarts-dark dark:hover:text-foreground active:scale-95 transition">
                    <Settings className="w-5 h-5" />
                </button>
            </header>

            <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:mt-8">
                {/* Left Column: Main Info & Stats */}
                <div className="lg:col-span-8 space-y-6">
                    {/* 2. Profile Hero Card */}
                    <div className="mx-4 lg:mx-0 p-5 lg:p-8 rounded-3xl bg-gradient-to-br from-hogwarts-dark to-hogwarts-surface text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-4 lg:gap-6">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                {displayAvatar ? (
                                    <img className="w-16 h-16 lg:w-24 lg:h-24 rounded-full border-2 border-hogwarts-gold object-cover shadow-md" src={getImageUrl(displayAvatar)} alt={fullName} />
                                ) : (
                                    <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-hogwarts-surface flex items-center justify-center text-xl lg:text-3xl font-bold border-2 border-hogwarts-gold text-white shadow-md">
                                        {initials}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 lg:bottom-1 lg:right-1 w-6 h-6 lg:w-8 lg:h-8 bg-hogwarts-gold text-hogwarts-dark rounded-full flex items-center justify-center border-2 border-hogwarts-surface shadow-sm active:scale-90 transition">
                                    <Camera className="w-3 h-3 lg:w-4 lg:h-4" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl lg:text-3xl font-bold">{fullName}</h2>
                                <p className="text-sm lg:text-base font-medium text-gray-300">Lvl {user.level || 1} • {user.xp || 0} XP</p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-5 lg:mt-8">
                            <div className="w-full bg-white/10 rounded-full h-2 lg:h-3 overflow-hidden shadow-inner">
                                <div className="bg-hogwarts-gold h-full rounded-full transition-all duration-1000" style={{ width: `${user.level_progress?.progress_percent || 0}%` }}></div>
                            </div>
                            <p className="text-xs lg:text-sm mt-2 text-gray-300 font-medium text-right">
                                Keyingi darajagacha {user.level_progress?.xp_left || 0} XP
                            </p>
                        </div>
                    </div>

                    {/* 4. Stats Grid 2x2 */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mx-4 lg:mx-0 mt-6 lg:mt-0">
                        <div className="bg-white dark:bg-card rounded-2xl p-4 lg:p-6 shadow-soft border border-gray-100 dark:border-border flex lg:flex-row lg:gap-4 items-center gap-2 text-center lg:text-left">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Kurslar</p>
                                <p className="text-xl lg:text-2xl font-black text-hogwarts-dark dark:text-foreground">{activeCourse ? 1 : 0}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card rounded-2xl p-4 lg:p-6 shadow-soft border border-gray-100 dark:border-border flex lg:flex-row lg:gap-4 items-center gap-2 text-center lg:text-left">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Certlar</p>
                                <p className="text-xl lg:text-2xl font-black text-hogwarts-dark dark:text-foreground">{user.certificates_count || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card rounded-2xl p-4 lg:p-6 shadow-soft border border-gray-100 dark:border-border flex lg:flex-row lg:gap-4 items-center gap-2 text-center lg:text-left">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">XP</p>
                                <p className="text-xl lg:text-2xl font-black text-hogwarts-dark dark:text-foreground">{user.xp || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card rounded-2xl p-4 lg:p-6 shadow-soft border border-gray-100 dark:border-border flex lg:flex-row lg:gap-4 items-center gap-2 text-center lg:text-left">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <Award className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-wider">Progress</p>
                                <p className="text-xl lg:text-2xl font-black text-hogwarts-dark dark:text-foreground">{user.level_progress?.progress_percent || 0}%</p>
                            </div>
                        </div>
                    </div>

                    {/* 5. Continue Course Card */}
                    {activeCourse ? (
                        <div className="mx-4 lg:mx-0 mt-6 lg:mt-0 bg-white dark:bg-card rounded-3xl shadow-medium overflow-hidden border border-gray-100 dark:border-border transition-all hover:shadow-lg lg:flex lg:items-stretch lg:h-48">
                            <div className="h-32 lg:h-auto lg:w-1/3 bg-gray-100 dark:bg-muted relative shrink-0">
                                {activeCourse.course.thumbnail ? (
                                    <img src={getImageUrl(activeCourse.course.thumbnail)} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-hogwarts-surface text-white">
                                        <BookOpen className="w-8 h-8 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-hogwarts-dark/80 to-transparent pointer-events-none" />
                                <div className="absolute bottom-3 left-4 text-white font-bold text-[11px] lg:text-xs uppercase tracking-wider bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg">
                                    Darslik
                                </div>
                            </div>
                            <div className="p-5 lg:p-6 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
                                <h4 className="font-bold text-hogwarts-dark dark:text-foreground text-lg lg:text-xl mb-3 leading-tight line-clamp-1">{activeCourse.course.title}</h4>
                                <div className="flex items-center justify-between text-[11px] lg:text-xs font-bold text-gray-400 dark:text-muted-foreground mb-1.5 uppercase">
                                    <span>Progress</span>
                                    <span className="text-hogwarts-dark dark:text-foreground">{activeCourse.progress || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-muted rounded-full h-2 overflow-hidden">
                                    <div className="bg-hogwarts-gold h-full rounded-full transition-all" style={{ width: `${activeCourse.progress || 0}%` }}></div>
                                </div>
                                <div className="lg:flex lg:justify-end mt-4 lg:mt-6">
                                    <button
                                        onClick={() => navigate(`/course/${activeCourse.course.id}`)}
                                        className="w-full lg:w-48 bg-hogwarts-dark dark:bg-primary hover:bg-slate-800 text-white font-bold py-3 lg:py-2.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-sm">
                                        Davom ettirish
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mx-4 lg:mx-0 mt-6 lg:mt-0 bg-white dark:bg-card rounded-3xl shadow-medium p-6 lg:p-10 text-center border border-gray-100 dark:border-border">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-5">
                                <BookOpen className="w-8 h-8 lg:w-10 lg:h-10 text-gray-300 dark:text-muted-foreground" />
                            </div>
                            <h4 className="font-bold text-hogwarts-dark dark:text-foreground text-lg lg:text-xl mb-1 lg:mb-2">Kurslar mavjud emas</h4>
                            <p className="text-sm lg:text-base text-gray-500 dark:text-muted-foreground mb-4 lg:mb-6">Ta'limni boshlash uchun kurs tanlang</p>
                            <button
                                onClick={() => navigate('/courses')}
                                className="w-full lg:w-64 mx-auto bg-hogwarts-dark dark:bg-primary text-white font-bold py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all">
                                Kurslarni ko'rish
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: AI Mentor & Menu */}
                <div className="lg:col-span-4 space-y-6 lg:mt-0">
                    {/* 3. AI Mentor Card */}
                    <div className="mx-4 lg:mx-0 mt-6 lg:mt-0 p-5 lg:p-6 bg-[#FBBF24] rounded-2xl shadow-lg relative overflow-hidden border border-[#FCD34D]/50 text-brand group cursor-pointer" onClick={() => navigate('/ai-mentor')}>
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                        <div className="flex lg:flex-col justify-between items-center lg:items-start lg:gap-4 relative z-10">
                            <div>
                                <h3 className="font-black text-[#0F172A] text-lg lg:text-xl flex items-center gap-2 uppercase font-cinzel">
                                    🤖 AI Mentor
                                </h3>
                                <p className="text-sm lg:text-base text-[#0F172A]/80 font-semibold mt-0.5">
                                    Savollaringizni so‘rang
                                </p>
                            </div>
                            <button className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-5 lg:px-8 py-2.5 lg:py-3 rounded-xl shadow-md active:scale-95 transition-all text-sm lg:text-base lg:w-full">
                                Boshlash
                            </button>
                        </div>
                    </div>

                    {/* 6. Menu List */}
                    <div className="mx-4 lg:mx-0 mt-6 lg:mt-0 bg-white dark:bg-card rounded-2xl shadow-soft border border-gray-100 dark:border-border flex flex-col overflow-hidden divide-y divide-gray-100 dark:divide-border/50">
                        <div onClick={() => setEditMode(true)} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-muted/50 transition-colors">
                            <span className="font-semibold text-hogwarts-dark dark:text-foreground text-[15px] lg:text-base">Profilni tahrirlash</span>
                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-muted-foreground" />
                        </div>

                        <div onClick={() => navigate('/my-certificates')} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-muted/50 transition-colors">
                            <span className="font-semibold text-hogwarts-dark dark:text-foreground text-[15px] lg:text-base">Sertifikatlar</span>
                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-muted-foreground" />
                        </div>

                        <div onClick={() => navigate('/olympiads')} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-muted/50 transition-colors">
                            <span className="font-semibold text-hogwarts-dark dark:text-foreground text-[15px] lg:text-base">Olimpiadalar</span>
                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-muted-foreground" />
                        </div>

                        <div onClick={() => setIsPaymentModalOpen(true)} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-muted/50 transition-colors">
                            <span className="font-semibold text-hogwarts-dark dark:text-foreground text-[15px] lg:text-base">To'lovlar / Hisobni to'ldirish</span>
                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-muted-foreground" />
                        </div>

                        <div onClick={() => window.open('https://t.me/Ardent_support_bot', '_blank')} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-muted/50 transition-colors">
                            <span className="font-semibold text-hogwarts-dark dark:text-foreground text-[15px] lg:text-base">Yordam</span>
                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-muted-foreground" />
                        </div>

                        <div onClick={handleLogout} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-red-50 active:bg-red-100 dark:hover:bg-destructive/10 transition-colors">
                            <span className="font-semibold text-red-500 text-[15px] lg:text-base">Chiqish</span>
                            <LogOut className="w-5 h-5 text-red-500/50 dark:text-red-500" />
                        </div>
                    </div>
                </div>
            </div>

            {imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    open={showCropper}
                    onOpenChange={setShowCropper}
                    aspect={1}
                    onCropComplete={(croppedFile) => handleAvatarUpload(croppedFile)}
                />
            )}

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
                onSuccess={loadUser}
            />
        </div>
    );
};

export default ProfilePage;
