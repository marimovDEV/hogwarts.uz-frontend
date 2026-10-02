import { motion } from "framer-motion";
import { UserPlus, UserCircle, Target, CheckCircle2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const GettingStartedSteps = () => {
    const { t } = useTranslation();

    const steps = [
        {
            icon: UserPlus,
            number: "01",
            title: t('guide.gettingStarted.step1', 'Ro\'yxatdan o\'ting'),
            description: t('guide.gettingStarted.step1Desc', 'Telefon raqamingiz orqali 1 daqiqada hisob yarating. SMS kod orqali tasdiqlang.'),
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: UserCircle,
            number: "02",
            title: t('guide.gettingStarted.step2', 'Profilni to\'ldiring'),
            description: t('guide.gettingStarted.step2Desc', 'Ism, familiya, maktab va sinfingizni kiriting. Bu sizga mos kurslarni topishga yordam beradi.'),
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: Target,
            number: "03",
            title: t('guide.gettingStarted.step3', 'Kurs yoki olimpiada tanlang'),
            description: t('guide.gettingStarted.step3Desc', 'O\'zingizga mos kursni tanlang yoki olimpiadaga ro\'yxatdan o\'ting. Bepul kurslar ham mavjud!'),
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: CheckCircle2,
            number: "04",
            title: t('guide.gettingStarted.step4', 'Natija oling'),
            description: t('guide.gettingStarted.step4Desc', 'Darslarni ko\'ring, testlarni yeching va sertifikat oling. Olimpiadalarda g\'olib bo\'ling!'),
            color: 'from-green-500 to-emerald-500'
        }
    ];

    return (
        <section id="getting-started" className="py-12 md:py-16 bg-muted/30 scroll-mt-20">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('guide.gettingStarted.title', 'Qanday boshlayman?')}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t('guide.gettingStarted.description', '4 oddiy qadamda platformadan foydalanishni boshlang')}
                    </p>
                </motion.div>

                {/* Steps - Desktop Timeline */}
                <div className="hidden lg:block relative mb-12">
                    {/* Connection Line */}
                    <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-orange-500 to-green-500 opacity-20" />

                    <div className="grid grid-cols-4 gap-6">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    className="relative"
                                >
                                    {/* Number Badge */}
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-lg`}>
                                        {step.number}
                                    </div>

                                    {/* Card */}
                                    <div className="bg-card rounded-2xl p-6 border hover:shadow-lg transition-all">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>

                                    {/* Arrow */}
                                    {index < steps.length - 1 && (
                                        <div className="absolute top-8 -right-3 text-muted-foreground">
                                            <ArrowRight className="w-6 h-6" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Steps - Mobile/Tablet Vertical */}
                <div className="lg:hidden space-y-6 mb-12">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-4"
                            >
                                {/* Number + Icon */}
                                <div className="flex-shrink-0">
                                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg mb-2`}>
                                        {step.number}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="w-0.5 h-16 bg-gradient-to-b from-muted to-transparent mx-auto" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-card rounded-2xl p-4 md:p-6 border">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mb-3`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <Button size="lg" asChild className="rounded-xl">
                        <Link to="/auth/register">
                            {t('guide.gettingStarted.cta', 'Hoziroq boshlash')}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
};

export default GettingStartedSteps;
