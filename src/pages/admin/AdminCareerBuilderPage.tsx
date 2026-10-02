import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft, Plus, Trash2, Save, GripVertical, Settings,
    BookOpen, Trophy, Layout, ExternalLink, Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";

interface Node {
    id?: number;
    title: string;
    node_type: 'course' | 'olympiad' | 'project' | 'exam' | 'certificate' | 'custom';
    reference_id: number | null;
    is_required: boolean;
    xp_reward: number;
    unlock_condition: any | null;
    order: number;
}

interface Level {
    id?: number;
    level_number: number;
    title: string;
    unlock_xp: number;
    order: number;
    is_prestige_only: boolean;
    nodes: Node[];
}

interface Profession {
    id: number;
    name: string;
    slug: string;
    levels: Level[];
}

interface Course {
    id: number;
    title: string;
}

interface Olympiad {
    id: number;
    title: string;
}

const AdminCareerBuilderPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [profession, setProfession] = useState<Profession | null>(null);
    const [levels, setLevels] = useState<Level[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        fetchOptions();
    }, [id]);

    const fetchOptions = async () => {
        try {
            const [coursesRes, olympiadsRes] = await Promise.all([
                axios.get(`${API_URL}/courses/`, { headers: getAuthHeader() }),
                axios.get(`${API_URL}/olympiads/`, { headers: getAuthHeader() })
            ]);
            setCourses(coursesRes.data.results || coursesRes.data);
            setOlympiads(olympiadsRes.data.results || olympiadsRes.data);
        } catch (error) {
            console.error("Failed to load options", error);
        }
    };

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_URL}/professions/${id}/`, { headers: getAuthHeader() });
            setProfession(res.data);
            if (res.data.levels) {
                setLevels(res.data.levels.map((l: any) => ({
                    ...l,
                    nodes: l.nodes || []
                })));
            } else {
                setLevels([]);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('admin.errorOccurred'));
        } finally {
            setLoading(false);
        }
    };

    const addLevel = () => {
        setLevels(prev => [...prev, {
            level_number: prev.length + 1,
            title: `Bosqich ${prev.length + 1}`,
            unlock_xp: prev.length * 1000,
            order: prev.length,
            is_prestige_only: false,
            nodes: []
        }]);
    };

    const deleteLevel = (index: number) => {
        if (!confirm("Rostdan ham ushbu bosqichni o'chirmoqchimisiz?")) return;
        setLevels(prev => prev.filter((_, i) => i !== index));
    };

    const updateLevel = (index: number, field: keyof Level, value: any) => {
        setLevels(prev => {
            const next = [...prev];
            // @ts-ignore
            next[index][field] = value;
            return next;
        });
    };

    const addNode = (levelIndex: number) => {
        setLevels(prev => {
            const next = [...prev];
            next[levelIndex].nodes.push({
                title: "Yangi vazifa",
                node_type: "course",
                reference_id: null,
                is_required: true,
                xp_reward: 100,
                unlock_condition: null,
                order: next[levelIndex].nodes.length
            });
            return next;
        });
    };

    const updateNode = (levelIndex: number, nodeIndex: number, field: keyof Node, value: any) => {
        setLevels(prev => {
            const next = [...prev];
            // @ts-ignore
            next[levelIndex].nodes[nodeIndex][field] = value;
            return next;
        });
    };

    const deleteNode = (levelIndex: number, nodeIndex: number) => {
        setLevels(prev => {
            const next = [...prev];
            next[levelIndex].nodes = next[levelIndex].nodes.filter((_, i) => i !== nodeIndex);
            return next;
        });
    };

    const handleSave = async () => {
        try {
            // Because levels/nodes might have changed heavily, we send the entire graph to a custom sync endpoint,
            // or just iterate and create/update/delete.
            // For simplicity in UI, we'll POST to a dedicated sync endpoint that we need to add to ProfessionViewSet
            // Wait, we didn't add the sync endpoint!
            // Let's handle it by calling separate endpoints if needed, OR we can add a sync endpoint to the backend right now.
            await axios.post(`${API_URL}/professions/${id}/sync_builder/`, { levels }, { headers: getAuthHeader() });
            toast.success("Muvaffaqiyatli saqlandi!");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Saqlashda xatolik yuz berdi");
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Yuklanmoqda...</div>;
    if (!profession) return <div className="p-8 text-center text-red-500">Kasb topilmadi.</div>;

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'course': return <BookOpen className="w-4 h-4 text-blue-500" />;
            case 'olympiad': return <Trophy className="w-4 h-4 text-yellow-500" />;
            case 'project': return <Layout className="w-4 h-4 text-purple-500" />;
            case 'certificate': return <Award className="w-4 h-4 text-green-500" />;
            default: return <Settings className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-24">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/admin/professions')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            {profession.name}
                            <span className="text-lg bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                                Karyera Quruvchi
                            </span>
                        </h1>
                        <p className="text-muted-foreground">Bosqichlar, vazifalar, XP iqtisodiyoti va ochilish shartlarini yarating.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="font-bold rounded-xl" onClick={fetchData}>
                        Qayta yuklash
                    </Button>
                    <Button onClick={handleSave} className="font-bold rounded-xl gap-2 shadow-lg shadow-primary/25">
                        <Save className="w-4 h-4" />
                        Saqlash
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {levels.map((level, lIndex) => (
                    <Card key={lIndex} className="bg-muted/30 border-dashed border-2 overflow-hidden shadow-sm">
                        <div className="bg-muted/50 p-4 border-b flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab opacity-50" />
                                <div className="flex flex-col gap-1.5 w-full max-w-sm">
                                    <Label className="text-xs font-bold text-muted-foreground">Bosqich nomi</Label>
                                    <Input
                                        value={level.title}
                                        onChange={(e) => updateLevel(lIndex, 'title', e.target.value)}
                                        className="font-black text-lg h-10 rounded-xl bg-background"
                                        placeholder="Masalan: Boshlang'ich"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 w-32">
                                    <Label className="text-xs font-bold text-yellow-600 dark:text-yellow-500">Kerakli XP</Label>
                                    <Input
                                        type="number"
                                        value={level.unlock_xp}
                                        onChange={(e) => updateLevel(lIndex, 'unlock_xp', parseInt(e.target.value) || 0)}
                                        className="font-bold text-yellow-600 dark:text-yellow-500 h-10 rounded-xl bg-background border-yellow-500/20"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-2 rounded-xl border border-purple-500/20">
                                    <Label className="text-xs font-bold text-purple-700 dark:text-purple-400">Faqat VIP uchun</Label>
                                    <Switch
                                        checked={level.is_prestige_only}
                                        onCheckedChange={(c) => updateLevel(lIndex, 'is_prestige_only', c)}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteLevel(lIndex)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <CardContent className="p-4 pl-12 space-y-3">
                            {/* Nodes inside Level */}
                            {level.nodes.map((node, nIndex) => (
                                <div key={nIndex} className="bg-background border rounded-xl p-3 flex items-center gap-4 shadow-sm group">
                                    <div className="p-2 bg-muted rounded-lg">
                                        {getNodeIcon(node.node_type)}
                                    </div>

                                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                                        <div className="col-span-1 space-y-1">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Vazifa nomi</Label>
                                            <Input
                                                value={node.title}
                                                onChange={(e) => updateNode(lIndex, nIndex, 'title', e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="col-span-1 space-y-1">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Tur</Label>
                                            <Select
                                                value={node.node_type}
                                                onValueChange={(v) => updateNode(lIndex, nIndex, 'node_type', v)}
                                            >
                                                <SelectTrigger className="h-8 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="course">Kurs</SelectItem>
                                                    <SelectItem value="olympiad">Olimpiada</SelectItem>
                                                    <SelectItem value="project">Loyiha</SelectItem>
                                                    <SelectItem value="certificate">Sertifikat</SelectItem>
                                                    <SelectItem value="custom">Maxsus</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-1 space-y-1">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Bog'langan Resurs</Label>

                                            {node.node_type === 'course' ? (
                                                <Select
                                                    value={node.reference_id ? node.reference_id.toString() : ""}
                                                    onValueChange={(v) => updateNode(lIndex, nIndex, 'reference_id', parseInt(v))}
                                                >
                                                    <SelectTrigger className="h-8 text-sm">
                                                        <SelectValue placeholder="Kursni tanlang" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {courses.map(c => (
                                                            <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : node.node_type === 'olympiad' ? (
                                                <Select
                                                    value={node.reference_id ? node.reference_id.toString() : ""}
                                                    onValueChange={(v) => updateNode(lIndex, nIndex, 'reference_id', parseInt(v))}
                                                >
                                                    <SelectTrigger className="h-8 text-sm">
                                                        <SelectValue placeholder="Olimpiadani tanlang" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {olympiads.map(o => (
                                                            <SelectItem key={o.id} value={o.id.toString()}>{o.title}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    type="number"
                                                    value={node.reference_id || ''}
                                                    onChange={(e) => updateNode(lIndex, nIndex, 'reference_id', parseInt(e.target.value) || null)}
                                                    className="h-8 text-sm font-mono"
                                                    disabled={node.node_type !== 'project' && node.node_type !== 'certificate' && node.node_type !== 'custom'}
                                                    placeholder={node.node_type === 'custom' ? "Ixtiyoriy ID" : "ID"}
                                                />
                                            )}
                                        </div>
                                        <div className="col-span-1 space-y-1">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold text-green-600">Beriladigan XP</Label>
                                            <Input
                                                type="number"
                                                value={node.xp_reward}
                                                onChange={(e) => updateNode(lIndex, nIndex, 'xp_reward', parseInt(e.target.value) || 0)}
                                                className="h-8 text-sm font-bold text-green-600 bg-green-500/5 border-green-500/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-1 px-3 border-x border-border/50">
                                        <Label className="text-[9px] uppercase font-bold text-muted-foreground">Majburiy</Label>
                                        <Switch
                                            size="sm"
                                            checked={node.is_required}
                                            onCheckedChange={(c) => updateNode(lIndex, nIndex, 'is_required', c)}
                                        />
                                    </div>

                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity" onClick={() => deleteNode(lIndex, nIndex)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button variant="outline" size="sm" className="w-full mt-2 border-dashed bg-transparent" onClick={() => addNode(lIndex)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Yangi vazifa qo'shish
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                <Button variant="secondary" className="w-full h-14 rounded-2xl border-2 border-dashed font-bold text-muted-foreground bg-transparent hover:bg-muted/50" onClick={addLevel}>
                    <Plus className="w-5 h-5 mr-2" />
                    Yangi bosqich qo'shish
                </Button>
            </div>
        </div>
    );
};

export default AdminCareerBuilderPage;
