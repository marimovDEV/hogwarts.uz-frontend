import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send, Sparkles, User, Phone, MessageSquare, BookOpen } from "lucide-react";
import api from "@/services/api";

interface BecomeTeacherFormData {
    name: string;
    phone: string;
    telegram_username?: string;
    note?: string;
}

const BecomeTeacherForm = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<BecomeTeacherFormData>();

    const onSubmit = async (data: BecomeTeacherFormData) => {
        setIsLoading(true);
        try {
            await api.post('/leads/', {
                ...data,
                note: `[O'qituvchi bo'lish arizasi] ${data.note || ''}`
            });
            toast.success(t('becomeTeacher.success_title', 'Arizangiz qabul qilindi!'), {
                description: t('becomeTeacher.success_desc', 'Tez orada ma\'murlarimiz siz bilan bog\'lanishadi.')
            });
            reset();
        } catch (error) {
            console.error(error);
            toast.error(t('becomeTeacher.error_title', 'Xatolik yuz berdi'), {
                description: t('becomeTeacher.error_desc', 'Iltimos, keyinroq qayta urinib ko\'ring.')
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-secondary/20 to-transparent shadow-2xl overflow-hidden group"
        >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl rounded-[2.4rem]" />

            <div className="relative z-10 p-8 md:p-12">
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] animate-pulse-soft">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t('becomeTeacher.badge', 'O\'qituvchilar jamoasiga qo\'shiling')}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter leading-tight font-cinzel">
                        {t('becomeTeacher.title', 'Biz bilan Birga Dars Bering')}
                    </h2>
                    <p className="text-secondary font-medium max-w-2xl mx-auto italic">
                        {t('becomeTeacher.subtitle', 'O\'z bilimingizni ulashing va platformamizda eng yaxshi o\'qituvchilardan biriga aylaning.')}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-primary font-bold ml-1 flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                {t('becomeTeacher.name_label', 'Ism Familiyangiz')}
                            </Label>
                            <div className="relative group/input">
                                <Input
                                    {...register("name", { required: true })}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 pl-5 focus:ring-primary focus:border-primary text-primary placeholder:text-primary/20 transition-all group-hover/input:bg-white/10"
                                    placeholder={t('becomeTeacher.name_placeholder', 'Masalan: Ali Valiyev')}
                                />
                                {errors.name && <span className="text-destructive text-xs mt-1 ml-1">{t('common.required')}</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-primary font-bold ml-1 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-secondary" />
                                {t('becomeTeacher.phone_label', 'Telefon Raqamingiz')}
                            </Label>
                            <Input
                                {...register("phone", { required: true })}
                                className="bg-white/5 border-white/10 rounded-2xl h-14 pl-5 focus:ring-secondary focus:border-secondary text-primary placeholder:text-primary/20"
                                placeholder="+998 (__) ___-__-__"
                            />
                            {errors.phone && <span className="text-destructive text-xs mt-1 ml-1">{t('common.required')}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-primary font-bold ml-1 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                {t('becomeTeacher.telegram_label', 'Telegram Username')}
                            </Label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 font-bold">@</span>
                                <Input
                                    {...register("telegram_username")}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 pl-10 focus:ring-primary focus:border-primary text-primary placeholder:text-primary/20"
                                    placeholder="username"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 flex flex-col">
                        <div className="space-y-2 flex-1 flex flex-col">
                            <Label className="text-primary font-bold ml-1 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-secondary" />
                                {t('becomeTeacher.note_label', 'Siz dars bermoqchi bo\'lgan fan va tajribangiz')}
                            </Label>
                            <Textarea
                                {...register("note")}
                                className="bg-white/5 border-white/10 rounded-3xl p-5 focus:ring-secondary focus:border-secondary text-primary placeholder:text-primary/20 resize-none flex-1 min-h-[200px]"
                                placeholder={t('becomeTeacher.note_placeholder', 'Masalan: Matematika fani bo\'yicha 5 yillik tajriba...')}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all duration-300 rounded-2xl h-14 text-white font-black text-lg shadow-purple group-hover:shadow-cyan overflow-hidden relative"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Send className="w-5 h-5" />
                                    {t('becomeTeacher.submit_btn', 'Ariza Yuborish')}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </Button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default BecomeTeacherForm;
