import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, Shield, BookOpen, AlertCircle, HelpCircle } from "lucide-react";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";

const Step5Preview = ({ data, olympiadId }: { data: any, olympiadId?: number }) => {
    const [stats, setStats] = useState({ count: 0, totalPoints: 0 });

    useEffect(() => {
        if (olympiadId) {
            const fetchStats = async () => {
                try {
                    // Start fetching all questions to calculate
                    const res = await axios.get(`${API_URL}/questions/?olympiad=${olympiadId}`, { headers: getAuthHeader() });
                    const questions = res.data.results || res.data || [];

                    const count = questions.length;
                    const points = questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0);

                    setStats({ count, totalPoints: points });
                } catch (e) {
                    console.error("Failed to fetch questions stats", e);
                }
            };
            fetchStats();
        }
    }, [olympiadId]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                <AlertCircle className="w-5 h-5" />
                <p>Olimpiadani nashr qilishdan oldin barcha ma'lumotlarni tekshiring. "Nashr qilish" tugmasi bosilgandan so'ng u talabalarga ko'rinishi mumkin (agar status = Active bo'lsa).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Main Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" /> Asosiy Ma'lumotlar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-muted-foreground text-sm">Nomi:</span>
                            <p className="font-semibold text-lg">{data.title}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground text-sm">Slug:</span>
                            <p className="font-mono bg-muted p-1 rounded text-sm">{data.slug}</p>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <span className="text-muted-foreground text-sm">Fan:</span>
                                <p className="font-medium">{data.subject}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-sm">Sinf:</span>
                                <p className="font-medium">{data.grade_range}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-sm">Daraja:</span>
                                <Badge variant="outline">{data.difficulty}</Badge>
                            </div>
                        </div>

                        {/* Questions Stats - Dynamic */}
                        <div className="flex gap-4 pt-2 border-t mt-2">
                            <div>
                                <span className="text-muted-foreground text-sm">Savollar:</span>
                                <p className="font-bold flex items-center gap-1">
                                    <HelpCircle className="w-4 h-4 text-primary" />
                                    {stats.count} ta
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-sm">Maksimal Ball:</span>
                                <p className="font-bold flex items-center gap-1 text-green-600">
                                    {stats.totalPoints} ball
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule & Payment */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> Vaqt va To'lov
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-muted-foreground text-sm">Boshlanish:</span>
                                <p className="font-medium">{data.start_date?.replace('T', ' ')}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-sm">Tugash:</span>
                                <p className="font-medium">{data.end_date?.replace('T', ' ')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{data.duration} daqiqa</span>
                        </div>
                        <div className="pt-2 border-t">
                            <span className="text-muted-foreground text-sm">Narxi:</span>
                            <div className="flex items-center gap-2 text-lg font-bold">
                                {data.is_paid ? (
                                    <>
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        {Number(data.price).toLocaleString('uz-UZ', { maximumFractionDigits: 0 })} {data.currency}
                                        {data.discount_percent > 0 && (
                                            <Badge variant="destructive" className="ml-2">-{data.discount_percent}%</Badge>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-green-600">Bepul</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" /> Xavfsizlik
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="border p-3 rounded bg-muted/20">
                                <span className="text-xs text-muted-foreground block">Tab Switch</span>
                                <span className="font-semibold">{data.tab_switch_limit} ta</span>
                            </div>
                            <div className="border p-3 rounded bg-muted/20">
                                <span className="text-xs text-muted-foreground block">Kamera</span>
                                <span className={data.required_camera ? "text-green-600 font-bold" : "text-muted-foreground"}>
                                    {data.required_camera ? "Talab qilinadi" : "Yo'q"}
                                </span>
                            </div>
                            <div className="border p-3 rounded bg-muted/20">
                                <span className="text-xs text-muted-foreground block">Full Screen</span>
                                <span className={data.required_full_screen ? "text-green-600 font-bold" : "text-muted-foreground"}>
                                    {data.required_full_screen ? "Talab qilinadi" : "Yo'q"}
                                </span>
                            </div>
                            <div className="border p-3 rounded bg-muted/20">
                                <span className="text-xs text-muted-foreground block">Random</span>
                                <span className={data.is_random ? "text-blue-600 font-bold" : "text-muted-foreground"}>
                                    {data.is_random ? "Ha" : "Yo'q"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default Step5Preview;
