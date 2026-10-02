import { Button } from "@/components/ui/button";
import { Calendar, Timer, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const SmartOlympiadCard = () => {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="text-primary font-bold text-xs uppercase tracking-wider mb-1 block">Ro'yxatdan o'tilgan</span>
                        <h3 className="text-xl font-bold leading-tight">Milliy Matematika Tanlovi</h3>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2 text-center min-w-[50px]">
                        <span className="block text-lg font-bold">24</span>
                        <span className="block text-[10px] uppercase text-gray-400">Okt</span>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <Timer className="w-5 h-5 text-red-400 animate-pulse" />
                        <div>
                            <div className="text-xs text-gray-400">Boshlanishiga qoldi:</div>
                            <div className="font-mono font-bold text-lg">02kun : 04soat : 15daq</div>
                        </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-3 h-3 text-primary" />
                            <span className="text-xs font-bold text-primary-light">Tavsiya:</span>
                        </div>
                        <Link to="/courses" className="text-sm text-white/90 hover:text-primary-light underline underline-offset-2 decoration-primary/50">
                            Algebra - 3 va 4-mavzularni takrorlang
                        </Link>
                    </div>
                </div>

                <div className="mt-auto">
                    <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold">
                        Tayyorgarlikni boshlash
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SmartOlympiadCard;
