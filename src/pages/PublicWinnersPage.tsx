import { Award, Star, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { homepageService } from "@/services/homepageService";

const PublicWinnersPage = () => {
    const { t } = useTranslation();
    const [winners, setWinners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const data = await homepageService.getWinners();
                setWinners(Array.isArray(data) ? data : data.results || []);
            } catch (err) {
                console.error("Failed to fetch winners:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWinners();
    }, []);

    return (
        <main className="pb-16 container mx-auto px-4">
            <div className="text-center mb-16 animate-slide-up">
                <span className="inline-block px-4 py-2 rounded-full bg-warning/10 text-warning text-sm font-medium mb-4">
                    {t('winnersPage.badge')}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                    {t('winnersPage.title')}
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t('winnersPage.subtitle')}
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {winners.map((winner) => (
                        <div key={winner.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-strong transition-all duration-300 hover:-translate-y-1">
                            <div className="h-48 bg-muted relative">
                                {winner.image ? (
                                    <img src={winner.image} alt={winner.student_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                                        <Award className="w-12 h-12 text-secondary" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                                    {winner.position}-o'rin
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-1 text-foreground">{winner.student_name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{winner.region}</p>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                        <span className="text-sm font-medium text-muted-foreground">{t('winnersPage.fan')}</span>
                                        <span className="text-sm text-primary font-bold">{winner.subject_name || winner.subject?.name}</span>
                                    </div>
                                    {winner.prize && (
                                        <div className="flex items-center justify-between p-2 bg-warning/10 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-warning" />
                                                <span className="text-sm font-medium text-muted-foreground">{t('winnersPage.prize')}</span>
                                            </div>
                                            <span className="text-sm text-foreground font-bold">{winner.prize}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default PublicWinnersPage;
