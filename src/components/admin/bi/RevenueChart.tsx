import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

const data = [
    { name: 'Matematika', value: 4500000, color: '#2563eb' }, // Blue
    { name: 'Informatika', value: 3000000, color: '#16a34a' }, // Green
    { name: 'Fizika', value: 1500000, color: '#9333ea' }, // Purple
    { name: 'Ingliz tili', value: 1000000, color: '#ef4444' }, // Red
    { name: 'Boshqa', value: 500000, color: '#f59e0b' }, // Yellow
];

const RevenueChart = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4 text-foreground">{t('admin.revenueSourcesTitle')}</h3>
            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            formatter={(value) => [`${(Number(value) / 1000000).toFixed(1)}M ${t('olympiadsSection.currency')}`, t('admin.charts.revenue')]}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
                {t('admin.totalRevenueLabel')}: <span className="text-foreground font-bold">10.5M {t('olympiadsSection.currency')}</span>
            </div>
        </div>
    );
};

export default RevenueChart;
