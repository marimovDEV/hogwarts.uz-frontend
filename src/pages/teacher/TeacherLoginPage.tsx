import { API_URL as API_BASE } from "@/services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, GraduationCap, ArrowLeft, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { AuthGuideSide } from "@/components/auth/AuthGuideSide";


const TeacherLoginPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Barcha maydonlarni to'ldiring");
            return;
        }

        setIsLoading(true);

        try {
            // NOTE: Using general login endpoint
            const res = await fetch(`${API_BASE}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }), // Send username directly
            });

            const data = await res.json();

            if (data.success) {
                // Check if user is teacher
                if (data.user.role !== 'TEACHER' && !data.user.is_superuser) {
                    setError("Sizda o'qituvchi huquqi yo'q");
                    setIsLoading(false);
                    return;
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast({ title: "O'qituvchi portaliga xush kelibsiz" });
                navigate('/teacher/dashboard');
            } else {
                setError(data.error || "Login yoki parol noto'g'ri");
            }
        } catch (err) {
            setError("Server bilan aloqa yo'q");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-6xl h-auto min-h-[600px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                {/* Left Side (Guide) */}
                <AuthGuideSide />

                {/* Right Side (Form) */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-black/40 backdrop-blur-md">
                    <div className="absolute top-6 left-6 z-50">
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 backdrop-blur-md"
                        >
                            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                                Bosh sahifa
                            </span>
                        </button>
                    </div>

                    <div className="text-center mb-8 lg:hidden">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
                            <GraduationCap className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Ustozlar Portali</h1>
                        <p className="text-gray-400">O'qituvchilar tizimi</p>
                    </div>

                    {/* Desktop Context */}
                    <div className="hidden lg:block mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Ustozlar Portali</h1>
                        <p className="text-gray-400 text-sm">O'qituvchilar uchun maxsus tizim.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-900/20 border border-red-900/50 flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-red-500" />
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 ml-1">{t('auth.username', 'Login')}</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <GraduationCap className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('auth.placeholders.login', 'Loginni kiriting')}
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-white placeholder-gray-600 font-medium text-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 ml-1">Parol</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-14 pl-12 pr-12 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-white placeholder-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            {isLoading ? t('auth_guide.loading') : "Kirish"}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-gray-600">
                            Darslaringizni oson boshqaring. <br />
                            Hogwords Olimpiada.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherLoginPage;
