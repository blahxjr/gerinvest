import React from 'react';

type KpiCardProps = {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
};

const trendColors: Record<string, string> = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  neutral: 'text-slate-400',
};

export default function KpiCard({ label, value, subValue, trend = 'neutral', icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-slate-400">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subValue && (
        <p className={`text-xs mt-1 ${trendColors[trend]}`}>{subValue}</p>
      )}
    </div>
  );
}
