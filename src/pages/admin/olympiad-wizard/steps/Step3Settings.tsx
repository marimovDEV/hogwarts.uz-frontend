
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Calendar, Clock, DollarSign, Shield, Users } from "lucide-react";

const Step3Settings = ({ data, update }: { data: any, update: (d: any) => void }) => {

    // Auto-calculate duration helper could go here, but kept simple for now

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Schedule */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-lg border-b pb-2">
                    <Calendar className="w-5 h-5 text-blue-500" /> Vaqt va Jadval
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-dashed">
                    <div className="space-y-2">
                        <Label className="text-indigo-600 font-bold">Ro'yxatdan o'tish boshlanishi</Label>
                        <DateTimePicker
                            date={data.registration_start ? new Date(data.registration_start) : undefined}
                            setDate={(d) => update({ registration_start: d ? format(d, "yyyy-MM-dd'T'HH:mm") : "" })}
                            placeholder="Vaqtni tanlang"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-indigo-600 font-bold">Ro'yxatdan o'tish tugashi</Label>
                        <DateTimePicker
                            date={data.registration_end ? new Date(data.registration_end) : undefined}
                            setDate={(d) => update({ registration_end: d ? format(d, "yyyy-MM-dd'T'HH:mm") : "" })}
                            placeholder="Vaqtni tanlang"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-green-600 font-bold">Olimpiada boshlanishi</Label>
                        <DateTimePicker
                            date={data.start_date ? new Date(data.start_date) : undefined}
                            setDate={(d) => update({ start_date: d ? format(d, "yyyy-MM-dd'T'HH:mm") : "" })}
                            placeholder="Vaqtni tanlang"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-green-600 font-bold">Olimpiada tugashi</Label>
                        <DateTimePicker
                            date={data.end_date ? new Date(data.end_date) : undefined}
                            setDate={(d) => update({ end_date: d ? format(d, "yyyy-MM-dd'T'HH:mm") : "" })}
                            placeholder="Vaqtni tanlang"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Davomiyligi (daqiqa)</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="number"
                                className="pl-9"
                                value={data.duration}
                                onChange={(e) => update({ duration: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Holat</Label>
                        <Select value={data.status} onValueChange={(val) => update({ status: val })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">Qoralama</SelectItem>
                                <SelectItem value="REGISTRATION_OPEN">Ro'yxatga olish boshlandi</SelectItem>
                                <SelectItem value="REGISTRATION_CLOSED">Ro'yxatdan o'tish tugadi</SelectItem>
                                <SelectItem value="ONGOING">Olimpiada boshladi</SelectItem>
                                <SelectItem value="CHECKING">Tekshirilmoqda</SelectItem>
                                <SelectItem value="PUBLISHED">Natijalar e'lon qilindi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Payment */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-lg border-b pb-2">
                    <DollarSign className="w-5 h-5 text-green-500" /> To'lov Sozlamalari
                </h3>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/40">
                    <div className="space-y-0.5">
                        <Label className="text-base">Pullik Olimpiada</Label>
                        <p className="text-sm text-muted-foreground">Ishtirok etish uchun to'lov talab qilish</p>
                    </div>
                    <Switch
                        checked={!!data.is_paid}
                        onCheckedChange={(checked) => update({ is_paid: checked })}
                    />
                </div>

                {data.is_paid && (
                    <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label>Narxi (ArdCoin)</Label>
                            <Input
                                type="number"
                                value={data.price ?? 0}
                                onChange={(e) => update({ price: e.target.value === '' ? 0 : Number(e.target.value) })}
                                min={0}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Chegirma (%)</Label>
                            <Input
                                type="number"
                                value={data.discount_percent ?? 0}
                                onChange={(e) => update({ discount_percent: e.target.value === '' ? 0 : Number(e.target.value) })}
                                max={100}
                                min={0}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Security */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-lg border-b pb-2">
                    <Shield className="w-5 h-5 text-red-500" /> Xavfsizlik va Cheklovlar
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div className="space-y-0.5">
                            <Label>Tasodifiy Savollar</Label>
                            <p className="text-xs text-muted-foreground">Savollar o'rnini almashtirish</p>
                        </div>
                        <Switch
                            checked={!!data.is_random}
                            onCheckedChange={(c) => update({ is_random: c })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div className="space-y-0.5">
                            <Label>Full Screen</Label>
                            <p className="text-xs text-muted-foreground">To'liq ekran rejimini talab qilish</p>
                        </div>
                        <Switch
                            checked={!!data.required_full_screen}
                            onCheckedChange={(c) => update({ required_full_screen: c })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div className="space-y-0.5">
                            <Label>Copy/Pasteni O'chirish</Label>
                            <p className="text-xs text-muted-foreground">Matnni ko'chirish va joylashni taqiqlash</p>
                        </div>
                        <Switch
                            checked={!!data.disable_copy_paste}
                            onCheckedChange={(c) => update({ disable_copy_paste: c })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div className="space-y-0.5">
                            <Label>Orqaga qaytish yo'q</Label>
                            <p className="text-xs text-muted-foreground">Oldingi savolga qaytishni taqiqlash</p>
                        </div>
                        <Switch
                            checked={!!data.cannot_go_back}
                            onCheckedChange={(c) => update({ cannot_go_back: c })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div className="space-y-0.5">
                            <Label>Kamera Nazorati</Label>
                            <p className="text-xs text-muted-foreground">Veb-kamerani yoqishni talab qilish</p>
                        </div>
                        <Switch
                            checked={!!data.required_camera}
                            onCheckedChange={(c) => update({ required_camera: c })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="space-y-2">
                        <Label>Tab Switch Limiti</Label>
                        <Input
                            type="number"
                            value={data.tab_switch_limit}
                            onChange={(e) => update({ tab_switch_limit: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Maksimal Urinishlar</Label>
                        <Input
                            type="number"
                            value={data.max_attempts}
                            onChange={(e) => update({ max_attempts: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Savol vaqti (soniya)</Label>
                        <Input
                            type="number"
                            placeholder="0 = Cheklovsiz"
                            value={data.time_limit_per_question}
                            onChange={(e) => update({ time_limit_per_question: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            {/* Eligibility */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-lg border-b pb-2">
                    <Users className="w-5 h-5 text-purple-500" /> Kimlar qatnasha oladi? (Eligibility)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Sinflar (Vergul bilan ajrating)</Label>
                        <Input
                            placeholder="Masalan: 5, 6, 7, 8, 9, 10, 11"
                            value={Array.isArray(data.eligibility_grades) ? data.eligibility_grades.join(", ") : data.eligibility_grades || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                // updating as string for now, will parse on submit or let parent handle?
                                // Let's try to parse immediately if valid? 
                                // Better to keep it string in UI state if possible, but data prop is from parent state.
                                // If parent state expects array, we must convert.
                                const arr = val.split(',').map(s => s.trim()).filter(Boolean);
                                update({ eligibility_grades: arr });
                            }}
                        />
                        <p className="text-xs text-muted-foreground">Bo'sh qoldirilsa barcha sinflar uchun</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Hududlar (Vergul bilan ajrating)</Label>
                        <Input
                            placeholder="Masalan: Toshkent shahri, Samarqand"
                            value={Array.isArray(data.eligibility_regions) ? data.eligibility_regions.join(", ") : data.eligibility_regions || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                const arr = val.split(',').map(s => s.trim()).filter(Boolean);
                                update({ eligibility_regions: arr });
                            }}
                        />
                        <p className="text-xs text-muted-foreground">Bo'sh qoldirilsa barcha hududlar uchun</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Maksimal Qatnashchilar soni</Label>
                        <Input
                            type="number"
                            placeholder="Cheklovsiz"
                            value={data.max_participants || ""}
                            onChange={(e) => update({ max_participants: e.target.value === "" ? "" : Number(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            {/* Technical Config */}
            <div className="space-y-4 pt-4">
                <h3 className="flex items-center gap-2 font-semibold text-lg border-b pb-2">
                    <Shield className="w-5 h-5 text-gray-500" /> Texnik Sozlamalar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Internet Policy - simple text for now or select */}
                    <div className="space-y-2">
                        <Label>Internet Uzilishi Siyosati</Label>
                        <Select
                            value={data.technical_config?.internet_policy || 'allow_resume'}
                            onValueChange={(val) => update({ technical_config: { ...data.technical_config, internet_policy: val } })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="allow_resume">Qayta ulanishga ruxsat (Vaqt ketib turadi)</SelectItem>
                                <SelectItem value="pause_timer">Vaqtni to'xtatib turish</SelectItem>
                                <SelectItem value="auto_submit">Avtomatik yakunlash</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step3Settings;
