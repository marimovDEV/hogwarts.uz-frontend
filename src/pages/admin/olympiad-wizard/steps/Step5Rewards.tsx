
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Award, FileBadge, Medal, Upload, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";

interface Prize {
    id: number;
    name: string;
    prize_type: 'PHYSICAL' | 'COIN' | 'XP';
    amount: number;
    target_value: number;
    description: string;
    image: string | null;
}

const Step5Rewards = ({ data, update, olympiadId }: { data: any, update: (d: any) => void, olympiadId?: number }) => {
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
    const [prizeForm, setPrizeForm] = useState({
        name: "",
        prize_type: "PHYSICAL" as 'PHYSICAL' | 'COIN' | 'XP',
        amount: 0,
        target_value: 1,
        description: "",
        image: null as File | null
    });

    useEffect(() => {
        if (olympiadId) fetchPrizes();
    }, [olympiadId]);

    const fetchPrizes = async () => {
        try {
            const res = await axios.get(`${API_URL}/olympiad-prizes/?olympiad_id=${olympiadId}`, { headers: getAuthHeader() });
            // Handle pagination (results array) or direct array
            setPrizes(Array.isArray(res.data) ? res.data : (res.data.results || []));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSavePrize = async () => {
        if (!olympiadId) return;

        const fd = new FormData();
        fd.append('olympiad', olympiadId.toString());
        fd.append('name', prizeForm.name);
        fd.append('prize_type', prizeForm.prize_type);
        fd.append('amount', prizeForm.amount.toString());
        fd.append('target_value', prizeForm.target_value.toString());
        fd.append('description', prizeForm.description);
        if (prizeForm.image) {
            fd.append('image', prizeForm.image);
        }

        try {
            if (editingPrize) {
                await axios.patch(`${API_URL}/olympiad-prizes/${editingPrize.id}/`, fd, { headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' } });
                toast.success("Sovrin yangilandi");
            } else {
                await axios.post(`${API_URL}/olympiad-prizes/`, fd, { headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' } });
                toast.success("Sovrin qo'shildi");
            }
            setIsDialogOpen(false);
            setPrizeForm({ name: "", condition: "", value: "", description: "", image: null });
            setEditingPrize(null);
            fetchPrizes();
        } catch (error) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const handleDeletePrize = async (id: number) => {
        if (!confirm("O'chirmoqchimisiz?")) return;
        try {
            await axios.delete(`${API_URL}/olympiad-prizes/${id}/`, { headers: getAuthHeader() });
            toast.success("O'chirildi");
            fetchPrizes();
        } catch (error) {
            toast.error("Xatolik");
        }
    };

    // Certificate Helpers
    const certConfig = data.certificate_config || { enabled: false, threshold_percent: 60 };
    const updateCert = (field: string, val: any) => {
        update({ certificate_config: { ...certConfig, [field]: val } });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Reward Strategy Section */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-lg border-b pb-2">
                    <Award className="w-5 h-5 text-amber-500" /> Mukofotlash Strategiyasi
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Strategiya</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={data.reward_strategy || 'MANUAL'}
                            onChange={(e) => update({ ...data, reward_strategy: e.target.value })}
                        >
                            <option value="MANUAL">Qo'lda (Manual)</option>
                            <option value="TOP_N">Top G'oliblar (1, 2, 3...)</option>
                            <option value="THRESHOLD">Ball Foizi bo'yicha (e.g. 90%+ )</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                            {data.reward_strategy === 'TOP_N' ? "Sovrinlar o'rinlar bo'yicha tarqatiladi." : data.reward_strategy === 'THRESHOLD' ? "Belgilangan foizdan yuqori olganlarga tarqatiladi." : "Sovrinlarni admin o'zi biriktiradi."}
                        </p>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                        <div className="space-y-0.5">
                            <Label className="text-base text-amber-600 font-bold">Avtomatik Tarqatish</Label>
                            <p className="text-[10px] text-muted-foreground uppercase">Natijalar e'lon qilinganda</p>
                        </div>
                        <Switch
                            checked={!!data.auto_reward}
                            onCheckedChange={(c) => update({ ...data, auto_reward: c })}
                        />
                    </div>
                </div>
            </div>

            {/* Certificate Section */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-lg border-b pb-2">
                    <FileBadge className="w-5 h-5 text-blue-500" /> Sertifikatlar
                </h3>

                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                    <div className="space-y-0.5">
                        <Label className="text-base">Sertifikat Berish</Label>
                        <p className="text-sm text-muted-foreground">Ishtirokchilarga avtomatik sertifikat generatsiya qilish</p>
                    </div>
                    <Switch
                        checked={!!certConfig.enabled}
                        onCheckedChange={(c) => updateCert('enabled', c)}
                    />
                </div>

                {certConfig.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label>Minimal Natija (%)</Label>
                            <Input
                                type="number"
                                value={certConfig.threshold_percent}
                                onChange={(e) => updateCert('threshold_percent', Number(e.target.value))}
                                max={100} min={0}
                            />
                            <p className="text-xs text-muted-foreground">Necha foizdan yuqori olganlarga beriladi?</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Prizes Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="flex items-center gap-2 font-semibold text-lg">
                        <Medal className="w-5 h-5 text-yellow-500" /> Sovrinlar
                    </h3>
                    <Button onClick={() => { setEditingPrize(null); setIsDialogOpen(true); }} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> Sovrin Qo'shish
                    </Button>
                </div>

                {/* Prize List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prizes.map((prize) => (
                        <Card key={prize.id} className="relative group overflow-hidden border-dashed hover:border-solid hover:border-primary/50 transition-colors">
                            <div className="aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
                                {prize.image ? (
                                    <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Award className="w-12 h-12 text-muted-foreground/50" />
                                )}
                            </div>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold truncate">{prize.name}</h4>
                                        <p className="text-sm text-blue-600 font-medium">
                                            {prize.prize_type === 'COIN' ? `🪙 ${prize.amount} Coin` :
                                                prize.prize_type === 'XP' ? `🚀 ${prize.amount} XP` :
                                                    `📦 Fizik sovrin`}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                            {data.reward_strategy === 'TOP_N' ? `${prize.target_value}-o'rin uchun` : `${prize.target_value}% ball uchun`}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeletePrize(prize.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                {prize.value && <p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" /> {prize.value}</p>}
                            </CardContent>
                        </Card>
                    ))}

                    {prizes.length === 0 && (
                        <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                            <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Hozircha sovrinlar yo'q</p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPrize ? "Sovrinni Tahrirlash" : "Yangi Sovrin Qo'shish"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Sovrin Turi</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={prizeForm.prize_type}
                                    onChange={(e: any) => setPrizeForm({ ...prizeForm, prize_type: e.target.value })}
                                >
                                    <option value="PHYSICAL">Fizik (Medal, Kitob...)</option>
                                    <option value="COIN">Hogwords Coin</option>
                                    <option value="XP">Tajriba (XP)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>{prizeForm.prize_type === 'PHYSICAL' ? 'Nomi' : 'Miqdori'}</Label>
                                {prizeForm.prize_type === 'PHYSICAL' ? (
                                    <Input
                                        placeholder="Masalan: MacBook Air"
                                        value={prizeForm.name}
                                        onChange={(e) => setPrizeForm({ ...prizeForm, name: e.target.value })}
                                    />
                                ) : (
                                    <Input
                                        type="number"
                                        placeholder="Miqdor"
                                        value={prizeForm.amount}
                                        onChange={(e) => setPrizeForm({ ...prizeForm, amount: Number(e.target.value), name: `${e.target.value} ${prizeForm.prize_type}` })}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{data.reward_strategy === 'TOP_N' ? "Nechanchi o'rin uchun?" : "Minimal Ball (%)"}</Label>
                            <Input
                                type="number"
                                placeholder={data.reward_strategy === 'TOP_N' ? "1, 2, 3..." : "90, 80..."}
                                value={prizeForm.target_value}
                                onChange={(e) => setPrizeForm({ ...prizeForm, target_value: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rasm</Label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Rasm yuklash</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setPrizeForm({ ...prizeForm, image: e.target.files?.[0] || null })} />
                                </label>
                            </div>
                            {prizeForm.image && <p className="text-sm text-green-600 text-center">{prizeForm.image.name}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Bekor qilish</Button>
                        <Button onClick={handleSavePrize}>Saqlash</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Step5Rewards;
