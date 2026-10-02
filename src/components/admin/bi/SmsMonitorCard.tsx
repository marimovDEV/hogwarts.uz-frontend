import { MessageSquare, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

const SmsMonitorCard = () => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    SMS Monitoring (Bugun)
                </h3>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Live</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-xs text-blue-600 font-medium mb-1">Yuborildi</div>
                    <div className="text-2xl font-black text-blue-900">1,248</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                    <div className="text-xs text-red-600 font-medium mb-1">Xatolik</div>
                    <div className="text-2xl font-black text-red-900">12</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                    <div className="text-xs text-yellow-600 font-medium mb-1">Xarajat</div>
                    <div className="text-2xl font-black text-yellow-900">450k</div>
                </div>
            </div>

            {/* Progress Bar for Limit */}
            <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
                <span>Kunlik limit (5000 ta)</span>
                <span>25% ishlatildi</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-6">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '25%' }}></div>
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <div className="text-xs font-bold text-gray-900">Failed Delivery (+998 90 123..)</div>
                        <div className="text-[10px] text-gray-500">Provider Error • 10:42 AM</div>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <div>
                        <div className="text-xs font-bold text-gray-900">Batch SMS Sent (Olympiad Start)</div>
                        <div className="text-[10px] text-gray-500">500 users notified • 09:00 AM</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmsMonitorCard;
