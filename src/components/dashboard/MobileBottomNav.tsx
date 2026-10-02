import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutGrid, BookOpen, Trophy, Award, User } from "lucide-react";
import { motion } from "framer-motion";

const MobileBottomNav = () => {
    const { t } = useTranslation();

    const navItems = [
        { path: "/dashboard", label: t('dashboard.menu.home'), icon: LayoutGrid },
        { path: "/courses", label: t('dashboard.menu.allCourses'), icon: BookOpen },
        { path: "/olympiads", label: t('dashboard.menu.olympiads'), icon: Trophy },
        { path: "/results", label: t('dashboard.menu.results'), icon: Award },
        { path: "/profile", label: t('nav.profile', { defaultValue: "Profil" }), icon: User },
    ];

    return (
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-sm bg-[#111827]/90 backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-primary/20">
            <div className="flex items-center justify-between h-16 px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-1.5 min-w-[56px] transition-all duration-500 ${isActive
                                ? "text-primary scale-110"
                                : "text-secondary/60 hover:text-white"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`relative ${isActive ? 'gold-glow' : ''}`}>
                                    <item.icon className={`w-5 h-5 transition-all duration-500 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobile-active-dot"
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-gold"
                                        />
                                    )}
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
