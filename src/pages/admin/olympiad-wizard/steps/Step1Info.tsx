
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, Plus, Loader2 } from "lucide-react";
import axios from "axios";
import { API_URL, getAuthHeader, getImageUrl } from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Step1Info = ({ data, update }: { data: any, update: (d: any) => void }) => {
    const { t } = useTranslation();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [professions, setProfessions] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);

    // TYPE: 'SUBJECT' | 'PROFESSION' | 'COURSE'
    // We infer this from the data if it exists, otherwise default to SUBJECT
    const [categoryType, setCategoryType] = useState<'SUBJECT' | 'PROFESSION' | 'COURSE'>(() => {
        if (data.profession) return 'PROFESSION';
        if (data.course) return 'COURSE';
        return 'SUBJECT';
    });

    // New Subject State
    const [isCreatingSubject, setIsCreatingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState("");
    const [isSavingSubject, setIsSavingSubject] = useState(false);

    // New Profession State
    const [isCreatingProfession, setIsCreatingProfession] = useState(false);
    const [newProfessionName, setNewProfessionName] = useState("");
    const [isSavingProfession, setIsSavingProfession] = useState(false);

    // New Course State
    const [isCreatingCourse, setIsCreatingCourse] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState("");
    const [isSavingCourse, setIsSavingCourse] = useState(false);

    useEffect(() => {
        fetchAllCategories();
    }, []);

    const fetchAllCategories = async () => {
        try {
            const [subjRes, profRes, courseRes] = await Promise.all([
                axios.get(`${API_URL}/subjects/`, { headers: getAuthHeader() }),
                axios.get(`${API_URL}/professions/`, { headers: getAuthHeader() }),
                axios.get(`${API_URL}/courses/`, { headers: getAuthHeader() }) // Fixed URL
            ]);
            setSubjects(subjRes.data.results || subjRes.data);
            setProfessions(profRes.data.results || profRes.data);
            setCourses(courseRes.data.results || courseRes.data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };


    const handleCreateSubject = async () => {
        if (!newSubjectName.trim()) return;
        setIsSavingSubject(true);
        try {
            const res = await axios.post(`${API_URL}/subjects/`, { name: newSubjectName }, { headers: getAuthHeader() });
            const newSub = res.data;
            setSubjects([...subjects, newSub]);
            update({
                subject_id: newSub.id,
                subject: newSub.name,
                profession: null,
                course: null
            });
            setIsCreatingSubject(false);
            setNewSubjectName("");
            toast.success("Fan yaratildi!");
        } catch (err) {
            toast.error("Xatolik yuz berdi");
        } finally {
            setIsSavingSubject(false);
        }
    };

    const handleCreateProfession = async () => {
        if (!newProfessionName.trim()) return;
        setIsSavingProfession(true);
        try {
            // Need to provide minimal required fields. Check backend model.
            const payload = {
                name: newProfessionName,
                description: "Yangi yaratilgan kasb", // Default description
            };
            const res = await axios.post(`${API_URL}/professions/`, payload, { headers: getAuthHeader() });
            const newProf = res.data;
            setProfessions([...professions, newProf]);
            update({
                profession: String(newProf.id),
                subject_id: null,
                subject: null,
                course: null
            });
            setIsCreatingProfession(false);
            setNewProfessionName("");
            toast.success("Kasb yaratildi!");
        } catch (err) {
            console.error(err);
            toast.error("Xatolik yuz berdi");
        } finally {
            setIsSavingProfession(false);
        }
    };

    const handleCreateCourse = async () => {
        if (!newCourseTitle.trim()) return;
        setIsSavingCourse(true);
        try {
            // Course creation usually requires more fields. 
            // We'll try with minimal, assuming backend allows defaults or nulls.
            const payload = {
                title: newCourseTitle,
                description: "Yangi kurs (Olimpiada uchun yaratildi)", // Better default description
                is_active: false // Created as draft
            };
            const res = await axios.post(`${API_URL}/courses/`, payload, { headers: getAuthHeader() });
            const newCourse = res.data;

            // Add to list and select it
            setCourses(prev => [...prev, newCourse]);

            // Update parent state
            update({
                course: String(newCourse.id),
                profession: null, // Clear others
                subject_id: null,
                subject: null
            });

            setIsCreatingCourse(false);
            setNewCourseTitle("");

            // Clearer message
            toast.success("Kurs yaratildi (Qoralama)!", {
                description: "To'liq aktivlashtirish uchun 'Kurslar' bo'limida tahrirlang."
            });
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || "Xatolik yuz berdi";
            toast.error("Xatolik: " + msg);
        } finally {
            setIsSavingCourse(false);
        }
    };

    const handleCategoryTypeChange = (val: string) => {
        const type = val as 'SUBJECT' | 'PROFESSION' | 'COURSE';
        setCategoryType(type);
        // Clean up other fields when switching
        if (type === 'SUBJECT') update({ profession: null, course: null });
        if (type === 'PROFESSION') update({ subject: null, subject_id: null, course: null });
        if (type === 'COURSE') update({ subject: null, subject_id: null, profession: null });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Title & Slug */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Olimpiada Nomi <span className="text-red-500">*</span></Label>
                        <Input
                            value={data.title}
                            onChange={(e) => {
                                const title = e.target.value;
                                const slug = title
                                    .toLowerCase()
                                    .replace(/[^\w\s-]/g, '')
                                    .replace(/\s+/g, '-');
                                update({ title, slug });
                            }}
                            placeholder="Masalan: Respublika Matematika Olimpiadasi 2024"
                            className="text-lg font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Havola (Slug)</Label>
                        <Input
                            value={data.slug}
                            onChange={(e) => update({ slug: e.target.value })}
                            placeholder="respublika-matematika-2024"
                            className="font-mono text-sm bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground">
                            Olimpiada manzili: hogwords.uz/olympiads/<strong>{data.slug || '...'}</strong>
                        </p>
                    </div>

                    <div className="space-y-3 p-4 bg-muted/20 rounded-xl border">
                        <Label>Olimpiada Yo'nalishi</Label>

                        <Tabs value={categoryType} onValueChange={handleCategoryTypeChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="SUBJECT">Fan</TabsTrigger>
                                <TabsTrigger value="PROFESSION">Kasb</TabsTrigger>
                                <TabsTrigger value="COURSE">Kurs</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="pt-2">
                            {categoryType === 'SUBJECT' && (
                                <div className="flex gap-2">
                                    <Select
                                        value={String(data.subject_id || "")}
                                        onValueChange={(val) => {
                                            const selected = subjects.find(s => String(s.id) === val);
                                            update({
                                                subject_id: Number(val),
                                                subject: selected ? selected.name : ""
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Fanni tanlang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map(s => (
                                                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Dialog open={isCreatingSubject} onOpenChange={setIsCreatingSubject}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" title="Yangi fan yaratish">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Yangi Fan Yaratish</DialogTitle>
                                                <DialogDescription className="hidden">Yangi fan nomini kiriting</DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label>Fan nomi</Label>
                                                <Input
                                                    value={newSubjectName}
                                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                                    placeholder="Masalan: Sun'iy Intellekt"
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleCreateSubject} disabled={isSavingSubject}>
                                                    {isSavingSubject && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                                    Saqlash
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}

                            {categoryType === 'PROFESSION' && (
                                <div className="flex gap-2">
                                    <Select
                                        value={String(data.profession || "")}
                                        onValueChange={(val) => update({ profession: val })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Kasbni tanlang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {professions.map((p, idx) => (
                                                <SelectItem key={p.id || `prof-${idx}`} value={String(p.id)}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Dialog open={isCreatingProfession} onOpenChange={setIsCreatingProfession}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" title="Yangi kasb yaratish">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Yangi Kasb Yaratish</DialogTitle>
                                                <DialogDescription className="hidden">Yangi kasb nomini kiriting</DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label>Kasb nomi</Label>
                                                <Input
                                                    value={newProfessionName}
                                                    onChange={(e) => setNewProfessionName(e.target.value)}
                                                    placeholder="Masalan: Frontend Dasturchi"
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleCreateProfession} disabled={isSavingProfession}>
                                                    {isSavingProfession && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                                    Saqlash
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}

                            {categoryType === 'COURSE' && (
                                <div className="flex gap-2">
                                    <Select
                                        value={String(data.course || "")}
                                        onValueChange={(val) => update({ course: val })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Kursni tanlang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((c, idx) => (
                                                <SelectItem key={c.id || `course-${idx}`} value={String(c.id)}>{c.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Dialog open={isCreatingCourse} onOpenChange={setIsCreatingCourse}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" title="Yangi kurs yaratish">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Yangi Kurs Yaratish</DialogTitle>
                                                <DialogDescription className="hidden">Yangi kurs nomini kiriting</DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4 space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Kurs nomi</Label>
                                                    <Input
                                                        value={newCourseTitle}
                                                        onChange={(e) => setNewCourseTitle(e.target.value)}
                                                        placeholder="Masalan: Python Asoslari"
                                                    />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Eslatma: Bu yerda faqat kurs nomi kiritiladi. To'liq ma'lumotlarni keyinroq Kurslar bo'limida tahrirlashingiz mumkin.
                                                </p>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleCreateCourse} disabled={isSavingCourse}>
                                                    {isSavingCourse && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                                    Saqlash
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Classification */}
                <div className="space-y-4 bg-muted/20 p-6 rounded-xl border">
                    <h3 className="font-semibold text-foreground mb-4">Klassifikatsiya</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Sinf (Daraja)</Label>
                            <Select
                                value={data.grade_range}
                                onValueChange={(val) => update({ grade_range: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1-4">1-4 Sinflar</SelectItem>
                                    <SelectItem value="5-9">5-9 Sinflar</SelectItem>
                                    <SelectItem value="10-11">10-11 Sinflar</SelectItem>
                                    <SelectItem value="General">Umumiy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Qiyinchilik</Label>
                            <Select
                                value={data.difficulty}
                                onValueChange={(val) => update({ difficulty: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EASY">Oson</SelectItem>
                                    <SelectItem value="MEDIUM">O'rta</SelectItem>
                                    <SelectItem value="HARD">Qiyin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Format</Label>
                        <Select
                            value={data.format}
                            onValueChange={(val) => update({ format: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tanlang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ONLINE">Online (Masofaviy)</SelectItem>
                                <SelectItem value="LIVE">Live (Jonli Efir)</SelectItem>
                                <SelectItem value="HYBRID">Gibrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Muqova Rasm (Thumbnail)</Label>
                        <div className="flex items-center gap-4">
                            {data.thumbnail && (
                                <img
                                    src={typeof data.thumbnail === 'string' ? getImageUrl(data.thumbnail) : URL.createObjectURL(data.thumbnail)}
                                    className="w-16 h-16 rounded-md object-cover border"
                                    alt="Preview"
                                />
                            )}
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        update({ thumbnail: e.target.files[0] });
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step1Info;
