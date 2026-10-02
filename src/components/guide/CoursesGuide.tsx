import { motion } from "framer-motion";
import { BookOpen, Play, FileText, Award, TrendingUp, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";

const CoursesGuide = () => {
    const { t } = useTranslation();

    const courseFlow = [
        { icon: BookOpen, title: t('guide.courses.modules', 'Modullar'), desc: t('guide.courses.modulesDesc', 'Kurs bir nechta modullarga bo\'lingan') },
        { icon: Play, title: t('guide.courses.lessons', 'Darslar'), desc: t('guide.courses.lessonsDesc', 'Har bir modulda video darslar') },
        { icon: FileText, title: t('guide.courses.tests', 'Testlar'), desc: t('guide.courses.testsDesc', 'Har bir darsdan keyin test') },
        { icon: TrendingUp, title: t('guide.courses.progress', 'Progress'), desc: t('guide.courses.progressDesc', 'Sizning o\'sishingizni kuzating') },
        { icon: Award, title: t('guide.courses.certificate', 'Sertifikat'), desc: t('guide.courses.certificateDesc', '100% tugatsangiz sertifikat') }
    ];

    return (
        <section id="courses-guide" className="py-16 scroll-mt-20">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('guide.courses.title', 'Kurslar qanday ishlaydi?')}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t('guide.courses.description', 'Kursdan maksimal foyda olish uchun qanday ishlashini tushunib oling')}
                    </p>
                </motion.div>

                {/* Course Flow */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
                    {courseFlow.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                <div className="bg-card rounded-xl p-6 border text-center hover:shadow-lg transition-all">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h4 className="font-bold mb-1">{item.title}</h4>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                                {index < courseFlow.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-border" />
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Free vs Paid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* Free */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3 mb-4">
                            <Gift className="w-8 h-8 text-green-600" />
                            <h3 className="text-2xl font-bold">{t('guide.courses.free', 'Bepul Kurslar')}</h3>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{t('guide.courses.freeFeature1', 'Asosiy darslar')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{t('guide.courses.freeFeature2', 'Oddiy testlar')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{t('guide.courses.freeFeature3', 'Sertifikat (ba\'zi kurslarda)')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Paid */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="w-8 h-8 text-purple-600" />
                            <h3 className="text-2xl font-bold">{t('guide.courses.paid', 'Pullik Kurslar')}</h3>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 mt-0.5">✓</span>
                                <span>{t('guide.courses.paidFeature1', 'Barcha darslar va materiallar')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 mt-0.5">✓</span>
                                <span>{t('guide.courses.paidFeature2', 'Murakkab testlar va amaliyotlar')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 mt-0.5">✓</span>
                                <span>{t('guide.courses.paidFeature3', 'Rasmiy sertifikat')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 mt-0.5">✓</span>
                                <span>{t('guide.courses.paidFeature4', 'Ustozdan yordam')}</span>
                            </li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CoursesGuide;
