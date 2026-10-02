import { useState, useEffect } from "react";
import { homepageService, Mentor } from "@/services/homepageService";
import { getBaseUrl } from "@/services/api";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Search,
    Sparkles,
    ArrowRight,
    Instagram,
    Linkedin,
    Github,
    GraduationCap,
    CheckCircle
} from "lucide-react";
import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BecomeTeacherForm from "@/components/home/BecomeTeacherForm";

const PublicTeachersPage = () => {
    const { t, i18n } = useTranslation();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchMentors = async () => {
            setIsLoading(true);
            try {
                const data = await homepageService.getMentors();
                const lang = i18n.language === 'ru' ? 'ru' : 'uz';
                const mapped = data.map((item: any) => {
                    const baseUrl = getBaseUrl();
                    const imageUrl = item.image
                        ? (item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=600&background=FACC15&color=0B0F1A`;

                    return {
                        id: item.id,
                        name: item.name,
                        role: item.position,
                        experience: item.experience,
                        students_count: item.students_count,
                        image: imageUrl,
                        company: item.company,
                        bio: item[`bio_${lang}`] || item.bio_uz,
                        socials: item.social_links || {}
                    };
                });
                setTeachers(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMentors();
    }, [i18n.language]);

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        teacher.role.toLowerCase().includes(search.toLowerCase()) ||
        teacher.company.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen pb-20 pt-32 relative overflow-hidden bg-[#0B0F1A]">
            {/* Subtle Magic Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-20"
                    style={{
                        background: `radial-gradient(circle at 50% 0%, rgba(250,204,21,0.15), transparent 70%)`
                    }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="outline" className="px-6 py-1.5 text-sm border-primary/30 text-primary bg-primary/5 backdrop-blur-sm font-black uppercase tracking-widest">
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t('teachers.badge', "KUCHLI JAMOA")}
                        </Badge>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white font-cinzel leading-none">
                        Bizning <span className="text-primary italic gold-glow">Mentorlarimiz</span>
                    </h1>
                    <p className="text-xl text-secondary max-w-2xl mx-auto font-medium italic font-cinzel">
                        "{t('teachers.quote')}"
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-20 relative group">
                    <div className="absolute inset-0 bg-primary/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary group-focus-within:text-primary transition-colors z-10" />
                    <input
                        type="text"
                        placeholder="Mentorlarni qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-secondary focus:outline-none focus:border-primary/40 transition-all font-bold backdrop-blur-md relative z-0"
                    />
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    </div>
                ) : filteredTeachers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredTeachers.map((teacher, index) => (
                            <motion.div
                                key={teacher.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="group relative bg-[#111827] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <img
                                        src={teacher.image}
                                        alt={teacher.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&size=600&background=FACC15&color=0B0F1A`;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

                                    <div className="absolute bottom-8 left-8 right-8 text-white">
                                        <h3 className="text-2xl font-black mb-1 group-hover:text-primary transition-colors font-cinzel leading-tight">{teacher.name}</h3>
                                        <p className="text-xs text-primary/80 font-black uppercase tracking-widest">{teacher.role}</p>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-1 bg-[#111827]">
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <Badge variant="outline" className="bg-white/5 text-[#64748B] border-white/10 font-black px-3">
                                            {teacher.company}
                                        </Badge>
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 flex items-center gap-1.5">
                                            <CheckCircle className="w-3 h-3" /> {parseInt(String(teacher.experience)) || 0} yil tajriba
                                        </Badge>
                                        <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20 font-black px-3 flex items-center gap-1.5">
                                            <Icons.Users className="w-3 h-3" /> {teacher.students_count?.toLocaleString()} student
                                        </Badge>
                                    </div>

                                    <p className="text-secondary text-sm line-clamp-3 mb-8 font-medium italic leading-relaxed">
                                        "{teacher.bio || "Kelajak bunyodkorlariga bilim ulashish yo'lida."}"
                                    </p>

                                    <div className="mt-auto flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-3">
                                            {teacher.socials.instagram && (
                                                <a href={teacher.socials.instagram} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-primary hover:text-background hover:border-primary transition-all">
                                                    <Instagram className="w-5 h-5" />
                                                </a>
                                            )}
                                            {teacher.socials.linkedin && (
                                                <a href={teacher.socials.linkedin} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-primary hover:text-background hover:border-primary transition-all">
                                                    <Linkedin className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                        <Link to={`/teacher-profile/${teacher.id}`} className="flex-1">
                                            <Button className="w-full h-12 rounded-xl bg-primary text-background font-black shadow-lg hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn">
                                                Profil
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-sm">
                        <GraduationCap className="w-16 h-16 text-[#64748B] mx-auto mb-6 opacity-20" />
                        <h3 className="text-2xl font-black text-white font-cinzel">{search ? "Mentor topilmadi" : "Hozircha mentorlar yo'q"}</h3>
                        <p className="text-[#64748B] mt-2 font-medium">Tez orada yangi mentorlar qo'shiladi.</p>
                    </div>
                )}

                {/* Become a Teacher Form Integration */}
                <div className="mt-32">
                    <BecomeTeacherForm />
                </div>
            </div>
        </main>
    );
};

export default PublicTeachersPage;
