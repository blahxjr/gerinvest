'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Position } from '@/core/domain/position';
import { AllocationEntry } from '@/core/domain/portfolio';

type Props = {
  positions: Position[];
  topPositions: Position[];
  fixedVsVariable: { fixed: number; variable: number };
};

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded p-2 text-sm">
        <p className="text-slate-100">{`${label}: ${formatBRL(data.value ?? data.grossValue ?? 0)}`}</p>
      </div>
    );
  }
  return null;
};

export default function DistributionCharts({ positions, topPositions, fixedVsVariable }: Props) {
  // Simular evolução histórica (placeholder, pois não há dados reais)
  const historicalData = [
    { date: '2023-01', value: 50000 },
    { date: '2023-02', value: 52000 },
    { date: '2023-03', value: 51000 },
    { date: '2023-04', value: 53000 },
  ];

  const top10Data = topPositions.slice(0, 10).map(pos => ({
    name: pos.ticker,
    value: pos.grossValue,
  }));

  const fixedVariableData = [
    { name: 'Renda Fixa', value: fixedVsVariable.fixed, color: '#f59e0b' },
    { name: 'Renda Variável', value: fixedVsVariable.variable, color: '#10b981' },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-3">Evolução Patrimonial</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-3">Top 10 Posições</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={top10Data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-3">Renda Fixa vs Variável</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={fixedVariableData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {fixedVariableData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}