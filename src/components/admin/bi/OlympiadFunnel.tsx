import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const data = [
    { name: 'Ro\'yxatdan o\'tdi', count: 1200, color: '#94a3b8' },
    { name: 'Testni boshladi', count: 980, color: '#3b82f6' },
    { name: 'Yakunladi', count: 850, color: '#22c55e' },
    { name: 'Sertifikat oldi', count: 400, color: '#eab308' },
];

const OlympiadFunnel = () => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-lg mb-2 text-gray-900">Olimpiada Funnel (Sifat Nazorati)</h3>
            <p className="text-sm text-gray-500 mb-6">So'nggi olimpiadada ishtirokchilar oqimi</p>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 border-t border-gray-100 pt-4">
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Start Rate</div>
                    <div className="text-lg font-bold text-gray-900">81.6%</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase">Completion Rate</div>
                    <div className="text-lg font-bold text-green-600">86.7%</div>
                </div>
            </div>
        </div>
    );
};

export default OlympiadFunnel;
