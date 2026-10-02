import { Flame, Circle, XCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DayStatus {
    day: string;
    date: string;
    status: 'COMPLETED' | 'MISSED' | 'PENDING';
}

const translateDay = (dayStr: string) => {
    const days: Record<string, string> = {
        'Mon': 'Dush', 'Tue': 'Sesh', 'Wed': 'Chor', 'Thu': 'Pay', 'Fri': 'Juma', 'Sat': 'Shan', 'Sun': 'Yak'
    };
    return days[dayStr] || dayStr;
};

const StreakCalendar = ({ calendar }: { calendar: DayStatus[] }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-card border border-border rounded-2xl p-4 md:p-6 backdrop-blur-sm">
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4">{t('dashboard.calendar.activity', "So'nggi 7 kunlik faollik")}</h3>
            <div className="overflow-x-auto pb-2 -mx-2 px-2 md:mx-0 md:px-0">
                <div className="flex justify-between md:justify-around items-center min-w-[320px] gap-2">
                    {calendar.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group cursor-default flex-1 min-w-[40px]">
                            <span className={`text-[10px] md:text-xs font-bold ${day.status === 'COMPLETED' ? 'text-foreground' : 'text-muted-foreground'}`}>{translateDay(day.day)}</span>

                            <div className={`
                                w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-300 border
                                ${day.status === 'COMPLETED' ? 'bg-primary/20 border-primary/40 text-primary shadow-gold scale-110' : ''}
                                ${day.status === 'MISSED' ? 'bg-red-500/10 border-red-500/20 text-muted-foreground opacity-50' : ''}
                                ${day.status === 'PENDING' ? 'bg-muted border-muted-foreground/20 text-muted-foreground border-dashed' : ''}
                            `}>
                                {day.status === 'COMPLETED' && <Flame className="w-4 h-4 md:w-5 md:h-5 fill-primary" />}
                                {day.status === 'MISSED' && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-muted-foreground" />}
                                {day.status === 'PENDING' && <Circle className="w-3 h-3 md:w-4 md:h-4" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StreakCalendar;
