import { Button } from "@/components/ui/button";
import { Calendar, Users, ChevronRight, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CompactOlympiadSection = () => {
    const { t, i18n } = useTranslation();

    const upcomingOlympiads = [
        {
            id: 1,
            title: i18n.language === 'uz' ? "Matematika Respublika Olimpiadasi" : "Республиканская Олимпиада по Математике",
            subject: i18n.language === 'uz' ? "Matematika" : "Математика",
            date: i18n.language === 'uz' ? "20-yanvar, 10:00" : "20 января, 10:00",
            duration: `3 ${t('common.hours')}`,
            participants: 847,
            price: "50,000",
            color: "bg-blue-500",
            lightColor: "bg-blue-500/10 text-blue-500"
        },
        {
            id: 2,
            title: i18n.language === 'uz' ? "Fizika Challenge" : "Физика Challenge",
            subject: i18n.language === 'uz' ? "Fizika" : "Физика",
            date: i18n.language === 'uz' ? "25-yanvar, 14:00" : "25 января, 14:00",
            duration: `2 ${t('common.hours')}`,
            participants: 342,
            price: "35,000",
            color: "bg-emerald-500",
            lightColor: "bg-emerald-500/10 text-emerald-500"
        },
        {
            id: 3,
            title: i18n.language === 'uz' ? "Informatika Hackathon" : "Хакатон по Информатике",
            subject: i18n.language === 'uz' ? "Informatika" : "Информатика",
            date: i18n.language === 'uz' ? "1-fevral, 09:00" : "1 февраля, 09:00",
            duration: `4 ${t('common.hours')}`,
            participants: 521,
            price: "75,000",
            color: "bg-orange-500",
            lightColor: "bg-orange-500/10 text-orange-500"
        },
        {
            id: 4,
            title: i18n.language === 'uz' ? "Ingliz tili Mock" : "Английский Mock",
            subject: i18n.language === 'uz' ? "Ingliz tili" : "Английский язык",
            date: i18n.language === 'uz' ? "5-fevral, 11:00" : "5 февраля, 11:00",
            duration: `3 ${t('common.hours')}`,
            participants: 120,
            price: "100,000",
            color: "bg-purple-500",
            lightColor: "bg-purple-500/10 text-purple-500"
        }
    ];

    return (
        <section id="olympiad" className="py-12 bg-background border-y border-border/40">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <span className="text-sm font-bold text-primary uppercase tracking-wider mb-2 block">{t('olympiadsSection.badge')}</span>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('olympiadsSection.all_olympiads').replace('<1>', '').replace('</1>', '')}</h2>
                    </div>
                    <Link to="/all-olympiads">
                        <Button variant="ghost" size="sm" className="hidden md:flex hover:bg-muted">
                            {t('olympiadsSection.all')} <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>

                {/* Ultra-Compact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {upcomingOlympiads.map((olympiad) => (
                        <div key={olympiad.id} className="group bg-card border border-border/50 hover:border-primary/50 transition-all rounded-xl p-4 hover:shadow-lg flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-lg ${olympiad.lightColor} flex items-center justify-center`}>
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold block text-primary">{olympiad.price}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">{t('olympiadsSection.currency')}</span>
                                </div>
                            </div>

                            <h3 className="font-bold text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                                {olympiad.title}
                            </h3>

                            <div className="space-y-1 text-xs text-muted-foreground mb-4 flex-1">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 opacity-70" /> {olympiad.date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 opacity-70" /> {olympiad.participants}
                                </div>
                            </div>

                            <Link to="/auth" className="w-full">
                                <Button className="w-full h-8 text-xs rounded-lg font-medium bg-primary/10 text-primary hover:bg-primary hover:text-white border-0 shadow-none">
                                    {t('olympiadsSection.join')}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-6 md:hidden text-center">
                    <Link to="/all-olympiads">
                        <Button variant="outline" size="sm" className="w-full">
                            {t('olympiadsSection.all')}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CompactOlympiadSection;
