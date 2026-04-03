'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AllocationEntry } from '@/core/domain/portfolio';
import { ASSET_CLASS_COLORS } from '@/core/domain/types';

type Props = {
  assetClass: AllocationEntry[];
  institution: AllocationEntry[];
};

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded p-2 text-sm">
        <p className="text-slate-100">{`${label}: ${formatBRL(data.value)} (${formatPercent(data.percentage)})`}</p>
      </div>
    );
  }
  return null;
};

export default function AllocationCharts({ assetClass, institution }: Props) {
  const assetClassData = assetClass.map(item => ({
    name: item.classe || item.institution || 'Desconhecido',
    value: item.value,
    percentage: item.percentage,
    color: ASSET_CLASS_COLORS[(item.classe || 'ALTERNATIVO') as keyof typeof ASSET_CLASS_COLORS] || '#94a3b8',
  }));

  const institutionData = institution.slice(0, 10).map(item => ({
    name: item.institution || 'Outros',
    value: item.value,
    percentage: item.percentage,
  }));

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-3">Alocação por classe de ativo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={assetClassData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {assetClassData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-3">Alocação por instituição</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={institutionData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="name" type="category" width={80} stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
