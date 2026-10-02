import { API_URL as API_BASE } from "@/services/api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Calendar,
  Clock,
  Search,
  BookOpen,
  AlertTriangle,
  PlayCircle,
  FileText,
  CheckCircle2,
  Hourglass,
  ArrowRight
} from "lucide-react";
import { useTranslation } from "react-i18next";


const OlympiadsPage = () => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("allSubjects");
  const [selectedStatus, setSelectedStatus] = useState("allStatus");
  const [olympiads, setOlympiads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tr = (text: string) => {
    if (!text) return '';
    const cleanText = text.trim();
    const lang = i18n.language.split('-')[0];
    const mappings: Record<string, Record<string, string>> = {
      'Matematika': { 'ru': 'Математика', 'uz': 'Matematika' },
      'Fizika': { 'ru': 'Физика', 'uz': 'Fizika' },
      'Ingliz tili': { 'ru': 'Английский язык', 'uz': 'Ingliz tili' },
      "Matematika Bo'yicha Sinov Olimpiadasi": { "ru": "Тестовая Олимпиада по Математике", "uz": "Matematika Bo'yicha Sinov Olimpiadasi" }
    };
    if (mappings[cleanText] && mappings[cleanText][lang]) return mappings[cleanText][lang];
    return t(cleanText, { keySeparator: false, defaultValue: cleanText });
  };

  useEffect(() => {
    fetchOlympiads();
  }, []);

  const fetchOlympiads = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/olympiads/`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        setOlympiads(list);
      }
    } catch (error) {
      console.error("Failed to fetch olympiads", error);
    } finally {
      setLoading(false);
    }
  };

  const subjects = ["allSubjects", "math", "physics", "informatics", "chemistry", "english", "biology"];
  const statuses = ["allStatus", "upcoming", "registered", "completed"];

  const filteredOlympiads = olympiads.filter((o) => {
    const matchesSearch = o.title.toLowerCase().includes(search.toLowerCase());

    // Subject filter (backend uses english lower case usually)
    const matchesSubject = selectedSubject === "allSubjects" || String(o.subject || "").toLowerCase() === selectedSubject;

    // Status filter
    let matchesStatus = true;
    if (selectedStatus === "allStatus") matchesStatus = true;
    else if (selectedStatus === "registered") matchesStatus = o.is_registered;
    else matchesStatus = String(o.status || "").toLowerCase() === selectedStatus;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const getStatusBadge = (status: string, urgency: string) => {
    // Map backend status to UI
    const s = String(status || "").toLowerCase();
    if (s === 'registered') return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {t('olympiadsPage.badges.registered')}</span>;
    if (s === 'completed') return <span className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FileText className="w-3 h-3" /> {t('olympiadsPage.badges.completed')}</span>;
    if (urgency === 'high') return <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse"><AlertTriangle className="w-3 h-3" /> {t('olympiadsPage.badges.closingSoon')}</span>;
    return <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Hourglass className="w-3 h-3" /> {t('olympiadsPage.badges.open')}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto min-h-screen">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('olympiadsPage.title')}</h1>
          <p className="text-muted-foreground">{t('olympiadsPage.subtitle')}</p>
        </div>

        {/* Simple Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('olympiadsPage.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 rounded-xl border border-border bg-card text-foreground focus:border-primary outline-none"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-foreground outline-none"
          >
            {statuses.map(s => <option key={s} value={s}>{t(`olympiadsPage.filters.${s}`)}</option>)}
          </select>
        </div>
      </div>

      {filteredOlympiads.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border border-dashed">
          <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">{t('common.noResults')}</h3>
          <p className="text-sm text-muted-foreground mt-2">{t('common.tryDifferentFilter')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOlympiads.map((olympiad) => {
            // Infer details for UI since api doesn't return everything yet
            // urgency logic
            let urgency = 'low';
            const startDate = new Date(olympiad.start_date);
            const now = new Date();
            const diffDays = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays <= 3 && diffDays > 0) urgency = 'high';

            return (
              <div key={olympiad.id} className="bg-card rounded-[1.5rem] border border-border shadow-sm hover:shadow-xl transition-all flex flex-col overflow-hidden group">

                {/* Header (Gradient) */}
                <div className={`p-6 pb-8 relative ${olympiad.status === 'COMPLETED' ? 'bg-muted' : 'bg-gradient-to-br from-gray-900 to-gray-800'}`}>
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {getStatusBadge(olympiad.is_registered ? 'registered' : olympiad.status, urgency)}
                  </div>

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg ${olympiad.status === 'COMPLETED' ? 'bg-card text-muted-foreground' : 'bg-white/10 backdrop-blur text-white'}`}>
                    <Trophy className="w-6 h-6" />
                  </div>

                  <h3 className={`text-xl font-bold mb-1 leading-tight ${olympiad.status === 'COMPLETED' ? 'text-muted-foreground' : 'text-white'}`}>
                    {tr(olympiad.title)}
                  </h3>

                  {/* Timeline / Urgency */}
                  {olympiad.status === 'REGISTRATION_OPEN' && !olympiad.is_registered && (
                    <div className="flex items-center gap-2 mt-4 text-orange-300 text-sm font-bold bg-orange-400/10 inline-flex px-3 py-1 rounded-lg border border-orange-400/20">
                      <Clock className="w-4 h-4" />
                      {diffDays > 0 ? `${diffDays} ${t('olympiadsPage.badges.daysLeft')}` : t('olympiadsPage.badges.closingSoon')}
                    </div>
                  )}
                </div>

                {/* Details Grid (Trust Builders) */}
                <div className="px-6 -mt-4 relative z-10">
                  <div className="bg-card rounded-xl shadow-lg border border-border p-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase block">{t('olympiadsPage.card.format')}</span>
                      <span className="text-sm font-bold text-foreground">{t('common.online')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase block">{t('olympiadsPage.card.questions')}</span>
                      <span className="text-sm font-bold text-foreground">{olympiad.questions_count || 30} {t('olympiadsPage.card.questionsCount')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase block">{t('olympiadsPage.card.grade')}</span>
                      <span className="text-sm font-bold text-foreground">{olympiad.grade_range || t('olympiadsPage.card.allStudents')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase block">{t('olympiadsPage.card.passingScore')}</span>
                      <span className="text-sm font-bold text-green-600">60%</span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(olympiad.start_date).toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU')}
                    </div>
                    <div className="font-bold text-blue-600">
                      {olympiad.price === 0 ? t('olympiadsPage.card.free') : `${parseFloat(olympiad.price).toLocaleString()} ${t('olympiadsSection.currency')}`}
                    </div>
                  </div>

                  <div className="mt-auto pt-2">
                    {olympiad.is_registered ? (
                      olympiad.is_completed ? (
                        <Link to={`/olympiad/${olympiad.id}/result`}>
                          <Button variant="outline" className="w-full h-12 rounded-xl group/btn">
                            {t('olympiadsPage.card.viewResults')}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/olympiad/${olympiad.id}`}>
                          <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-xl">
                            <PlayCircle className="w-5 h-5 mr-2" />
                            {t('olympiadsPage.card.enter')}
                          </Button>
                        </Link>
                      )
                    ) : olympiad.status === 'COMPLETED' ? (
                      <Link to={`/olympiad/${olympiad.id}/result`}>
                        <Button variant="outline" className="w-full h-12 rounded-xl group/btn">
                          {t('olympiadsPage.card.viewResults')}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/olympiad/${olympiad.id}`}>
                        <Button className="w-full bg-gray-900 dark:bg-primary/90 hover:bg-blue-600 dark:hover:bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-gray-200 dark:shadow-none hover:shadow-blue-200 transition-all">
                          {t('olympiadsPage.card.participate')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OlympiadsPage;
