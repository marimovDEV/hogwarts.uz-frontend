import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, FileText } from "lucide-react";

const TermsPage = () => {
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
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Foydalanish shartlari</h1>
                        <p className="text-muted-foreground text-lg">Oxirgi marta yangilangan: 2026-yil 23-fevral</p>
                    </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
                    <div className="p-6 md:p-10 bg-card rounded-[2.5rem] border shadow-lg space-y-8">

                        <section>
                            <h2 className="text-2xl mt-0 mb-4">1. Umumiy qoidalar</h2>
                            <p>Ushbu Foydalanish shartlari ("Shartlar") Hogwords platformasida ("Platforma") ro'yxatdan o'tgan barcha foydalanuvchilar o'rtasidagi munosabatlarni tartibga soladi. Platformaga kirish yoki undan foydalanish orqali siz ushbu shartlarga rozi ekanligingizni tasdiqlaysiz.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl mb-4">2. Xizmatlardan foydalanish qoidalari</h2>
                            <ul className="space-y-2 list-disc pl-5">
                                <li>Foydalanuvchilar faqat qonuniy maqsadlarda platformadan foydalanishlari shart.</li>
                                <li>Boshqa foydalanuvchilarga nisbatan haqorat, tajovuzkor so'zlar yoki ta'qib qilish qat'iyan man etiladi.</li>
                                <li>Platformadagi kurslar va test materiallari platformaning intellektual mulki hisoblanadi va ularni noqonuniy tarqatish taqiqlanadi.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl mb-4">3. To'lovlar va to'lovni qaytarish siyosati</h2>
                            <p>Pullik kurslar yoki premium imkoniyatlar uchun to'lovlar foydalanuvchining shaxsiy kabinetida amalga oshiriladi. To'lovlar, qoida tariqasida, xarid qilinganidan so'ng 7 kun ichida foydalanuvchi uzrli sabab ko'rsatsagina qaytarib berilishi ko'rib chiqiladi.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl mb-4">4. Akkaunt xavfsizligi</h2>
                            <p>Siz o'z parolingiz va akkauntingizga kirish ma'lumotlarining xavfsizligini ta'minlash uchun javobgarsiz. Uchinchi shaxslarga ma'lumotlarni berish natijasida yuzaga kelgan zararlar uchun platforma ma'muriyati javobgarlikni o'z zimmasiga olmaydi.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl mb-4">5. Ma'suliyatni cheklash</h2>
                            <p>Platforma ma'lumotlarning aniqligiga doimiy ravishda e'tibor qaratsa-da, uzilishlar va tizimdagi texnik nuqsonlar yuzaga kelmaydi deb kafolat bermaydi. Shuningdek, sertifikatni qo'lga kiritish ish bilan ta'minlashga 100% kafolat bermaydi.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl mb-4">6. Bog'lanish</h2>
                            <p>Savollar yoki tushunmovchiliklar yuzasidan <strong>info@olimpiada.uz</strong> elektron pochtasiga yoki platformaning rasmiy Telegram boti orqali murojaat qilishingiz mumkin.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
