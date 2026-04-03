'use client';

import { useState } from 'react';
import AnalysisPanel from '@/ui/components/analysis/AnalysisPanel';

interface DashboardClientProps {
  children: React.ReactNode;
}

export default function DashboardClient({ children }: DashboardClientProps) {
  const [analysisOpen, setAnalysisOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <section className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-sky-400">Dashboard da Carteira</h1>
              <p className="text-slate-300">Resumo de posições e alocação a partir de CSVs importados.</p>
            </div>
            <button
              onClick={() => setAnalysisOpen(true)}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
              aria-label="Abrir análises da carteira"
            >
              📊 Analisar
            </button>
          </div>

          <div className="flex gap-3 mb-6">
            <a
              href="/upload"
              className="rounded bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-semibold text-black transition"
            >
              Ir para importação
            </a>
            <a
              href="/cadastro"
              className="rounded bg-sky-600 hover:bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition"
            >
              Cadastrar
            </a>
          </div>

          {children}
        </section>
      </main>

      <AnalysisPanel isOpen={analysisOpen} onClose={() => setAnalysisOpen(false)} />
    </>
  );
}
