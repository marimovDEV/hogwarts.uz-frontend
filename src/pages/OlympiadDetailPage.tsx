import { API_URL as API_BASE, getImageUrl } from "@/services/api";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Trophy, Clock, Users, Calendar, ArrowLeft, CheckCircle2,
  AlertTriangle, Shield, Award, Timer, ArrowRight, Play, Loader2, Gift, Check as CheckIcon
} from "lucide-react";
import ArdCoin from "@/components/ArdCoin";
import PaymentModal from "@/components/payment/PaymentModal";



// Fallback translations for backend data that doesn't have keys
const BACKEND_TRANSLATIONS: Record<string, Record<string, string>> = {
  'Informatika': {
    'ru': 'Информатика',
    'uz': 'Informatika'
  },
  'Matematika': {
    'ru': 'Математика',
    'uz': 'Matematika'
  },
  'Mateamtika': {
    'ru': 'Математика',
    'uz': 'Matematika'
  },
  'Fizika': {
    'ru': 'Физика',
    'uz': 'Fizika'
  },
  'Ingliz tili': {
    'ru': 'Английский язык',
    'uz': 'Ingliz tili'
  },
  "Matematika Bo'yicha Sinov Olimpiadasi": {
    "ru": "Тестовая Олимпиада по Математике",
    "uz": "Matematika Bo'yicha Sinov Olimpiadasi"
  },
  "Tizimni test qilish uchun maxsus yaratilgan matematika olimpiadasi. Bu orqali savollar, vaqt cheklovi va natijalarni hisoblash funksiyalarini tekshirib ko'rishingiz mumkin.": {
    "ru": "Специально созданная математическая олимпиада для тестирования системы. Здесь вы можете проверить вопросы, ограничение по времени и функции расчета результатов.",
    "uz": "Tizimni test qilish uchun maxsus yaratilgan matematika olimpiadasi. Bu orqali savollar, vaqt cheklovi va natijalarni hisoblash funksiyalarini tekshirib ko'rishingiz mumkin."
  },
  'Informatika Challenge': {
    'ru': 'Informatika Challenge',
    'uz': 'Informatika Challenge'
  },
  "Dasturlash va algoritmlar bo'yicha musobaqa.": {
    'ru': 'Соревнование по программированию и алгоритмам.',
    'uz': "Dasturlash va algoritmlar bo'yicha musobaqa."
  }
};

const OlympiadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const backPath = localStorage.getItem('token') ? '/olympiads' : '/all-olympiads';

  const tr = (text: string) => {
    if (!text) return '';
    const cleanText = text.trim();
    const lang = i18n.language.split('-')[0]; // Handle ru-RU, uz-UZ -> ru, uz

    // Try explicit map first
    if (BACKEND_TRANSLATIONS[cleanText] && BACKEND_TRANSLATIONS[cleanText][lang]) {
      return BACKEND_TRANSLATIONS[cleanText][lang];
    }
    // Try i18n key with normalization (trim)
    return t(cleanText, { keySeparator: false, defaultValue: cleanText });
  };

  const formatTimeRemaining = (time: string) => {
    if (!time) return '';

    // If it's already in old Uzbek format, try to replace it manually just in case backend didn't update
    let result = time;
    if (time.includes('soat') || time.includes('daqiqa') || time.includes('kun')) {
      result = result
        .replace(/kun/g, t('common.days'))
        .replace(/soat/g, t('common.hours'))
        .replace(/daqiqa/g, t('common.minutes'));
      return result;
    }

    // Backend returns "Xd Xh Xm" or "Xh Xm"
    return result
      .replace('d', ` ${t('common.days')}`)
      .replace('h', ` ${t('common.hours')}`)
      .replace('m', ` ${t('common.minutes')}`);
  };

  const [olympiad, setOlympiad] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Wallet State
  const [userBalance, setUserBalance] = useState<number>(0);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    loadOlympiad();
    loadUserBalance();
  }, [id]);

  const loadUserBalance = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.balance !== undefined) {
        setUserBalance(parseFloat(user.balance));
      }
    }
  };

  const loadOlympiad = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/olympiads/${id}/`, { headers });
      if (res.ok) {
        const data = await res.json();

        setOlympiad(data);
        setIsRegistered(data.is_registered);
        if (token) {
          checkRegistration(token);
        }
      } else {
        navigate(backPath);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkRegistration = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/olympiads/my_registrations/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('My Registrations:', data);

        let list: any[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data.registrations && Array.isArray(data.registrations)) {
          list = data.registrations;
        } else if (data.results && Array.isArray(data.results)) {
          list = data.results;
        }

        const isReg = list.some((r: any) => r.olympiad.id === Number(id));
        console.log('Is Registered:', isReg);
        setIsRegistered(isReg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/auth/login');
      return;
    }

    // Check balance
    if (olympiad.price > 0 && userBalance < olympiad.price) {
      setShowPayModal(true);
      return;
    }

    if (!confirm(t('dashboard.olympiadDetail.confirmPay', { amount: olympiad.price }))) return;

    setIsPurchasing(true);
    try {
      const res = await fetch(`${API_BASE}/wallet/purchase/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'OLYMPIAD',
          id: olympiad.id
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsRegistered(true);
        sonnerToast.success(t(data.message) || t('dashboard.olympiadDetail.successRegister'));

        // Update balance
        setUserBalance(data.balance);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          u.balance = data.balance;
          localStorage.setItem('user', JSON.stringify(u));
        }
      } else {
        sonnerToast.error(t(data.error) || t('common.error'));
      }
    } catch (err) {
      sonnerToast.error(t('dashboard.olympiadDetail.serverError'));
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleStart = () => {
    navigate(`/olympiad/${id}/test`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!olympiad) return null;

  const isFree = olympiad.price === 0;

  const totalScore = olympiad.total_score || (olympiad.questions?.reduce((acc: number, q: any) => acc + (q.points || 0), 0)) || 0;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <div className="flex-1 animate-fade-in">
        <div className="container mx-auto px-4 py-6 animate-fade-in">
          <Link
            to={backPath}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('dashboard.olympiadDetail.back')}
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero */}
              <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMiA0LTJ6bTAgMGMwIDItMiA0LTIgNHMtMi0yLTItNC0yLTQgMi00IDIgMiAyIDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                      {olympiad.thumbnail ? (
                        <img src={getImageUrl(olympiad.thumbnail)} alt="" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <Trophy className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium border border-white/10 backdrop-blur-md">
                        {tr(olympiad.subject) || 'Olimpiada'}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{tr(olympiad.title)}</h1>
                  <p className="text-white/80 max-w-2xl leading-relaxed">
                    {tr(olympiad.description) || t('hero.description')}
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center hover:shadow-md transition-all">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="font-bold text-foreground">
                    {new Date(olympiad.start_date).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.olympiadDetail.date')}</div>
                </div>
                <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center hover:shadow-md transition-all">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <div className="font-bold text-foreground">
                    {new Date(olympiad.start_date).toLocaleTimeString(i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.olympiadDetail.start')}</div>
                </div>
                <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center hover:shadow-md transition-all">
                  <Timer className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <div className="font-bold text-foreground">{olympiad.duration}</div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.olympiadDetail.duration')}</div>
                </div>
                <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center hover:shadow-md transition-all">
                  <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <div className="font-bold text-foreground">{olympiad.participants_count || 0}/{olympiad.max_participants || '∞'}</div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.olympiadDetail.participants')}</div>
                </div>
              </div>

              {/* Rules */}
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                  <Shield className="w-6 h-6 text-blue-600" />
                  {t('dashboard.olympiadDetail.rules')}
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      {t('dashboard.olympiadDetail.rulesList.rule1')}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      {t('dashboard.olympiadDetail.rulesList.rule2')}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      {t('dashboard.olympiadDetail.rulesList.rule3')} ({olympiad.xp_reward} XP).
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-3xl shadow-lg border border-border p-6 sticky top-24">
                <div className="text-center mb-6">
                  {isRegistered ? (
                    <div className="flex flex-col items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                      <span className="text-lg font-bold text-green-700 dark:text-green-400">{t('dashboard.olympiadDetail.registered')}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      {isFree ? (
                        <div className="text-3xl font-black text-green-600 dark:text-green-400">{t('dashboard.olympiadDetail.free')}</div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <ArdCoin amount={olympiad.price} size="xl" />
                          </div>
                          <p className="text-sm text-muted-foreground">{t('dashboard.olympiadDetail.priceLabel')}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('dashboard.olympiadDetail.subject')}</span>
                    <span className="font-medium text-foreground">{tr(olympiad.subject)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('dashboard.olympiadDetail.questions')}</span>
                    <span className="font-medium text-foreground">{olympiad.questions_count || 0} {t('dashboard.olympiadDetail.questionsCount')}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('dashboard.olympiadDetail.grade')}</span>
                    <span className="font-medium text-foreground">{olympiad.grade_range || t('dashboard.olympiadDetail.allStudents')}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{t('dashboard.olympiadDetail.maxScore')}</span>
                    <span className="font-medium text-green-600 dark:text-green-400 font-bold">{totalScore} {t('dashboard.olympiadDetail.scoreUnit')}</span>
                  </div>
                </div>

                {!isRegistered && (olympiad.status === 'REGISTRATION_OPEN' || olympiad.status === 'ONGOING') ? (
                  <>
                    {/* Agreement */}
                    <label className="flex items-start gap-3 mb-6 cursor-pointer group select-none">
                      <div className="relative flex items-center mt-0.5">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-input transition-all checked:border-blue-500 checked:bg-blue-500"
                        />
                        <CheckIcon className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                        {t('dashboard.olympiadDetail.agreement')}
                      </span>
                    </label>

                    {/* Balance Warning */}
                    {!isFree && userBalance < olympiad.price && (
                      <div className="text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-800 mb-4">
                        {t('dashboard.olympiadDetail.insufficientBalance')} ({userBalance.toLocaleString()} AC)
                      </div>
                    )}

                    <Button
                      className={`w-full h-12 text-lg font-bold rounded-xl shadow-lg transition-all
                        ${isFree
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-orange-500/20'
                        }`}
                      disabled={!agreed || isPurchasing}
                      onClick={handlePayment}
                    >
                      {isPurchasing ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Trophy className="w-5 h-5 mr-2" />
                      )}
                      {isPurchasing ? t('dashboard.olympiadDetail.processing') : isFree ? t('dashboard.olympiadDetail.joinFree') : t('dashboard.olympiadDetail.payAndJoin')}
                    </Button>
                  </>
                ) : isRegistered ? (
                  <div className="space-y-6">
                    {/* Status Sections for Registered Users */}
                    {olympiad.status === 'REGISTRATION_OPEN' && (
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-500/20 text-center">
                        <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                          Olimpiada boshlanishiga
                        </h3>
                        <div className="text-3xl font-mono font-bold text-primary mb-2">
                          {formatTimeRemaining(olympiad.time_remaining) || "Tez orada"}
                        </div>
                      </div>
                    )}

                    {olympiad.status === 'ONGOING' && (
                      <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20 text-center">
                        <h3 className="text-sm uppercase tracking-wider text-green-700 dark:text-green-400 mb-4 font-bold flex items-center justify-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                          Hozirda jarayonda
                        </h3>
                        {olympiad.is_completed ? (
                          <Button
                            className="w-full h-14 text-xl font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20"
                            onClick={() => navigate(`/olympiad/${id}/result`)}
                          >
                            <Award className="w-6 h-6 mr-3" />
                            Natijalarni ko'rish
                          </Button>
                        ) : (
                          <Button
                            className="w-full h-14 text-xl font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                            onClick={handleStart}
                          >
                            <Play className="w-6 h-6 mr-3" />
                            Testni boshlash
                          </Button>
                        )}
                      </div>
                    )}

                    {(olympiad.status === 'CHECKING' || (olympiad.status === 'COMPLETED' && !olympiad.results_published)) && (
                      <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-500/20 text-center">
                        <Timer className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-bold text-amber-900 dark:text-amber-400 mb-2">Natijalar kutilmoqda</h3>
                        <p className="text-xs text-muted-foreground">Adminlar natijalarni tekshirishmoqda. Tez orada e'lon qilinadi.</p>
                      </div>
                    )}

                    {olympiad.status === 'PUBLISHED' && (
                      <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-500/20 text-center">
                        <Award className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                        <h3 className="font-bold text-purple-900 dark:text-purple-400 mb-4">Olimpiada yakunlandi</h3>
                        <Button
                          className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold"
                          onClick={() => navigate(`/olympiad/${id}/result`)}
                        >
                          Natijalarni ko'rish
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-muted rounded-2xl text-center border border-border">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Ushbu olimpiada uchun ro'yxatdan o'tish bekor qilingan yoki vaqti o'tib ketgan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <PaymentModal
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          requiredAmount={olympiad ? Math.max(0, olympiad.price - userBalance) : 0}
          onSuccess={(newBalance) => {
            setUserBalance(newBalance);
            sonnerToast.info(t('success.balance_topped_up'));
          }}
        />
      </div>

    </div>
  );
};

export default OlympiadDetailPage;
