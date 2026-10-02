import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

const OlympiadLayout = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const location = useLocation();

    // Only show exit button if not in test results (or handle inside pages)
    // Actually, layout provides the frame. Pages can override title/timer.

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Minimal Navbar */}
            <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <img src="/logo.jpg" alt="Logo" decoding="async" className="w-8 h-8 rounded-xl object-contain" />
                    <span className="text-xl font-black font-cinzel text-foreground tracking-tight">Hogwords</span>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive gap-2"
                        onClick={() => {
                            if (confirm(t('common.confirmExit', 'Olimpiada rejimidan chiqmoqchimisiz?'))) {
                                navigate('/olympiads');
                            }
                        }}
                    >
                        <LogOut className="w-4 h-4" />
                        {t('common.exit')}
                    </Button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 w-full relative">
                <Outlet />
            </main>
        </div>
    );
};

export default OlympiadLayout;
