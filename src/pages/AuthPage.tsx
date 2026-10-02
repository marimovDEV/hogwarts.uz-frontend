import { API_URL as API_BASE } from "@/services/api";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Trophy, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck,
  Clock, CheckCircle2, AlertCircle, User, Calendar, MapPin, School, GraduationCap, Loader2, Sparkles
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AuthGuideSide } from "@/components/auth/AuthGuideSide";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuthPageProps {
  mode: 'login' | 'register' | 'recover';
}


const AuthPage = ({ mode }: AuthPageProps) => {
  const { t } = useTranslation();

  // Regions of Uzbekistan
  const REGIONS = [
    "Toshkent shahri", "Toshkent viloyati", "Andijon viloyati", "Buxoro viloyati",
    "Farg'ona viloyati", "Jizzax viloyati", "Xorazm viloyati", "Namangan viloyati",
    "Navoiy viloyati", "Qashqadaryo viloyati", "Qoraqalpog'iston",
    "Samarqand viloyati", "Sirdaryo viloyati", "Surxondaryo viloyati",
  ];

  const GRADES = [
    { value: "5", label: `5-${t('auth.grade')}` },
    { value: "6", label: `6-${t('auth.grade')}` },
    { value: "7", label: `7-${t('auth.grade')}` },
    { value: "8", label: `8-${t('auth.grade')}` },
    { value: "9", label: `9-${t('auth.grade')}` },
    { value: "10", label: `10-${t('auth.grade')}` },
    { value: "11", label: `11-${t('auth.grade')}` },
    { value: "STUDENT", label: t('hero.student') },
    { value: "GRADUATE", label: t('subjectsSection.student') },
  ];

  // Registration Steps: 1=Phone, 2=OTP, 3=StudentInfo, 4=Password
  const [step, setStep] = useState(1);

  // Form Data
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Student Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [region, setRegion] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");

  // Login (email for login)
  const [email, setEmail] = useState("");

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");

  // Animation State
  const [animKey, setAnimKey] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Reset on mode change
  useEffect(() => {
    setStep(1);
    setPhone("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setRegion("");
    setSchool("");
    setGrade("");
    setEmail("");
    setError("");
    setResendTimer(0);
    setAnimKey(prev => prev + 1); // Trigger animation replay
  }, [mode]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatPhone = (v: string) => v.replace(/[^0-9]/g, '');

  // ============ STEP 1: Send Code (phone only) ============
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (phone.length < 9) {
      setError(t('auth.errors.phoneRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/send-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+998${phone}`,
          type: mode // 'register' or 'recover'
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: t('auth.errors.sent'),
          description: t('auth.toasts.codeSent')
        });
        setStep(2);
        setResendTimer(60);
      } else {
        setError(data.error || t('auth.errors.server'));
      }
    } catch (err) {
      setError(t('auth.errors.server'));
    } finally {
      setIsLoading(false);
    }
  };

  // ============ STEP 2: Verify Code ============
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError(t('auth.errors.codeRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+998${phone}`,
          code: otp,
        }),
      });

      const data = await res.json();

      if (data.success && data.verified) {
        toast({
          title: t('auth.toasts.verified'),
          description: t('auth.toasts.enterInfo')
        });
        setStep(3); // Go to student info
      } else {
        setError(data.error || t('auth.errors.codeInvalid'));
      }
    } catch (err) {
      setError(t('auth.errors.server'));
    } finally {
      setIsLoading(false);
    }
  };

  // ============ STEP 3: Student Info -> go to password ============
  const handleStudentInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !birthDate || !region || !school.trim() || !grade) {
      setError(t('auth.errors.allFieldsRequired'));
      return;
    }

    setStep(4); // Go to password
  };

  // ============ STEP 4: Complete Registration ============
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t('auth.errors.passwordShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/complete-registration/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+998${phone}`,
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate,
          region: region,
          school: school,
          grade: grade,
          password: password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast({
          title: t('auth.toasts.congrats'),
          description: t('auth.toasts.registered')
        });
        navigate('/dashboard');
      } else {
        setError(data.error || t('auth.errors.general'));
      }
    } catch (err) {
      setError(t('auth.errors.server'));
    } finally {
      setIsLoading(false);
    }
  };

  // ============ Resend Code ============
  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+998${phone}` }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: t('auth.toasts.resent') });
        setResendTimer(60);
        setOtp("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(t('auth.errors.server'));
    } finally {
      setIsLoading(false);
    }
  };

  // ============ Login ============
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t('auth.errors.allFieldsRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: `998${email}`, password }), // email contains 9 digits
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast({ title: t('auth.toasts.welcome') });
        navigate('/dashboard');
      } else {
        setError(data.error || t('auth.errors.loginFail'));
      }
    } catch (err) {
      setError(t('auth.errors.server'));
    } finally {
      setIsLoading(false);
    }
  };

  // ============ Titles & Subtitles ============
  const getStepTitle = () => {
    if (mode === 'login') return t('auth.welcomeBack');
    if (mode === 'recover') {
      switch (step) {
        case 1: return t('auth.recoverTitle');
        case 2: return t('auth.codeSentTitle');
        case 3: return t('auth.newPasswordTitle');
        default: return t('auth.recoverTitle');
      }
    }
    // Register
    switch (step) {
      case 1: return t('auth.joinWinners');
      case 2: return t('auth.verifyCode');
      case 3: return t('auth.enterInfo');
      case 4: return t('auth.setPassword');
      default: return t('auth.register');
    }
  };

  const getStepSubtitle = () => {
    if (mode === 'login') return t('auth.loginSubtitle', 'Hisobingizga kirish uchun formani to\'ldiring');
    if (mode === 'recover') {
      switch (step) {
        case 1: return t('auth.recoverSubtitle');
        case 2: return t('auth.codeSentSubtitle');
        case 3: return t('auth.newPasswordSubtitle');
        default: return "";
      }
    }
    // Register
    switch (step) {
      case 1: return t('auth.enterPhoneSubtitle', 'Olimpiada dunyosiga kirish uchun telefon raqamingizni kiriting');
      case 2: return `${t('auth.codeSentTo')} +998 ${phone}`;
      case 3: return t('auth.enterInfoSubtitle', 'O\'quvchi ma\'lumotlarini kiriting');
      case 4: return t('auth.setPasswordSubtitle', 'Xavfsiz parol o\'ylab toping');
      default: return "";
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0F0F1A] text-white">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-900/20 rounded-full blur-[120px] animate-blob mix-blend-screen" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] bg-amber-900/10 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
        <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
        <button
          onClick={() => {
            if (mode === 'recover' || mode === 'register') {
              navigate('/auth/login');
            } else {
              navigate('/');
            }
          }}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all duration-300 backdrop-blur-md group"
          title={mode === 'login' ? t('common.home') : t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>
        <div className="h-6 w-px bg-white/10 mx-1" /> {/* Divider */}
        <LanguageSwitcher />
      </div>

      {/* Floating Sparkles (Visual Flourish) */}
      <div className="absolute top-20 right-20 animate-pulse hidden lg:block">
        <Sparkles className="w-8 h-8 text-yellow-400 opacity-50" />
      </div>
      <div className="absolute bottom-40 left-20 animate-pulse animation-delay-1000 hidden lg:block">
        <Sparkles className="w-6 h-6 text-blue-400 opacity-50" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md h-auto bg-card/40 backdrop-blur-2xl border border-white/5 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">

        {/* Card Content */}
        <div className="w-full p-8 md:p-10 flex flex-col items-center justify-center relative bg-black/20">

          {/* Logo / Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Link to="/" className="flex flex-col items-center gap-3 mb-6 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#A855F7] flex items-center justify-center shadow-purple group-hover:scale-110 transition-transform duration-500">
                <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-gold" />
              </div>
              <h1 className="text-4xl font-black font-cinzel tracking-widest text-[#FFD700]">
                HOGWORDS
              </h1>
              <p className="text-sm font-medium italic text-muted-foreground/80 tracking-widest uppercase font-cinzel">
                Magic of Knowledge
              </p>
            </Link>

            <div key={animKey} className="animate-in slide-in-from-bottom-2 fade-in duration-500 mt-2">
              <h2 className="text-xl font-bold text-white">{getStepTitle()}</h2>
              <p className="text-xs text-muted-foreground mt-1">{getStepSubtitle()}</p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-200 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* AUTH FORM CONTENT */}
          <div className="flex-1 flex flex-col justify-center min-h-[300px]">
            {/* ====== LOGIN FORM ====== */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="group w-full text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block group-focus-within:text-primary transition-colors font-cinzel">{t('auth.phone')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 font-black">+998</span>
                    <input
                      type="tel"
                      value={email}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setEmail(val);
                      }}
                      placeholder="90 123 45 67"
                      className="w-full h-14 pl-16 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-white placeholder-gray-600 font-bold"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="group w-full text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block group-focus-within:text-primary transition-colors font-cinzel">{t('auth.password')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-white placeholder-gray-600 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-right mt-3">
                    <Link to="/auth/recover" className="text-xs font-bold text-primary/80 hover:text-primary transition-colors">
                      {t('auth.forgot')}
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 bg-gradient-to-r from-[#4B0082] to-[#6A0DAD] hover:from-[#6A0DAD] hover:to-[#7B68EE] text-white font-black uppercase tracking-widest rounded-xl shadow-purple transition-all hover:scale-[1.02] active:scale-[0.98] font-cinzel border border-[#FFD700]/20"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {isLoading ? t('auth_guide.loading') : t('auth.login')}
                </Button>

                <div className="text-center pt-6 border-t border-white/5">
                  <p className="text-sm text-muted-foreground font-medium">
                    {t('auth.noAccount')}{" "}
                    <Link to="/auth/register" className="text-primary font-black hover:underline tracking-tight">
                      {t('auth.register')}
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {/* ====== REGISTER STEP 1: PHONE ====== */}
            {mode === 'register' && step === 1 && (
              <form onSubmit={handleSendCode} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="group">
                  <label className="text-xs font-medium text-gray-400 ml-1 mb-1 block group-focus-within:text-[#FFD700] transition-colors">{t('auth.phone')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+998</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value).slice(0, 9))}
                      placeholder="90 123 45 67"
                      className="w-full h-14 pl-16 pr-4 rounded-xl bg-[#1A1A2E] border border-[#2C2C3E] focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/10 outline-none transition-all font-medium text-lg text-white placeholder-gray-600"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#4B0082]/10 border border-[#4B0082]/20 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#4B0082]/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#A855F7]" />
                  </div>
                  <div className="text-xs text-purple-200">
                    <span className="block font-bold mb-0.5">
                      {t('auth.secureRegistration')}
                    </span>
                    {t('auth.telegramCode')}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 bg-gradient-to-r from-[#4B0082] to-[#6A0DAD] hover:from-[#6A0DAD] hover:to-[#7B68EE] text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] border border-[#FFD700]/20"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {t('auth.getCode')} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="text-center pt-4 border-t border-white/5">
                  <p className="text-sm text-gray-400">
                    {t('auth.alreadyMember')}{" "}
                    <Link to="/auth/login" className="text-blue-400 font-bold hover:underline">
                      {t('auth.login')}
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {/* ====== REGISTER STEP 2: OTP ====== */}
            {mode === 'register' && step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex justify-center py-4">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup className="gap-2">
                      {/* Custom styled OTP slots via CSS in index.css or tailored classes */}
                      {[0, 1, 2].map((i) => (
                        <InputOTPSlot key={i} index={i} className="h-14 w-12 text-2xl border border-white/10 bg-white/5 text-white rounded-xl focus:border-blue-500 transition-all" />
                      ))}
                    </InputOTPGroup>
                    <div className="w-4" />
                    <InputOTPGroup className="gap-2">
                      {[3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} className="h-14 w-12 text-2xl border border-white/10 bg-white/5 text-white rounded-xl focus:border-blue-500 transition-all" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="text-center space-y-4">
                  {resendTimer > 0 ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-gray-400 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-blue-400 hover:text-white transition-colors text-sm font-bold"
                      disabled={isLoading}
                    >
                      {t('auth.resend')}
                    </button>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-[#4B0082] to-[#6A0DAD] hover:from-[#6A0DAD] hover:to-[#7B68EE] text-white font-bold rounded-xl shadow-lg border border-[#FFD700]/20"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {t('auth.verify')}
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(""); setError(""); }}
                    className="text-sm text-gray-500 hover:text-[#FFD700] transition-colors"
                  >
                    ← {t('auth.errors.phoneRequired')}? {t('common.change')}
                  </button>
                </div>
              </form>
            )}

            {/* ====== REGISTER STEP 3: INFO ====== */}
            {mode === 'register' && step === 3 && (
              <form onSubmit={handleStudentInfoSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">{t('auth.firstName')}</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">{t('auth.lastName')}</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 ml-1">{t('auth.birthDate')}</label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Region Selection */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1 font-medium">{t('auth.region')}</label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-blue-500/50">
                        <SelectValue placeholder={t('common.select') + "..."} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111114] border-white/10 text-white">
                        {REGIONS.map(r => (
                          <SelectItem key={r} value={r} className="focus:bg-white/10 focus:text-white">
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Grade Selection */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1 font-medium">{t('auth.grade')}</label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-blue-500/50">
                        <SelectValue placeholder={t('common.select') + "..."} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111114] border-white/10 text-white">
                        {GRADES.map(g => (
                          <SelectItem key={g.value} value={g.value} className="focus:bg-white/10 focus:text-white">
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* School/University Selection */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 ml-1 font-medium">
                    {grade === 'STUDENT' ? t('auth.university') : t('auth.school')}
                  </label>
                  <div className="relative group">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      placeholder={grade === 'STUDENT' ? t('auth.placeholders.university', 'OTM nomini kiriting') : t('auth.placeholders.school')}
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      required
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 outline-none text-white placeholder:text-gray-500 transition-all focus:bg-white/10"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <Button type="submit" size="lg" className="flex-1 h-14 bg-gradient-to-r from-[#4B0082] to-[#6A0DAD] font-bold rounded-xl text-white border border-[#FFD700]/20 shadow-purple">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.savePassword')}
                  </Button>
                </div>
              </form>
            )}

            {/* ====== REGISTER STEP 4: PASSWORD ====== */}
            {mode === 'register' && step === 4 && (
              <form onSubmit={handleCompleteRegistration} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">{t('auth.password')}</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.placeholders.password', 'Kamida 6 ta belgi')} required
                        className="w-full h-14 pl-4 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none text-white" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">{t('auth.confirmPassword')}</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('auth.confirmPassword')} required
                      className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none text-white" />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setStep(3)} className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <Button type="submit" size="lg" className="flex-1 h-14 bg-gradient-to-r from-[#4B0082] to-[#6A0DAD] hover:from-[#6A0DAD] hover:to-[#7B68EE] text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 border border-[#FFD700]/10" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{t('auth.finish')} <CheckCircle2 className="inline w-5 h-5 ml-1" /></span>}
                  </Button>
                </div>
              </form>
            )}

            {/* ====== RECOVER STEP 1: PHONE ====== */}
            {mode === 'recover' && step === 1 && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                if (!phone || phone.length < 9) return setError(t('auth.errors.phoneRequired', "Telefon raqamni to'liq kiriting"));

                setIsLoading(true);
                try {
                  // Using the dedicated forgot-password endpoint
                  const res = await fetch(`${API_BASE}/auth/forgot-password/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: `+998${phone}` }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setStep(2);
                    setResendTimer(60);
                    toast({ title: t('auth.codeSentTitle'), description: t('auth.codeSentSubtitle') });
                  } else {
                    setError(data.error || "Xatolik");
                  }
                } catch (err) { setError(t('common.serverError')); }
                finally { setIsLoading(false); }
              }} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="group">
                  <label className="text-xs font-medium text-gray-400 ml-1 mb-1 block group-focus-within:text-yellow-400 transition-colors">{t('auth.phone')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+998</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value).slice(0, 9))}
                      placeholder="90 123 45 67"
                      className="w-full h-14 pl-16 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-500 focus:bg-white/10 focus:ring-4 focus:ring-yellow-500/10 outline-none transition-all font-medium text-lg text-white placeholder-gray-600"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-yellow-900/20 transition-all hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {t('auth.sendCode')}
                </Button>
              </form>
            )}

            {/* ====== RECOVER STEP 2: OTP ====== */}
            {mode === 'recover' && step === 2 && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                if (otp.length !== 6) return setError("Kodni to'liq kiriting");

                setIsLoading(true);
                try {
                  const res = await fetch(`${API_BASE}/auth/verify-reset-code/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: `+998${phone}`, code: otp })
                  });
                  const data = await res.json();
                  if (data.success) {
                    setStep(3); // Go to new password
                    toast({ title: "Kod tasdiqlandi" });
                  } else {
                    setError(data.error || "Kod xato");
                  }
                } catch (err) { setError(t('common.serverError')); }
                finally { setIsLoading(false); }
              }} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex justify-center py-4">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2].map((i) => (
                        <InputOTPSlot key={i} index={i} className="h-14 w-12 text-2xl border border-white/10 bg-white/5 text-white rounded-xl focus:border-yellow-500 transition-all" />
                      ))}
                    </InputOTPGroup>
                    <div className="w-4" />
                    <InputOTPGroup className="gap-2">
                      {[3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} className="h-14 w-12 text-2xl border border-white/10 bg-white/5 text-white rounded-xl focus:border-yellow-500 transition-all" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="text-center space-y-4">
                  {resendTimer > 0 ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-gray-400 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        // Similar to handleResendCode but could reuse forgot-password logic
                        setIsLoading(true); // Simplified inline resend
                        try {
                          await fetch(`${API_BASE}/auth/forgot-password/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone: `+998${phone}` })
                          });
                          setResendTimer(60);
                          toast({ title: t('auth.codeSentTitle') });
                        } catch (e) { }
                        finally { setIsLoading(false); }
                      }}
                      className="text-yellow-400 hover:text-white transition-colors text-sm font-bold"
                      disabled={isLoading}
                    >
                      {t('auth.resendQuestion')}
                    </button>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {t('common.next')}
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(""); setError(""); }}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors block mx-auto mt-4"
                  >
                    ← {t('auth.phone')}ni o'zgartirish
                  </button>
                </div>
              </form>
            )}

            {/* ====== RECOVER STEP 3: NEW PASSWORD ====== */}
            {mode === 'recover' && step === 3 && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                if (password.length < 8) return setError("Parol kamida 8 belgi bo'lishi kerak");
                if (password !== confirmPassword) return setError(t('auth.errors.passwordMismatch', "Parollar mos kelmadi"));

                setIsLoading(true);
                try {
                  const res = await fetch(`${API_BASE}/auth/reset-password/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      phone: `+998${phone}`,
                      code: otp,
                      new_password: password
                    })
                  });
                  const data = await res.json();
                  if (data.success) {
                    toast({ title: "Parol yangilandi!", description: "Endi yangi parol bilan kirishingiz mumkin." });
                    navigate('/auth/login');
                  } else {
                    setError(data.error || "Xatolik");
                  }
                } catch (err) { setError(t('common.serverError')); }
                finally { setIsLoading(false); }
              }} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">{t('auth.newPasswordTitle')}</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******"
                        className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-500 outline-none text-white" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">{t('auth.confirmPassword')}</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="******"
                      className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-yellow-500 outline-none text-white" />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <Button type="submit" size="lg" className="flex-1 h-14 bg-gradient-to-r from-yellow-600 to-orange-600 font-bold rounded-xl text-white">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.save')}
                  </Button>
                </div>

              </form>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-muted-foreground/50 font-medium">
              &copy; {new Date().getFullYear()} Hogwords Olimpiada. {t('auth.footer.rights')} <br />
              {t('auth.footer.secure')}
            </p>
          </div>
        </div>
        <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .shake {
          animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
      </div>
    </div>
  );
};

export default AuthPage;
