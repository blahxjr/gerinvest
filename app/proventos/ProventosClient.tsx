'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Provento, TIPO_PROVENTO_LABELS } from '@/core/domain/provento';
import { formatBRL } from '@/lib/utils';
import { DataTable } from '@/ui/components/DataTable';
import { KpiCard } from '@/ui/components/KpiCard';
import { EmptyState } from '@/ui/components/EmptyState';
import { PageHeader } from '@/ui/components/AppLayout';
import { ProventoFormModal } from '@/ui/components/dashboard/ProventoFormModal';
import { Button } from '@/ui/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { PlusCircle, Pencil, Trash2, TrendingUp } from 'lucide-react';

const columns: ColumnDef<Provento>[] = [
  {
    accessorKey: 'dataPagamento',
    header: 'Data',
    cell: ({ getValue }) => {
      const v = getValue<string>();
      return new Date(v + 'T12:00:00').toLocaleDateString('pt-BR');
    },
  },
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-sky-300">{getValue<string>() ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ getValue }) => TIPO_PROVENTO_LABELS[getValue<keyof typeof TIPO_PROVENTO_LABELS>()] ?? getValue<string>(),
  },
  {
    accessorKey: 'valorBruto',
    header: 'Valor Bruto',
    cell: ({ getValue }) => formatBRL(getValue<number>()),
  },
  {
    accessorKey: 'irRetido',
    header: 'IR Retido',
    cell: ({ getValue }) => {
      const v = getValue<number>();
      return v > 0
        ? <span className="text-rose-400">{formatBRL(v)}</span>
        : <span className="text-slate-500">—</span>;
    },
  },
  {
    accessorKey: 'valorLiquido',
    header: 'Valor Líquido',
    cell: ({ getValue }) => (
      <span className="font-semibold text-emerald-400">{formatBRL(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: 'impostoIncidente',
    header: 'DARF',
    cell: ({ getValue }) => {
      const v = getValue<number>();
      return v > 0
        ? <span className="text-orange-400 font-semibold">{formatBRL(v)}</span>
        : <span className="text-slate-500">—</span>;
    },
  },
  {
    accessorKey: 'competencia',
    header: 'Competência',
    cell: ({ getValue }) => getValue<string>() ?? '—',
  },
];

export default function ProventosClient() {
  const router = useRouter();
  const [proventos, setProventos] = useState<Provento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Provento | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchProventos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proventos');
      if (res.ok) {
        const data = await res.json();
        setProventos(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProventos(); }, [fetchProventos]);

  function handleNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleEdit(p: Provento) {
    setEditing(p);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    if (!confirm('Confirmar exclusão do provento?')) return;
    setDeletingId(id);
    startTransition(async () => {
      await fetch(`/api/proventos/${id}`, { method: 'DELETE' });
      setDeletingId(null);
      await fetchProventos();
      router.refresh();
    });
  }

  // KPIs
  const totalBruto = proventos.reduce((s, p) => s + p.valorBruto, 0);
  const totalLiquido = proventos.reduce((s, p) => s + p.valorLiquido, 0);
  const totalIR = proventos.reduce((s, p) => s + p.irRetido, 0);
  const totalDARF = proventos.reduce((s, p) => s + p.impostoIncidente, 0);

  // Adicionar coluna de ações à tabela
  const columnsWithActions: ColumnDef<Provento>[] = [
    ...columns,
    {
      id: 'acoes',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-1 rounded text-sky-400 hover:text-sky-200 transition-colors"
            aria-label={`Editar provento de ${row.original.ticker ?? row.original.tipo}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            disabled={deletingId === row.original.id || isPending}
            className="p-1 rounded text-rose-400 hover:text-rose-200 transition-colors disabled:opacity-40"
            aria-label={`Excluir provento de ${row.original.ticker ?? row.original.tipo}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proventos"
        subtitle="Dividendos, JCP, rendimentos FII e ganhos de capital"
        actions={
          <Button
            onClick={handleNew}
            className="bg-sky-600 hover:bg-sky-500 gap-2"
            aria-label="Adicionar novo provento"
          >
            <PlusCircle className="h-4 w-4" />
            Novo Provento
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Bruto" value={formatBRL(totalBruto)} icon={TrendingUp} />
        <KpiCard label="Total Líquido" value={formatBRL(totalLiquido)} />
        <KpiCard label="IR Retido (Fonte)" value={formatBRL(totalIR)} />
        <KpiCard
          label="DARF a Recolher"
          value={formatBRL(totalDARF)}
          alert={totalDARF > 0}
        />
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="h-48 rounded-xl bg-slate-800 animate-pulse" />
      ) : proventos.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Nenhum provento registrado"
          description="Adicione dividendos, JCP e rendimentos desta carteira."
          action={{ label: 'Adicionar Provento', onClick: handleNew }}
        />
      ) : (
        <DataTable columns={columnsWithActions} data={proventos} pageSize={25} />
      )}

      {/* Modal */}
      <ProventoFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={async () => {
          await fetchProventos();
          router.refresh();
        }}
      />
    </div>
  );
}
