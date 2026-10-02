import { motion } from "framer-motion";
import { HelpCircle, CreditCard, AlertCircle, FileText, Settings, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FAQSection = () => {
    const { t } = useTranslation();

    const faqCategories = [
        {
            icon: CreditCard,
            title: t('guide.faq.payment', 'To\'lov'),
            questions: [
                {
                    q: t('guide.faq.paymentQ1', 'To\'lov qanday amalga oshiriladi?'),
                    a: t('guide.faq.paymentA1', 'Click, Payme yoki bank kartalari orqali to\'lov qilishingiz mumkin. To\'lov xavfsiz va tezkor.')
                },
                {
                    q: t('guide.faq.paymentQ2', 'To\'lov o\'tmadi, nima qilish kerak?'),
                    a: t('guide.faq.paymentA2', 'Agar to\'lov o\'tmagan bo\'lsa, avval internet aloqangizni tekshiring. Muammo davom etsa, support@ardent.uz ga murojaat qiling.')
                }
            ]
        },
        {
            icon: AlertCircle,
            title: t('guide.faq.technical', 'Texnik muammolar'),
            questions: [
                {
                    q: t('guide.faq.technicalQ1', 'Video yuklanmayapti, nima qilish kerak?'),
                    a: t('guide.faq.technicalA1', 'Sahifani yangilang (F5). Agar muammo davom etsa, brauzeringizni tozalang yoki boshqa brauzerda sinab ko\'ring.')
                },
                {
                    q: t('guide.faq.technicalQ2', 'Test yopilib qoldi, nima qilish kerak?'),
                    a: t('guide.faq.technicalA2', 'Testni qayta boshlashingiz mumkin. Agar muammo takrorlansa, support ga murojaat qiling.')
                }
            ]
        },
        {
            icon: FileText,
            title: t('guide.faq.certificates', 'Sertifikatlar'),
            questions: [
                {
                    q: t('guide.faq.certificatesQ1', 'Sertifikat qachon beriladi?'),
                    a: t('guide.faq.certificatesA1', 'Kursni 100% tugatib, barcha testlardan o\'tganingizdan so\'ng avtomatik beriladi.')
                },
                {
                    q: t('guide.faq.certificatesQ2', 'Sertifikat ko\'rinmayapti, nima qilish kerak?'),
                    a: t('guide.faq.certificatesA2', 'Profil → Sertifikatlar bo\'limiga o\'ting. Agar u yerda ham ko\'rinmasa, kursni to\'liq tugatganingizni tekshiring.')
                }
            ]
        },
        {
            icon: Settings,
            title: t('guide.faq.profile', 'Profil sozlamalari'),
            questions: [
                {
                    q: t('guide.faq.profileQ1', 'Parolni qanday o\'zgartirish mumkin?'),
                    a: t('guide.faq.profileA1', 'Profil → Sozlamalar → Parolni o\'zgartirish bo\'limiga o\'ting.')
                },
                {
                    q: t('guide.faq.profileQ2', 'Telefon raqamni o\'zgartirish mumkinmi?'),
                    a: t('guide.faq.profileA2', 'Ha, Profil → Sozlamalar bo\'limidan telefon raqamingizni o\'zgartirishingiz mumkin.')
                }
            ]
        }
    ];

    return (
        <section id="faq" className="py-16 bg-muted/30 scroll-mt-20">
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <HelpCircle className="w-4 h-4" />
                        {t('guide.faq.badge', 'FAQ')}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('guide.faq.title', 'Eng ko\'p beriladigan savollar')}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {t('guide.faq.description', 'Savol-javoblar orqali tezkor yordam oling')}
                    </p>
                </motion.div>

                {/* FAQ Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {faqCategories.map((category, catIndex) => {
                        const Icon = category.icon;
                        return (
                            <motion.div
                                key={catIndex}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: catIndex * 0.1 }}
                                className="bg-card rounded-2xl p-6 border"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-lg">{category.title}</h3>
                                </div>
                                <Accordion type="single" collapsible className="w-full">
                                    {category.questions.map((item, qIndex) => (
                                        <AccordionItem key={qIndex} value={`item-${catIndex}-${qIndex}`}>
                                            <AccordionTrigger className="text-left text-sm">
                                                {item.q}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-sm text-muted-foreground">
                                                {item.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Contact Support */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 text-center border border-primary/20"
                >
                    <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">
                        {t('guide.faq.needHelp', 'Yordam kerakmi?')}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {t('guide.faq.needHelpDesc', 'Javob topa olmadingizmi? Bizning support jamoamiz sizga yordam berishga tayyor!')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild>
                            <Link to="/support">
                                {t('guide.faq.contactSupport', 'Support bilan bog\'lanish')}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="mailto:support@ardent.uz">
                                {t('guide.faq.email', 'Email yuborish')}
                            </a>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FAQSection;
