'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Position } from '@/core/domain/position';

type Props = {
  positions: Position[];
  topPositions: Position[];
  fixedVsVariable: { fixed: number; variable: number };
};

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: { value?: number; grossValue?: number } }>;
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
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
  const historicalData = positions
    .filter((position) => position.dataEntrada)
    .reduce<Record<string, number>>((acc, position) => {
      const date = new Date(position.dataEntrada as string);
      if (Number.isNaN(date.getTime())) return acc;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const value = position.grossValue ?? position.valorAtualBruto ?? 0;
      acc[month] = (acc[month] ?? 0) + value;
      return acc;
    }, {});

  const historicalSeries = Object.entries(historicalData)
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([date, value]) => ({ date, value }));

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
        {historicalSeries.length > 1 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historicalSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-slate-600 text-sm text-slate-300">
            Dados insuficientes para série histórica. Inclua data de entrada nas posições.
          </div>
        )}
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