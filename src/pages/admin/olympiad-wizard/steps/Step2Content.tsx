
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Step2Content = ({ data, update }: { data: any, update: (d: any) => void }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-lg">Tavsif (Description) <span className="text-red-500">*</span></Label>
                    <p className="text-sm text-muted-foreground">Olimpiada haqida umumiy ma'lumot.</p>
                    <Textarea
                        value={data.description}
                        onChange={(e) => update({ description: e.target.value })}
                        placeholder="Olimpiada maqsadi va kimlar qatnashishi mumkinligi haqida..."
                        className="min-h-[150px]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Label>Qoidalar</Label>
                        <p className="text-xs text-muted-foreground">Ishtirokchilar rioya qilishi kerak bo'lgan tartib-qoidalar.</p>
                        <Textarea
                            value={data.rules}
                            onChange={(e) => update({ rules: e.target.value })}
                            placeholder="- Kamera yoqilgan bo'lishi shart&#10;- Tab almashtirish mumkin emas&#10;- ..."
                            className="min-h-[150px] font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Baholash Mezonlari</Label>
                        <p className="text-xs text-muted-foreground">Ballar qanday hisoblanishi va taqsimlanishi.</p>
                        <Textarea
                            value={data.evaluation_criteria}
                            onChange={(e) => update({ evaluation_criteria: e.target.value })}
                            placeholder="Har bir to'g'ri javob uchun 5 ball..."
                            className="min-h-[150px] font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2 bg-yellow-500/5 p-6 rounded-xl border border-yellow-500/20">
                    <Label className="text-yellow-600 dark:text-yellow-400 font-bold">Sovrinlar</Label>
                    <p className="text-sm text-muted-foreground">G'oliblarga beriladigan mukofotlar.</p>
                    <Textarea
                        value={data.prizes}
                        onChange={(e) => update({ prizes: e.target.value })}
                        placeholder="1-o'rin: Laptop&#10;2-o'rin: Tablet&#10;3-o'rin: Smartwatch"
                        className="min-h-[100px]"
                    />
                </div>
            </div>
        </div>
    );
};

export default Step2Content;
