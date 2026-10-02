import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    BookOpen, MoreVertical, Plus, Users, Clock, Star, Edit, Trash2, Eye, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { API_URL, getAuthHeader, getImageUrl } from "@/services/api";
import axios from "axios";
import { useTranslation } from "react-i18next";

// Helper for status badge
const StatusBadge = ({ is_active, t }: { is_active: boolean; t: any }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${is_active
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
        }`}>
        {is_active ? t('common.active') : t('common.draft')}
    </span>
);

const TeacherCoursesPage = () => {
    const { t } = useTranslation();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/teacher/courses/`, { headers: getAuthHeader() });
            setCourses(res.data.results || res.data);
        } catch (error) {
            console.error(error);
            toast.error(t('teacher.courses.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('teacher.courses.confirmDelete'))) return;

        try {
            await axios.delete(`${API_URL}/courses/${id}/`, { headers: getAuthHeader() });
            toast.success(t('teacher.courses.deleteSuccess'));
            fetchCourses();
        } catch (error) {
            toast.error(t('teacher.courses.deleteError'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-2xl border border-border shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight font-cinzel italic">{t('teacher.courses.title')}</h1>
                    <p className="text-muted-foreground mt-2 font-medium">{t('teacher.courses.subtitle')}</p>
                </div>
                <Link to="/teacher/courses/create">
                    <Button className="gap-3 bg-primary text-primary-foreground hover:bg-primary-light h-14 px-8 rounded-2xl font-black text-lg shadow-gold transition-all duration-300">
                        <Plus className="w-6 h-6" /> {t('teacher.courses.newCourse')}
                    </Button>
                </Link>
            </div>

            <Card className="border-border overflow-hidden shadow-2xl bg-card">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black font-cinzel tracking-tight">{t('teacher.courses.allCourses')}</CardTitle>
                            <CardDescription className="mt-2 font-medium text-primary/80">
                                {t('teacher.courses.totalCourses')}: {courses.length}
                            </CardDescription>
                        </div>
                        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                            <BookOpen className="w-8 h-8 text-primary shadow-gold" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">{t('common.loading')}</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-24 px-8">
                            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/10">
                                <BookOpen className="w-12 h-12 text-primary/40" />
                            </div>
                            <h3 className="text-2xl font-black font-cinzel mb-2">{t('teacher.courses.noCourses')}</h3>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t('teacher.courses.noCoursesDesc')}</p>
                            <Link to="/teacher/courses/create">
                                <Button variant="outline" className="h-12 px-8 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold">
                                    {t('teacher.courses.createFirst')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 border-b border-border hover:bg-muted/50">
                                        <TableHead className="font-black text-xs uppercase tracking-widest p-6">{t('teacher.courses.name')}</TableHead>
                                        <TableHead className="font-black text-xs uppercase tracking-widest p-6">{t('teacher.courses.subject')}</TableHead>
                                        <TableHead className="font-black text-xs uppercase tracking-widest p-6">{t('teacher.courses.price')}</TableHead>
                                        <TableHead className="font-black text-xs uppercase tracking-widest p-6">{t('teacher.courses.status')}</TableHead>
                                        <TableHead className="font-black text-xs uppercase tracking-widest p-6 text-right">{t('teacher.courses.students')}</TableHead>
                                        <TableHead className="font-black text-xs uppercase tracking-widest p-6 text-right">{t('teacher.courses.rating')}</TableHead>
                                        <TableHead className="w-[80px] p-6"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map((course) => (
                                        <TableRow key={course.id} className="border-border hover:bg-primary/5 transition-colors group">
                                            <TableCell className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0 border border-border shadow-sm group-hover:shadow-gold transition-all duration-300">
                                                        {course.thumbnail ? (
                                                            <img src={getImageUrl(course.thumbnail)} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-primary/40 bg-primary/5">
                                                                <BookOpen className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-foreground line-clamp-2 text-base">{course.title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-6">
                                                <Badge variant="outline" className="font-bold tracking-tight border-primary/20 text-primary bg-primary/5">
                                                    {course.subject}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="p-6 font-black text-foreground">
                                                {parseFloat(course.price) === 0
                                                    ? <span className="text-primary">{t('teacher.courses.free')}</span>
                                                    : <span>{parseInt(course.price).toLocaleString()} UZS</span>
                                                }
                                            </TableCell>
                                            <TableCell className="p-6">
                                                <StatusBadge is_active={course.is_active} t={t} />
                                            </TableCell>
                                            <TableCell className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2 font-bold text-muted-foreground">
                                                    <Users className="w-4 h-4 text-primary" />
                                                    {course.students_count}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2 text-primary font-black">
                                                    <Star className="w-4 h-4 fill-current shadow-gold" />
                                                    {course.rating}
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl bg-card border-border shadow-2xl">
                                                        <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary transition-all cursor-pointer">
                                                            <Link to={`/courses/${course.id}`} className="flex items-center font-bold">
                                                                <Eye className="w-5 h-5 mr-3" /> {t('common.view')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-primary/10 focus:text-primary transition-all cursor-pointer">
                                                            <Link to={`/teacher/courses/${course.id}/edit`} className="flex items-center font-bold">
                                                                <Edit className="w-5 h-5 mr-3" /> {t('common.edit')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="rounded-xl p-3 text-red-500 focus:text-red-500 focus:bg-red-500/10 transition-all font-bold cursor-pointer"
                                                            onClick={() => handleDelete(course.id)}
                                                        >
                                                            <Trash2 className="w-5 h-5 mr-3" /> {t('common.delete')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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

export default TeacherCoursesPage;
