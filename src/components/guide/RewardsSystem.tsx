import { motion } from "framer-motion";
import { Zap, TrendingUp, Award, Download, Star, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";

const RewardsSystem = () => {
    const { t } = useTranslation();

    const levels = [
        { level: 1, xp: '0-100', badge: '🌱', name: t('guide.rewards.beginner', 'Boshlang\'ich') },
        { level: 2, xp: '100-300', badge: '🔥', name: t('guide.rewards.active', 'Faol') },
        { level: 3, xp: '300-600', badge: '⭐', name: t('guide.rewards.expert', 'Mutaxassis') },
        { level: 4, xp: '600-1000', badge: '💎', name: t('guide.rewards.master', 'Master') },
        { level: 5, xp: '1000+', badge: '👑', name: t('guide.rewards.champion', 'Chempion') }
    ];

    return (
        <section id="rewards-system" className="py-16 scroll-mt-20">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('guide.rewards.title', 'XP, Ball, Sertifikatlar')}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t('guide.rewards.description', 'Platformadagi motivatsiya va mukofotlar tizimi haqida')}
                    </p>
                </motion.div>

                {/* XP System */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-2xl p-8 border border-orange-200 dark:border-orange-800 mb-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-8 h-8 text-orange-600" />
                        <h3 className="text-2xl font-bold">{t('guide.rewards.xpSystem', 'XP Tizimi')}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        {t('guide.rewards.xpDesc', 'XP (Experience Points) - bu sizning faolligingiz va bilimingiz uchun beriladigan ballar. Har bir dars, test va olimpiada uchun XP olasiz.')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card rounded-xl p-4 border">
                            <div className="text-2xl mb-2">📚</div>
                            <h4 className="font-bold mb-1">{t('guide.rewards.lessonXp', 'Dars ko\'rish')}</h4>
                            <p className="text-sm text-muted-foreground">+10-20 XP</p>
                        </div>
                        <div className="bg-card rounded-xl p-4 border">
                            <div className="text-2xl mb-2">✅</div>
                            <h4 className="font-bold mb-1">{t('guide.rewards.testXp', 'Test topshirish')}</h4>
                            <p className="text-sm text-muted-foreground">+30-50 XP</p>
                        </div>
                        <div className="bg-card rounded-xl p-4 border">
                            <div className="text-2xl mb-2">🏆</div>
                            <h4 className="font-bold mb-1">{t('guide.rewards.olympiadXp', 'Olimpiada')}</h4>
                            <p className="text-sm text-muted-foreground">+100-500 XP</p>
                        </div>
                    </div>
                </motion.div>

                {/* Levels */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-8"
                >
                    <h3 className="text-2xl font-bold mb-6 text-center">
                        {t('guide.rewards.levels', 'Daraja Tizimi')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {levels.map((level, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card rounded-xl p-6 border text-center hover:shadow-lg transition-all"
                            >
                                <div className="text-4xl mb-2">{level.badge}</div>
                                <div className="text-sm font-bold text-muted-foreground mb-1">Level {level.level}</div>
                                <h4 className="font-bold mb-2">{level.name}</h4>
                                <p className="text-xs text-muted-foreground">{level.xp} XP</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Certificates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="w-8 h-8 text-blue-600" />
                        <h3 className="text-2xl font-bold">{t('guide.rewards.certificates', 'Sertifikatlar')}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                {t('guide.rewards.howToGet', 'Qanday olish mumkin?')}
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">✓</span>
                                    <span>{t('guide.rewards.cert1', 'Kursni 100% tugatish')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">✓</span>
                                    <span>{t('guide.rewards.cert2', 'Barcha testlardan o\'tish')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">✓</span>
                                    <span>{t('guide.rewards.cert3', 'Olimpiadada ishtirok etish')}</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                <Download className="w-5 h-5 text-green-500" />
                                {t('guide.rewards.howToDownload', 'Qanday yuklab olish mumkin?')}
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">1.</span>
                                    <span>{t('guide.rewards.download1', 'Profilingizga kiring')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">2.</span>
                                    <span>{t('guide.rewards.download2', '"Sertifikatlar" bo\'limiga o\'ting')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">3.</span>
                                    <span>{t('guide.rewards.download3', 'PDF formatda yuklab oling')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default RewardsSystem;
