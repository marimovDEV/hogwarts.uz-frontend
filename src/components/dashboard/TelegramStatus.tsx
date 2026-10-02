import { Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

interface TelegramProps {
    status: {
        is_connected: boolean;
        bot_username: string;
    };
    onConnect: () => void;
    isLoading: boolean;
}

const TelegramStatus = ({ status, onConnect, isLoading }: TelegramProps) => {
    const { t } = useTranslation();

    if (status.is_connected) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-green-500 text-sm">{t('dashboard.telegram.connected')}</h4>
                        <p className="text-green-500/60 text-xs">{t('dashboard.telegram.remindersOn')}</p>
                    </div>
                </div>
                <div className="bg-green-500/20 px-3 py-1 rounded-full text-[10px] font-mono text-green-600">
                    {t('dashboard.telegram.active')}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 animate-pulse-soft">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-primary -translate-x-0.5 translate-y-0.5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-foreground text-sm">{t('dashboard.telegram.connectTitle')}</h4>
                    <p className="text-muted-foreground text-xs mt-1 mb-3">
                        {t('dashboard.telegram.connectDesc')}
                    </p>
                    <Button
                        onClick={onConnect}
                        disabled={isLoading}
                        size="sm"
                        className="w-full bg-primary hover:bg-primary-dark text-background font-black text-xs h-8 shadow-gold"
                    >
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Send className="w-3 h-3 mr-2" />}
                        {t('dashboard.telegram.connectBtn')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TelegramStatus;
