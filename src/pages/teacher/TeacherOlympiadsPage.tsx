import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Plus, Calendar, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";

const TeacherOlympiadsPage = () => {
    const { t } = useTranslation();
    const [olympiads, setOlympiads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOlympiads();
    }, []);

    const fetchOlympiads = async () => {
        try {
            const res = await axios.get(`${API_URL}/teacher/olympiads/`, { headers: getAuthHeader() });
            setOlympiads(res.data.results || []);
        } catch (error) {
            console.error(error);
            toast.error(t('teacherOlympiads.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{t('teacherOlympiads.title')}</h1>
                    <p className="text-muted-foreground">{t('teacherOlympiads.subtitle')}</p>
                </div>
                {/* Note: Create Logic for Olympiads is complex, for now link to a create page or admin like page */}
                <Button className="gap-2" asChild>
                    <Link to="/teacher/olympiads/new">
                        <Plus className="w-4 h-4" /> {t('teacherOlympiads.create')}
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('teacherOlympiads.all')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">{t('teacherOlympiads.loading')}</div>
                    ) : olympiads.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <h3 className="text-lg font-medium mb-1">{t('teacherOlympiads.empty.title')}</h3>
                            <p className="text-muted-foreground mb-4">{t('teacherOlympiads.empty.description')}</p>
                            <Button asChild>
                                <Link to="/teacher/olympiads/new">{t('teacherOlympiads.empty.button')}</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('teacherOlympiads.table.name')}</TableHead>
                                        <TableHead>{t('teacherOlympiads.table.subject')}</TableHead>
                                        <TableHead>{t('teacherOlympiads.table.startDate')}</TableHead>
                                        <TableHead>{t('teacherOlympiads.table.status')}</TableHead>
                                        <TableHead className="text-right">{t('teacherOlympiads.table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {olympiads.map((oly) => (
                                        <TableRow key={oly.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        <Trophy className="w-5 h-5" />
                                                    </div>
                                                    {oly.title}
                                                </div>
                                            </TableCell>
                                            <TableCell>{oly.subject}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(oly.start_time).toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${oly.status === 'ONGOING' ? 'bg-green-100 text-green-700' :
                                                    oly.status === 'REGISTRATION_OPEN' ? 'bg-indigo-100 text-indigo-700 border border-indigo-100' :
                                                        oly.status === 'REGISTRATION_CLOSED' ? 'bg-amber-100 text-amber-700' :
                                                            oly.status === 'CHECKING' ? 'bg-orange-100 text-orange-700' :
                                                                oly.status === 'PUBLISHED' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {oly.status === 'DRAFT' ? 'Qoralama' :
                                                        oly.status === 'REGISTRATION_OPEN' ? "Ro'yxatga olish" :
                                                            oly.status === 'REGISTRATION_CLOSED' ? "Ro'yxat tugadi" :
                                                                oly.status === 'ONGOING' ? 'Boshlandi' :
                                                                    oly.status === 'CHECKING' ? 'Tekshirilmoqda' :
                                                                        oly.status === 'PUBLISHED' ? 'Natijalar' : oly.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" className="gap-2" asChild>
                                                        <Link to={`/teacher/olympiads/${oly.id}/results`}>
                                                            <Eye className="w-4 h-4 text-primary" />
                                                            {t('teacherOlympiads.table.results')}
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" asChild>
                                                        <Link to={`/teacher/olympiads/${oly.id}/edit`}>
                                                            <Edit className="w-4 h-4 text-primary" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TeacherOlympiadsPage;
