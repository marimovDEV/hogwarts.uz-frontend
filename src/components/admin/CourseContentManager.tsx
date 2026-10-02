import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    GripVertical,
    Video,
    FileText,
    CheckSquare,
    Edit2,
    Trash2,
    ChevronDown,
    ChevronUp,
    Play,
    Puzzle,
    Clock,
    X,
    Save,
    MoreVertical
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { useTranslation } from "react-i18next";
import CourseAnalytics from "./CourseAnalytics";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
    Shield,
    Trophy,
    Percent,
    GraduationCap,
    Lock,
    Unlock,
    Activity
} from "lucide-react";
import QuizEditor from "./QuizEditor";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableItem } from "./dnd/SortableItem";


interface Lesson {
    id: number;
    title: string;
    description: string;
    video_url: string;
    pdf_url: string;
    order: number;
    is_free: boolean;
    is_locked: boolean;
    required_lesson: number | null;
    video_duration: number;
    min_watch_percent: number;
}

interface Module {
    id: number;
    title: string;
    order: number;
    lessons: Lesson[];
}

interface CourseContentManagerProps {
    courseId: number;
    onClose: () => void;
}

const CourseContentManager = ({ courseId, onClose }: CourseContentManagerProps) => {
    const { t } = useTranslation();
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<'curriculum' | 'grading' | 'certification' | 'analytics'>('curriculum');
    const [courseData, setCourseData] = useState<any>(null);

    // UI for adding/editing
    const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
    const [currentModule, setCurrentModule] = useState<Partial<Module> | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Partial<Lesson> | null>(null);
    const [targetModuleId, setTargetModuleId] = useState<number | null>(null);
    const [isQuizEditorOpen, setIsQuizEditorOpen] = useState(false);
    const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState<{ id: number, title: string } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleModuleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = modules.findIndex((m) => m.id === active.id);
        const newIndex = modules.findIndex((m) => m.id === over.id);

        const newModules = arrayMove(modules, oldIndex, newIndex);
        setModules(newModules);

        const items = newModules.map((m, i) => ({ id: m.id, order: i + 1 }));

        try {
            await axios.post(`${API_URL}/courses/${courseId}/reorder_modules/`, { items }, { headers: getAuthHeader() });
            toast.success(t('admin.curriculum.reorderSuccess'));
        } catch (error) {
            fetchContent();
            toast.error(t('admin.curriculum.error'));
        }
    };

    const handleLessonDragEnd = async (event: DragEndEvent, moduleId: number) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const module = modules.find(m => m.id === moduleId);
        if (!module) return;

        const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
        const newIndex = module.lessons.findIndex((l) => l.id === over.id);

        const newLessons = arrayMove(module.lessons, oldIndex, newIndex);

        // Update local state immediately
        setModules(prev => prev.map(m =>
            m.id === moduleId ? { ...m, lessons: newLessons } : m
        ));

        const items = newLessons.map((l, i) => ({ id: l.id, order: i + 1 }));

        try {
            await axios.post(`${API_URL}/courses/${courseId}/reorder_lessons/`, { items }, { headers: getAuthHeader() });
            toast.success(t('admin.curriculum.reorderSuccess'));
        } catch (error) {
            fetchContent();
            toast.error(t('admin.curriculum.error'));
        }
    };

    const toggleLessonLock = async (lesson: Lesson) => {
        try {
            await axios.patch(`${API_URL}/lessons/${lesson.id}/`, { is_locked: !lesson.is_locked }, { headers: getAuthHeader() });
            fetchContent();
            toast.success(t('admin.curriculum.lockToggled'));
        } catch (error) {
            toast.error(t('admin.curriculum.error'));
        }
    };

    useEffect(() => {
        fetchContent();
    }, [courseId]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const [contentRes, courseRes] = await Promise.all([
                axios.get(`${API_URL}/courses/${courseId}/learning_state/`, { headers: getAuthHeader() }),
                axios.get(`${API_URL}/courses/${courseId}/`, { headers: getAuthHeader() })
            ]);

            setModules(contentRes.data.modules || contentRes.data);
            setCourseData(courseRes.data);

            // Expand first module by default
            if (contentRes.data.length > 0) {
                setExpandedModules([contentRes.data[0].id]);
            }
        } catch (error) {
            toast.error(t('admin.curriculum.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCourse = async (updates: any) => {
        try {
            await axios.patch(`${API_URL}/courses/${courseId}/`, updates, { headers: getAuthHeader() });
            toast.success(t('admin.curriculum.saveSuccess'));
            fetchContent();
        } catch (error) {
            toast.error(t('admin.curriculum.error'));
        }
    };

    const toggleModule = (id: number) => {
        setExpandedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSaveModule = async () => {
        try {
            if (currentModule?.id) {
                await axios.put(`${API_URL}/modules/${currentModule.id}/`, currentModule, { headers: getAuthHeader() });
                toast.success(t('admin.curriculum.saveSuccess'));
            } else {
                await axios.post(`${API_URL}/modules/`, { ...currentModule, course: courseId, order: modules.length + 1 }, { headers: getAuthHeader() });
                toast.success(t('admin.curriculum.saveSuccess'));
            }
            setIsModuleDialogOpen(false);
            fetchContent();
        } catch (error) {
            toast.error(t('admin.curriculum.error'));
        }
    };

    const handleDeleteModule = async (id: number) => {
        if (!confirm(t('admin.curriculum.confirmDeleteModule'))) return;
        try {
            await axios.delete(`${API_URL}/modules/${id}/`, { headers: getAuthHeader() });
            fetchContent();
            toast.success(t('admin.curriculum.deleteSuccess'));
        } catch (error) {
            toast.error(t('admin.curriculum.error'));
        }
    };

    const handleSaveLesson = async () => {
        try {
            // Convert minutes to seconds if needed, but model says seconds. 
            // User requested minutes in UI.
            const lessonToSave = {
                ...currentLesson,
                video_duration: (currentLesson?.video_duration || 0) * 60 // UI uses minutes
            };

            if (currentLesson?.id) {
                await axios.put(`${API_URL}/lessons/${currentLesson.id}/`, lessonToSave, { headers: getAuthHeader() });
                toast.success(t('admin.curriculum.saveSuccess'));
            } else {
                await axios.post(`${API_URL}/lessons/`, {
                    ...lessonToSave,
                    course: courseId,
                    module: targetModuleId,
                    order: (modules.find(m => m.id === targetModuleId)?.lessons.length || 0) + 1
                }, { headers: getAuthHeader() });
                toast.success(t('admin.curriculum.saveSuccess'));
            }
            setIsLessonDialogOpen(false);
            fetchContent();
        } catch (error) {
            toast.error(t('admin.curriculum.error'));
        }
    };

    const handleDeleteLesson = async (id: number) => {
        if (!confirm(t('admin.curriculum.confirmDeleteLesson'))) return;
        try {
            await axios.delete(`${API_URL}/lessons/${id}/`, { headers: getAuthHeader() });
            fetchContent();
            toast.success(t('admin.curriculum.deleteSuccess'));
        } catch (error) {
            toast.error(t('admin.curriculum.error'));
        }
    };

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center bg-card p-6 rounded-[2rem] border border-border shadow-sm">
                    <div>
                        <h2 className="text-2xl font-black text-foreground">{t('admin.curriculum.title')}</h2>
                        <p className="text-muted-foreground text-sm">{t('admin.curriculum.subtitle')}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-border" onClick={onClose}>
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="curriculum" className="space-y-8" onValueChange={(val: any) => setActiveTab(val)}>
                    <div className="flex justify-center">
                        <TabsList className="bg-muted/30 p-1.5 h-16 rounded-[2rem] border border-border gap-2">
                            <TabsTrigger value="curriculum" className="rounded-2xl px-8 h-12 font-black data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2">
                                <Plus className="w-4 h-4 text-primary" /> {t('admin.curriculum.title')}
                            </TabsTrigger>
                            <TabsTrigger value="grading" className="rounded-2xl px-8 h-12 font-black data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2">
                                <Shield className="w-4 h-4 text-blue-500" /> {t('admin.curriculum.grading')}
                            </TabsTrigger>
                            <TabsTrigger value="certification" className="rounded-2xl px-8 h-12 font-black data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2">
                                <Trophy className="w-4 h-4 text-orange-500" /> {t('admin.curriculum.certification')}
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="rounded-2xl px-8 h-12 font-black data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2">
                                <Activity className="w-4 h-4 text-green-500" /> {t('admin.analytics.title')}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="curriculum" className="space-y-6">
                        <div className="flex justify-end">
                            <Button className="rounded-2xl h-12 px-6 font-black shadow-lg shadow-primary/20" onClick={() => { setCurrentModule({ title: "" }); setIsModuleDialogOpen(true); }}>
                                <Plus className="w-5 h-5 mr-3" /> {t('admin.curriculum.addModule')}
                            </Button>
                        </div>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleModuleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                        >
                            <SortableContext
                                items={modules.map(m => m.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {modules.map((module, idx) => (
                                    <SortableItem key={module.id} id={module.id}>
                                        {({ dragHandleProps, isDragging }) => (
                                            <div className={`bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden group mb-6 last:mb-0 transition-all ${isDragging ? 'shadow-2xl ring-2 ring-primary/20 scale-[1.02] z-50' : ''}`}>
                                                {/* Module Header */}
                                                <div className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => toggleModule(module.id)}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-xl text-foreground">{module.title}</h3>
                                                            <p className="text-sm font-medium text-muted-foreground">{t('admin.curriculum.lessonsCount', { count: module.lessons.length })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            {...dragHandleProps}
                                                            className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center cursor-move hover:bg-muted transition-colors mr-2"
                                                        >
                                                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                                                                    <MoreVertical className="w-5 h-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-2xl border-border p-2">
                                                                <DropdownMenuItem className="rounded-xl h-10 gap-3" onClick={() => { setCurrentModule(module); setIsModuleDialogOpen(true); }}>
                                                                    <Edit2 className="w-4 h-4 text-primary" /> {t('admin.curriculum.editModule')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="rounded-xl h-10 gap-3 text-destructive" onClick={() => handleDeleteModule(module.id)}>
                                                                    <Trash2 className="w-4 h-4" /> {t('admin.curriculum.deleteModule')}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                                                            {expandedModules.includes(module.id) ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Lessons List (Expanded) */}
                                                {expandedModules.includes(module.id) && (
                                                    <div className="px-6 pb-6 pt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <DndContext
                                                            sensors={sensors}
                                                            collisionDetection={closestCenter}
                                                            onDragEnd={(event) => handleLessonDragEnd(event, module.id)}
                                                            modifiers={[restrictToVerticalAxis]}
                                                        >
                                                            <SortableContext
                                                                items={module.lessons.map(l => l.id)}
                                                                strategy={verticalListSortingStrategy}
                                                            >
                                                                {module.lessons.map((lesson) => (
                                                                    <SortableItem key={lesson.id} id={lesson.id}>
                                                                        {({ dragHandleProps: lessonDragProps, isDragging: isLessonDragging }) => (
                                                                            <div
                                                                                className={`flex items-center justify-between p-4 bg-background rounded-2xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all group/lesson ${isLessonDragging ? 'shadow-xl ring-2 ring-primary/10 relative z-50 bg-card' : ''}`}
                                                                            >
                                                                                <div className="flex items-center gap-4">
                                                                                    <div
                                                                                        {...lessonDragProps}
                                                                                        className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center cursor-move opacity-0 group-hover/lesson:opacity-100 transition-opacity"
                                                                                    >
                                                                                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                                                    </div>
                                                                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                                                                        {lesson.is_free ? <Play className="w-4 h-4 text-green-500 fill-green-500" /> : <Video className="w-4 h-4 text-primary" />}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="font-bold text-foreground">{lesson.title}</span>
                                                                                            {lesson.is_free && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none scale-75">{t('admin.curriculum.demo')}</Badge>}
                                                                                            {lesson.is_locked && (
                                                                                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-sm" title="Ushbu dars qulflangan">
                                                                                                    <Lock className="w-3 h-3" />
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-black uppercase tracking-tighter mt-0.5">
                                                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t('admin.curriculum.videoDuration', { minutes: (lesson.video_duration / 60).toFixed(0) })}</span>
                                                                                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {lesson.pdf_url ? t('admin.curriculum.hasResource') : t('admin.curriculum.noResource')}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className={`h-9 w-9 rounded-xl transition-all ${lesson.is_locked ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'text-muted-foreground hover:bg-muted'}`}
                                                                                        onClick={(e) => { e.stopPropagation(); toggleLessonLock(lesson); }}
                                                                                        title={lesson.is_locked ? "Qulfdan chiqarish" : "Qulflash"}
                                                                                    >
                                                                                        {lesson.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                                                    </Button>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-9 w-9 rounded-xl hover:bg-blue-50 text-blue-500"
                                                                                        onClick={(e) => { e.stopPropagation(); setSelectedLessonForQuiz({ id: lesson.id, title: lesson.title }); setIsQuizEditorOpen(true); }}
                                                                                        title="Test qo'shish"
                                                                                    >
                                                                                        <CheckSquare className="w-4 h-4" />
                                                                                    </Button>
                                                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-50 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}>
                                                                                        <Trash2 className="w-4 h-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </SortableItem>
                                                                ))}
                                                            </SortableContext>
                                                        </DndContext>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full h-14 rounded-2xl border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 transition-all font-bold group mt-2"
                                                            onClick={() => { setCurrentLesson({ title: "", is_free: false, video_duration: 10 }); setTargetModuleId(module.id); setIsLessonDialogOpen(true); }}
                                                        >
                                                            <Plus className="w-5 h-5 mr-3 text-primary group-hover:scale-125 transition-transform" />
                                                            {t('admin.curriculum.addLesson')}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>
                    </TabsContent>

                    <TabsContent value="grading">
                        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
                            <div>
                                <h3 className="text-xl font-black text-foreground mb-1">{t('admin.curriculum.grading')}</h3>
                                <p className="text-muted-foreground text-sm font-medium">Kursni tugatish va baholash shartlarini belgilang</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border">
                                        <div className="space-y-1">
                                            <h4 className="font-black text-foreground">{t('admin.curriculum.completionThreshold')}</h4>
                                            <p className="text-xs text-muted-foreground font-medium pr-8">{t('admin.curriculum.completionThresholdDesc')}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="number"
                                                className="w-20 h-12 rounded-xl text-center font-black"
                                                value={courseData?.completion_min_progress || 80}
                                                onChange={(e) => handleUpdateCourse({ completion_min_progress: parseInt(e.target.value) })}
                                            />
                                            <span className="font-black text-primary text-xl">%</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border">
                                        <div className="space-y-1">
                                            <h4 className="font-black text-foreground">{t('admin.curriculum.requiredFinalScore')}</h4>
                                            <p className="text-xs text-muted-foreground font-medium pr-8">{t('admin.curriculum.requiredFinalScoreDesc')}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="number"
                                                className="w-20 h-12 rounded-xl text-center font-black"
                                                value={courseData?.required_final_score || 70}
                                                onChange={(e) => handleUpdateCourse({ required_final_score: parseInt(e.target.value) })}
                                            />
                                            <span className="font-black text-primary text-xl">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border">
                                        <div className="space-y-1">
                                            <h4 className="font-black text-foreground">Kurs yakunlash XP mukofoti</h4>
                                            <p className="text-xs text-muted-foreground font-medium pr-8">Kursni to'liq tugatgan talaba oladigan tajriba balli</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="number"
                                                className="w-24 h-12 rounded-xl text-center font-black"
                                                value={courseData?.xp_reward || 100}
                                                onChange={(e) => handleUpdateCourse({ xp_reward: parseInt(e.target.value) })}
                                            />
                                            <span className="font-black text-orange-500 text-xl">XP</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="certification">
                        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-foreground mb-1">{t('admin.curriculum.certification')}</h3>
                                    <p className="text-muted-foreground text-sm font-medium">Kurs muvaffaqiyatli yakunlanganda sertifikat berish sozlamalari</p>
                                </div>
                                <div className="flex items-center gap-4 bg-primary/5 px-6 py-4 rounded-3xl border border-primary/20">
                                    <label className="font-black text-primary flex items-center gap-2 cursor-pointer">
                                        <Trophy className="w-5 h-5" />
                                        {t('admin.curriculum.isCertificateEnabled')}
                                    </label>
                                    <Switch
                                        checked={courseData?.is_certificate_enabled || false}
                                        onCheckedChange={(val) => handleUpdateCourse({ is_certificate_enabled: val })}
                                    />
                                </div>
                            </div>

                            <div className={`transition-all duration-500 overflow-hidden ${courseData?.is_certificate_enabled ? 'opacity-100 max-h-[500px]' : 'opacity-30 pointer-events-none grayscale max-h-0'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-[2rem] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <FileText className="w-10 h-10 text-primary" />
                                        </div>
                                        <h4 className="font-black text-foreground mb-2">Standard Template</h4>
                                        <p className="text-xs text-muted-foreground font-bold mb-6">Hogwords Academy Professional Certificate Design</p>
                                        <Button variant="outline" className="rounded-2xl h-12 px-8 font-black border-primary/20 text-primary hover:bg-primary/5">
                                            Preview Template
                                        </Button>
                                    </div>
                                    <div className="space-y-4 flex flex-col justify-center">
                                        <div className="p-6 bg-muted/30 rounded-3xl border border-border">
                                            <h5 className="font-black text-foreground mb-2 flex items-center gap-2 italic">
                                                <Shield className="w-4 h-4 text-blue-500" /> Validation Rule
                                            </h5>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Student must reach <span className="text-primary font-black">{courseData?.completion_min_progress}%</span> total progress
                                                and score at least <span className="text-orange-500 font-black">{courseData?.required_final_score}%</span> on the final exam.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <CourseAnalytics courseId={courseId} />
                    </TabsContent>
                </Tabs>

                {/* Module Dialog */}
                <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] bg-card border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">{currentModule?.id ? t('admin.curriculum.editModule') : t('admin.curriculum.newModule')}</DialogTitle>
                            <DialogDescription>{t('admin.curriculum.moduleTitlePlaceholder')}</DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('admin.curriculum.moduleTitle')}</label>
                                <Input
                                    placeholder={t('admin.curriculum.moduleTitlePlaceholder')}
                                    value={currentModule?.title || ""}
                                    onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                                    className="h-14 rounded-2xl bg-background border-none shadow-inner text-lg font-bold"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="h-12 rounded-2xl font-bold flex-1" onClick={() => setIsModuleDialogOpen(false)}>{t('admin.curriculum.cancel')}</Button>
                            <Button className="h-12 rounded-2xl font-black flex-1 shadow-lg shadow-primary/20" onClick={handleSaveModule}>
                                <Save className="w-4 h-4 mr-2" /> {t('admin.curriculum.save')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Lesson Dialog */}
                <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                    <DialogContent className="sm:max-w-[800px] h-[90vh] rounded-[3rem] bg-card border-none shadow-2xl overflow-hidden p-0 flex flex-col">
                        <div className="p-8 border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10 flex justify-between items-center">
                            <div>
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-black">{currentLesson?.id ? t('admin.curriculum.editLesson') : t('admin.curriculum.newLesson')}</DialogTitle>
                                    <DialogDescription className="text-base font-medium">{t('admin.curriculum.descriptionPlaceholder')}</DialogDescription>
                                </DialogHeader>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 border border-border" onClick={() => setIsLessonDialogOpen(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Left Column: Basic Info */}
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-muted-foreground uppercase ml-1 tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {t('admin.curriculum.lessonTitle')}
                                        </label>
                                        <Input
                                            placeholder={t('admin.curriculum.lessonTitlePlaceholder')}
                                            value={currentLesson?.title || ""}
                                            onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                                            className="h-14 rounded-2xl bg-muted/30 border-none shadow-inner font-bold text-lg focus:bg-background transition-all"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-muted-foreground uppercase ml-1 tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {t('admin.curriculum.description')}
                                        </label>
                                        <Textarea
                                            placeholder={t('admin.curriculum.descriptionPlaceholder')}
                                            rows={5}
                                            value={currentLesson?.description || ""}
                                            onChange={(e) => setCurrentLesson({ ...currentLesson, description: e.target.value })}
                                            className="rounded-2xl bg-muted/30 border-none shadow-inner font-medium resize-none p-4 focus:bg-background transition-all"
                                        />
                                    </div>

                                    <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
                                        <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            {t('admin.curriculum.settings', 'Dars Sozlamalari')}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                                        <Unlock className="w-5 h-5 text-green-500" />
                                                    </div>
                                                    <span className="font-bold text-sm text-foreground">{t('admin.curriculum.demo')}</span>
                                                </div>
                                                <Switch
                                                    checked={currentLesson?.is_free || false}
                                                    onCheckedChange={(val) => setCurrentLesson({ ...currentLesson, is_free: val })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                                        <Lock className="w-5 h-5 text-red-500" />
                                                    </div>
                                                    <span className="font-bold text-sm text-foreground">{t('admin.curriculum.locked', 'Qulflangan')}</span>
                                                </div>
                                                <Switch
                                                    checked={currentLesson?.is_locked || false}
                                                    onCheckedChange={(val) => setCurrentLesson({ ...currentLesson, is_locked: val })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Media & Progression */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-muted-foreground uppercase ml-1 tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                {t('admin.curriculum.videoUrl')}
                                            </label>
                                            <div className="relative group">
                                                <Input
                                                    placeholder={t('admin.curriculum.videoUrlPlaceholder')}
                                                    value={currentLesson?.video_url || ""}
                                                    onChange={(e) => setCurrentLesson({ ...currentLesson, video_url: e.target.value })}
                                                    className="h-14 rounded-2xl bg-muted/30 border-none shadow-inner font-mono text-xs pr-12 focus:bg-background transition-all"
                                                />
                                                <Video className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>

                                        {currentLesson?.video_url && currentLesson.video_url.includes('youtube') && (
                                            <div className="aspect-video rounded-[2rem] overflow-hidden bg-muted border border-border shadow-2xl">
                                                <iframe
                                                    className="w-full h-full"
                                                    src={currentLesson.video_url.replace('watch?v=', 'embed/')}
                                                    title="YouTube preview"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-muted-foreground uppercase ml-1 tracking-widest">{t('admin.curriculum.duration')} (min)</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={currentLesson?.video_duration || 0}
                                                    onChange={(e) => setCurrentLesson({ ...currentLesson, video_duration: parseInt(e.target.value) })}
                                                    className="h-14 rounded-2xl bg-muted/30 border-none shadow-inner font-black pr-12"
                                                />
                                                <Clock className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-muted-foreground uppercase ml-1 tracking-widest">Minimal Ko'rish (%)</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={currentLesson?.min_watch_percent || 80}
                                                    onChange={(e) => setCurrentLesson({ ...currentLesson, min_watch_percent: parseInt(e.target.value) })}
                                                    className="h-14 rounded-2xl bg-muted/30 border-none shadow-inner font-black pr-12"
                                                />
                                                <Activity className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-muted-foreground uppercase ml-1 tracking-widest">{t('admin.curriculum.requiredLesson', 'Talab qilinadigan dars')}</label>
                                        <Select
                                            value={currentLesson?.required_lesson?.toString() || "none"}
                                            onValueChange={(val) => setCurrentLesson({ ...currentLesson, required_lesson: val === "none" ? null : parseInt(val) })}
                                        >
                                            <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none shadow-inner font-bold focus:ring-primary/50 transition-all">
                                                <div className="flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-primary" />
                                                    <SelectValue placeholder={t('admin.curriculum.selectLesson', "Darsni tanlang")} />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-3xl border-border bg-card/95 backdrop-blur-2xl p-2 shadow-2xl max-h-[350px]">
                                                <SelectItem value="none" className="rounded-xl h-11 font-bold text-muted-foreground focus:bg-primary/5 focus:text-primary mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Unlock className="w-4 h-4" />
                                                        {t('admin.curriculum.noRequirement', 'Talab yo\'q (Ochiq dars)')}
                                                    </div>
                                                </SelectItem>
                                                {modules.map(module => {
                                                    const validLessons = module.lessons.filter(l => l.id !== currentLesson?.id);
                                                    if (validLessons.length === 0) return null;

                                                    return (
                                                        <SelectGroup key={module.id} className="mb-2 last:mb-0">
                                                            <SelectLabel className="font-black text-xs text-primary/70 uppercase tracking-widest px-2 py-1.5 bg-primary/5 rounded-lg mb-1">
                                                                {module.title}
                                                            </SelectLabel>
                                                            {validLessons.map(l => (
                                                                <SelectItem key={l.id} value={l.id.toString()} className="rounded-xl font-bold focus:bg-primary/10 pl-6 h-10 transition-colors">
                                                                    <div className="flex items-center gap-2 truncate pr-4">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                                        <span className="truncate">{l.title}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-muted-foreground uppercase ml-1 tracking-widest">{t('admin.curriculum.resource')} (PDF)</label>
                                        <div className="relative group">
                                            <Input
                                                placeholder="https://..."
                                                value={currentLesson?.pdf_url || ""}
                                                onChange={(e) => setCurrentLesson({ ...currentLesson, pdf_url: e.target.value })}
                                                className="h-14 rounded-2xl bg-muted/30 border-none shadow-inner font-mono text-xs pr-12 focus:bg-background transition-all"
                                            />
                                            <FileText className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                    </div>

                                    <div className="p-6 bg-orange-500/5 rounded-[2rem] border border-orange-500/10 space-y-4">
                                        <h4 className="text-sm font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                            <Trophy className="w-4 h-4" />
                                            {t('admin.curriculum.gamification', 'Gamifikatsiya')}
                                        </h4>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-muted-foreground uppercase ml-1 tracking-widest">{t('admin.curriculum.lessonXp', 'Dars XP Balli')}</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={currentLesson?.xp_amount || 10}
                                                    onChange={(e) => setCurrentLesson({ ...currentLesson, xp_amount: parseInt(e.target.value) })}
                                                    className="h-14 rounded-2xl bg-background/50 border-orange-200/50 shadow-inner font-black pr-12 text-orange-600 focus:border-orange-500 transition-all"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-orange-500 text-xs">XP</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-muted/30 backdrop-blur-xl border-t border-border/50 sticky bottom-0 z-10 flex gap-4">
                            <Button variant="ghost" className="h-14 flex-1 rounded-2xl font-bold" onClick={() => setIsLessonDialogOpen(false)}>
                                {t('admin.curriculum.cancel')}
                            </Button>
                            <Button className="h-14 flex-[2] rounded-2xl font-black shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground group" onClick={handleSaveLesson}>
                                <Save className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                {t('admin.curriculum.save')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Quiz Editor Dialog */}
                {selectedLessonForQuiz && (
                    <QuizEditor
                        open={isQuizEditorOpen}
                        onClose={() => {
                            setIsQuizEditorOpen(false);
                            setSelectedLessonForQuiz(null);
                        }}
                        lessonId={selectedLessonForQuiz.id}
                        lessonTitle={selectedLessonForQuiz.title}
                    />
                )}
            </div>
        </div>
    );
};

export default CourseContentManager;
