import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";

interface LeadFormData {
    name: string;
    phone: string;
    telegram_username?: string;
    note?: string;
}

const LeadForm = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormData>();

    const onSubmit = async (data: LeadFormData) => {
        setIsLoading(true);
        try {
            await api.post('/leads/', data);
            toast.success(t('leadForm.form.success'), {
                description: t('leadForm.form.success_desc')
            });
            reset();
        } catch (error) {
            console.error(error);
            toast.error(t('leadForm.form.error'), {
                description: t('leadForm.form.error_desc')
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-24 relative bg-[#0B0F1A] overflow-hidden">
            <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="container px-4 relative z-10 mx-auto">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="space-y-6">
                            <Badge variant="outline" className="px-6 py-1.5 text-sm border-primary/30 text-primary bg-primary/5 backdrop-blur-sm font-black uppercase tracking-widest">
                                {t('leadForm.badge')}
                            </Badge>
                            <h2 className="text-4xl md:text-6xl font-black text-white font-cinzel leading-tight tracking-tighter">
                                {t('leadForm.title')} <br />
                                <span className="text-primary italic gold-glow">{t('leadForm.titleAccent')}</span>
                            </h2>
                            <p className="text-xl text-secondary font-medium leading-relaxed">
                                {t('leadForm.description')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary text-background font-black flex items-center justify-center shadow-lg">
                                        {step}
                                    </div>
                                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-snug">
                                        {t(`leadForm.steps.${step}`)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Gold Frame Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-tr from-primary/30 via-transparent to-primary/30 blur-sm rounded-[2.5rem]" />

                        <div className="relative bg-[#111827] rounded-[2rem] md:rounded-[2.5rem] border border-white/10 p-6 md:p-12 shadow-2xl">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                                <h3 className="text-xl md:text-2xl font-black text-white font-cinzel mb-4 md:mb-8 text-center">{t('leadForm.form.title')}</h3>

                                <div className="space-y-1.5 md:space-y-2">
                                    <Label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">{t('leadForm.form.name')}</Label>
                                    <Input
                                        id="name"
                                        placeholder={t('leadForm.form.name_ph')}
                                        className="h-[52px] md:h-14 bg-white/5 border-white/10 text-white rounded-xl focus:ring-primary focus:border-primary placeholder:text-white/20"
                                        {...register("name", { required: true })}
                                    />
                                    {errors.name && <span className="text-xs text-red-500">{t('leadForm.form.error_name')}</span>}
                                </div>

                                <div className="space-y-1.5 md:space-y-2">
                                    <Label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">{t('leadForm.form.phone')}</Label>
                                    <Input
                                        id="phone"
                                        placeholder={t('leadForm.form.phone_ph')}
                                        className="h-[52px] md:h-14 bg-white/5 border-white/10 text-white rounded-xl focus:ring-primary focus:border-primary placeholder:text-white/20"
                                        {...register("phone", { required: true })}
                                    />
                                    {errors.phone && <span className="text-xs text-red-500">{t('leadForm.form.error_phone')}</span>}
                                </div>

                                <div className="space-y-1.5 md:space-y-2">
                                    <Label className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">{t('leadForm.form.telegram')}</Label>
                                    <Input
                                        id="telegram"
                                        placeholder="@username"
                                        className="h-[52px] md:h-14 bg-white/5 border-white/10 text-white rounded-xl focus:ring-primary focus:border-primary placeholder:text-white/20"
                                        {...register("telegram_username")}
                                    />
                                </div>

                                <Button type="submit" size="lg" className="w-full h-[52px] md:h-16 mt-2 bg-primary text-background font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {t('leadForm.form.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            {t('leadForm.form.submit')} <Send className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-[9px] md:text-[10px] text-center text-secondary/50 font-medium pt-2">
                                    {t('leadForm.form.privacy')}
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default LeadForm;
