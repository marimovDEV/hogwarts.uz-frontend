import { useTranslation } from "react-i18next";
import { Trophy, CheckCircle2 } from "lucide-react";

export const AuthGuideSide = () => {
    const { t } = useTranslation();

    return (
        <div className="hidden lg:flex w-1/2 bg-muted/30 border-r border-white/10 flex-col p-12 justify-between relative overflow-hidden backdrop-blur-3xl bg-slate-900/50">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shadow-gold">
                        <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-primary font-cinzel">
                        Hogwords
                    </span>
                </div>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                            {t('auth_guide.title')}
                        </h1>
                        <p className="text-blue-200 text-lg">
                            {t('auth_guide.subtitle')}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white font-bold border border-white/10">1</div>
                            <p className="text-lg text-gray-300 pt-0.5">{t('auth_guide.step1')}</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white font-bold border border-white/10">2</div>
                            <p className="text-lg text-gray-300 pt-0.5">{t('auth_guide.step2')}</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white font-bold border border-white/10">3</div>
                            <p className="text-lg text-white font-semibold pt-0.5">{t('auth_guide.step3')}</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 text-gray-400">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span>{t('auth_guide.benefit1')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            <span>{t('auth_guide.benefit2')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                            <CheckCircle2 className="w-5 h-5 text-purple-400" />
                            <span>{t('auth_guide.benefit3')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-auto pt-10">
                <p className="text-sm text-gray-500 italic">
                    "{t('auth_guide.footer')}"
                </p>
            </div>
        </div>
    );
};
