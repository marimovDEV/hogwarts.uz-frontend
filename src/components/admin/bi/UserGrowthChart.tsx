import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const data = [
    { name: 'Jan 15', users: 40 },
    { name: 'Jan 16', users: 55 },
    { name: 'Jan 17', users: 85 },
    { name: 'Jan 18', users: 70 },
    { name: 'Jan 19', users: 110 },
    { name: 'Jan 20', users: 145 },
    { name: 'Jan 21', users: 190 },
];

const UserGrowthChart = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-foreground">{t('admin.dailyNewStudents')}</h3>
                <select className="bg-muted border border-border rounded-lg text-xs px-2 py-1 outline-none text-foreground">
                    <option>{t('admin.last7Days')}</option>
                    <option>{t('admin.last30Days')}</option>
                </select>
            </div>

            <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(name) => t(`months.${name.split(' ')[0].toLowerCase()}`)}
                        />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            labelFormatter={(label) => {
                                const [month, day] = label.split(' ');
                                return `${t(`months.${month.toLowerCase()}`)} ${day}`;
                            }}
                            formatter={(value: number) => [value, t('admin.charts.users')]}
                        />
                        <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UserGrowthChart;
