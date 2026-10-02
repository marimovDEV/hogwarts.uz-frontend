import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ShieldCheck } from "lucide-react";

const PrivacyPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary mb-8 group transition-all">
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Bosh sahifaga qaytish
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Maxfiylik siyosati</h1>
                        <p className="text-muted-foreground text-lg">Oxirgi marta yangilangan: 2026-yil 23-fevral</p>
                    </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
                    <div className="p-6 md:p-10 bg-card rounded-[2.5rem] border shadow-lg space-y-8">

                        <section>
                            <h2 className="text-2xl mt-0 mb-4">1. Maqsad va Qo'llanilish</h2>
                            <p>Ushbu Maxfiylik siyosati ta'lim platformasi siz taqdim etgan shaxsiy ma'lumotlarni qay tarzda yig'ishi, ulardan qanday foydalanishi va ularni uchinchi shaxslardan qanday himoya qilishi tartiblarini tushuntiradi. Tizimdan foydalanish orqali siz shaxsiy ma'lumotlaringizni ushbu hujjat asosida qayta ishlashga rozilik bildirasiz.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl mb-4">2. Yig'iladigan ma'lumotlar turlari</h2>
                            <ul className="space-y-2 list-disc pl-5">
                                <li><strong>Shaxsiy identifikatsiya:</strong> Ismingiz, xabaringiz, email manzilingiz va telefon raqamingiz tizimga ro'yxatdan o'tayotganingizda so'raladi.</li>
                                <li><strong>Akademik ma'lumotlar:</strong> Imtihonlar, kurslardan o'tish darajalari, o'zlashtirish tezligi va sizning umumiy XP/progression tarixi tizimda saqlanib turiladi.</li>
                                <li><strong>Texnik ma'lumotlar:</strong> Qaysi qurilmadan kirganingiz, IP manzilingiz va Cookie fayllari ta'lim jarayonini yaxshilash va analitika uchun to'planadi.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl mb-4">3. Ma'lumotlardan foydalanish maqsadlari</h2>
                            <p>Biz ma'lumotlaringizdan sayt himoyasi va foydalanuvchi tajribasini (UX) oshirish yo'lida foydalanamiz. Shu jumladan:</p>
                            <ul className="space-y-2 list-disc pl-5 mt-2">
                                <li>Hisobni autentifikatsiya qilish.</li>
                                <li>Kurslarni tavsiya etish va sun'iy intellekt orqali maslahat berish.</li>
                                <li>To'lov operatsiyalarini xavfsiz amalga oshirish va sertifikatlar berish.</li>
                                <li>Mijozlarni qo'llab-quvvatlash.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl mb-4">4. Uchinchi tomonga ma'lumot taqdim etish</h2>
                            <p>Hogwords platformasi foydalanuvchilarning shaxsiy ma'lumotlarini qonunchilikda belgilangan hollar (masalan, sud qarori) dan tashqari, <strong>hech qanday uchinchi marketing agentliklariga sotmaydi</strong> va ularga fosh etmaydi. Faqat to'lovlarni amalga oshirishda uz/ru to'lov protokollari qoidalariga rioya qilinadi.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl mb-4">5. Axborot xavfsizligi</h2>
                            <p>Biz barcha ma'lumotlaringizni himoya qilish uchun ma'lumotlarni shifrlash va himoyalangan serverlardan foydalanamiz. Lekin Internet tarmog'ida ma'lumotlarni mutlaqo xavfsiz uzatish kafolatlanishi imkonsiz ekanligini unutmang.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
