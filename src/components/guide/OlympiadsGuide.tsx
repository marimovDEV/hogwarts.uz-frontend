import { motion } from "framer-motion";
import { Trophy, Clock, BarChart3, Medal, Gift, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const OlympiadsGuide = () => {
    const { t } = useTranslation();

    const olympiadSteps = [
        {
            icon: Users,
            title: t('guide.olympiads.register', 'Ro\'yxatdan o\'ting'),
            description: t('guide.olympiads.registerDesc', 'Olimpiada sahifasidan "Ishtirok etish" tugmasini bosing va ma\'lumotlaringizni kiriting'),
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: Clock,
            title: t('guide.olympiads.time', 'Vaqt chegarasi'),
            description: t('guide.olympiads.timeDesc', 'Har bir olimpiadaning o\'z vaqt chegarasi bor. Vaqtni yaxshi rejalashtiring!'),
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: BarChart3,
            title: t('guide.olympiads.scoring', 'Ball hisobi'),
            description: t('guide.olympiads.scoringDesc', 'Har bir to\'g\'ri javob uchun ball olasiz. Qiyinroq savollar ko\'proq ball beradi'),
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: Medal,
            title: t('guide.olympiads.results', 'Natijalar'),
            description: t('guide.olympiads.resultsDesc', 'Olimpiada tugagandan keyin natijalar e\'lon qilinadi va reytingni ko\'rasiz'),
            color: 'from-green-500 to-emerald-500'
        }
    ];

    return (
        <section id="olympiads-guide" className="py-16 bg-muted/30 scroll-mt-20">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <Trophy className="w-4 h-4" />
                        {t('guide.olympiads.badge', 'Eng muhim')}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('guide.olympiads.title', 'Olimpiadalar qanday ishlaydi?')}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t('guide.olympiads.description', 'Olimpiadalarda qatnashish va g\'olib bo\'lish uchun bilishingiz kerak bo\'lgan hamma narsa')}
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {olympiadSteps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card rounded-2xl p-6 border hover:shadow-lg transition-all"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Prizes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-2xl p-8 border border-yellow-200 dark:border-yellow-800"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Gift className="w-8 h-8 text-yellow-600" />
                        <h3 className="text-2xl font-bold">{t('guide.olympiads.prizes', 'Sovrinlar')}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-5xl mb-2">🥇</div>
                            <h4 className="font-bold mb-1">{t('guide.olympiads.first', '1-o\'rin')}</h4>
                            <p className="text-sm text-muted-foreground">{t('guide.olympiads.firstPrize', 'Qimmatbaho sovrinlar va sertifikat')}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-2">🥈</div>
                            <h4 className="font-bold mb-1">{t('guide.olympiads.second', '2-o\'rin')}</h4>
                            <p className="text-sm text-muted-foreground">{t('guide.olympiads.secondPrize', 'Sovrinlar va sertifikat')}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-2">🥉</div>
                            <h4 className="font-bold mb-1">{t('guide.olympiads.third', '3-o\'rin')}</h4>
                            <p className="text-sm text-muted-foreground">{t('guide.olympiads.thirdPrize', 'Sovrinlar va sertifikat')}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default OlympiadsGuide;
