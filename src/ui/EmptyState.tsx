import React from 'react';

type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: string;
};

export default function EmptyState({
  title = 'Nenhum dado encontrado',
  description = 'Importe sua planilha de investimentos para começar.',
  action,
  icon = '📂',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-slate-800 p-12 text-center shadow-lg">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
