import { motion } from "framer-motion";
import { BookOpen, Trophy, Award, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";

const PlatformOverview = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: BookOpen,
            title: t('guide.platform.courses', 'Kurslar'),
            description: t('guide.platform.coursesDesc', 'Professional ustozlardan video darslar, amaliy mashg\'ulotlar va testlar'),
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: Trophy,
            title: t('guide.platform.olympiads', 'Olimpiadalar'),
            description: t('guide.platform.olympiadsDesc', 'Xalqaro va mahalliy olimpiadalarda ishtirok eting, o\'zingizni sinab ko\'ring'),
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: Award,
            title: t('guide.platform.certificates', 'Sertifikatlar'),
            description: t('guide.platform.certificatesDesc', 'Rasmiy sertifikat va diplomlar - bilimingizni tasdiqlovchi hujjatlar'),
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: Gift,
            title: t('guide.platform.rewards', 'Sovrinlar'),
            description: t('guide.platform.rewardsDesc', 'Eng faol o\'quvchilar va g\'oliblar uchun qimmatbaho sovg\'alar'),
            color: 'from-green-500 to-emerald-500'
        }
    ];

    return (
        <section id="platform-overview" className="py-16 scroll-mt-20">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('guide.platform.title', 'Hogwords nima?')}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                        {t('guide.platform.description', 'Hogwords - bu zamonaviy ta\'lim platformasi. Bu yerda siz professional kurslarni o\'rganishingiz, olimpiadalarda qatnashishingiz va o\'z bilimingizni sertifikatlar bilan tasdiqlay olasiz.')}
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-card rounded-2xl p-6 border hover:shadow-lg transition-all duration-300"
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Who is it for? */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-muted/50 rounded-2xl p-8 mb-8"
                >
                    <h3 className="text-2xl font-bold mb-4">
                        {t('guide.platform.whoFor', 'Kimlar uchun?')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="text-4xl mb-2">🎓</div>
                            <h4 className="font-bold mb-2">{t('guide.platform.students', 'O\'quvchilar')}</h4>
                            <p className="text-sm text-muted-foreground">
                                {t('guide.platform.studentsDesc', 'Bilimingizni oshiring, olimpiadalarda qatnashing va kelajakni quring')}
                            </p>
                        </div>
                        <div>
                            <div className="text-4xl mb-2">👨‍🏫</div>
                            <h4 className="font-bold mb-2">{t('guide.platform.teachers', 'O\'qituvchilar')}</h4>
                            <p className="text-sm text-muted-foreground">
                                {t('guide.platform.teachersDesc', 'O\'z kurslaringizni yarating va minglab o\'quvchilarga ta\'lim bering')}
                            </p>
                        </div>
                        <div>
                            <div className="text-4xl mb-2">🏫</div>
                            <h4 className="font-bold mb-2">{t('guide.platform.schools', 'Maktablar')}</h4>
                            <p className="text-sm text-muted-foreground">
                                {t('guide.platform.schoolsDesc', 'O\'quvchilaringizni olimpiadalarga tayyorlang va natijalarni kuzating')}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* What you get */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h3 className="text-2xl font-bold mb-6">
                        {t('guide.platform.whatYouGet', 'Natijada nima olasiz?')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { emoji: '📚', text: t('guide.platform.result1', 'Chuqur bilim') },
                            { emoji: '🏆', text: t('guide.platform.result2', 'Olimpiada tajribasi') },
                            { emoji: '📜', text: t('guide.platform.result3', 'Rasmiy sertifikat') },
                            { emoji: '🎁', text: t('guide.platform.result4', 'Qimmatbaho sovrinlar') }
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3 bg-card p-4 rounded-xl border">
                                <span className="text-3xl">{item.emoji}</span>
                                <span className="font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default PlatformOverview;
