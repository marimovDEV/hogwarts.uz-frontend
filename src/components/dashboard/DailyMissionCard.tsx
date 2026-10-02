import { Play, Sparkles, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { translateBackendText } from '@/utils/backendTranslations';

interface Mission {
    type: string;
    title: string;
    subtitle: string;
    duration: string;
    xp_reward: number;
    link: string;
    is_completed?: boolean;
    is_streak_saved?: boolean;
}

const DailyMissionCard = ({ mission }: { mission: Mission }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isDone = mission.is_completed;

    const handleAction = () => {
        if (!isDone && mission.link) {
            navigate(mission.link);
        }
    };

    return (
        <div className="relative group h-full">
            {/* Pulsing Border */}
            <div className={`absolute -inset-1 rounded-2xl opacity-40 blur-lg group-hover:opacity-60 group-hover:blur-xl transition-all duration-500 animate-pulse-soft bg-gradient-to-r from-primary/60 via-primary-light/40 to-primary/60`}></div>

            <div className="relative bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center space-y-4 shadow-2xl overflow-hidden h-full">

                {/* Background Decoration */}
                <div className={`absolute inset-0 opacity-10 ${isDone ? 'bg-primary/20' : 'bg-primary/5'}`}></div>

                {/* Header */}
                <div className="space-y-1 relative z-10">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest font-cinzel ${isDone
                        ? 'bg-primary/20 border-primary/30 text-primary'
                        : 'bg-primary/10 border-primary/20 text-primary-light animate-pulse'
                        }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {isDone
                            ? t('dashboard.mission.completed')
                            : (mission.is_streak_saved ? t('dashboard.mission.next') : t('dashboard.mission.today'))}
                    </div>
                    <h3 className="text-2xl font-black text-foreground leading-tight">
                        {mission.type === 'GENERIC' ? t(mission.title) : translateBackendText(mission.title)}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium">
                        {mission.type === 'GENERIC' ? t(mission.subtitle) : translateBackendText(mission.subtitle)}
                    </p>
                </div>

                {/* Details */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs font-black text-muted-foreground bg-black/40 p-4 rounded-xl border border-white/5 w-full justify-center relative z-10 font-cinzel">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {mission.duration}
                    </div>
                    <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
                    <div className="flex items-center gap-2 text-primary">
                        <Zap className={`w-4 h-4 ${isDone ? 'fill-primary' : 'animate-pulse'}`} />
                        +{mission.xp_reward} XP
                    </div>
                </div>

                {/* Action Button */}
                <div className="w-full relative z-20">
                    <Button
                        onClick={handleAction}
                        disabled={isDone}
                        className={`w-full h-12 sm:h-14 font-black uppercase tracking-widest text-sm rounded-xl shadow-gold transition-all hover:scale-[1.02] active:scale-[0.98] font-cinzel ${isDone
                            ? 'bg-primary/20 text-primary cursor-default shadow-none border border-primary/20'
                            : 'bg-primary text-primary-foreground hover:bg-primary-light'
                            }`}>
                        {isDone ? (
                            <><CheckCircle2 className="w-5 h-5 mr-2" /> {t('dashboard.mission.finished')}</>
                        ) : (
                            <><Play className="w-5 h-5 mr-2 fill-primary-foreground" /> {t('dashboard.mission.start')}</>
                        )}
                    </Button>
                </div>

                <p className={`text-[10px] sm:text-xs text-center font-medium relative z-10 ${isDone ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                    {isDone
                        ? t('dashboard.mission.success_msg')
                        : (mission.is_streak_saved ? t('dashboard.streak.saved_msg') : t('dashboard.mission.warning'))}
                </p>
            </div>
        </div>
    );
};

export default DailyMissionCard;
