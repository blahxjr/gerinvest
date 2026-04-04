'use client';

import { useState, useMemo } from 'react';
import { Position } from '@/core/domain/position';
import { AssetClass } from '@/core/domain/types';
import EditPositionModal from './EditPositionModal';
import { EmptyState } from '@/ui/components/EmptyState';
import { Table } from 'lucide-react';

type Props = {
  positions: Position[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ITEMS_PER_PAGE = 25;

export default function PositionsTable({ positions }: Props) {
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [filters, setFilters] = useState({
    assetClass: [] as AssetClass[],
    institution: [] as string[],
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPositions = useMemo(() => {
    return positions.filter(p => {
      const assetClass = p.assetClass || p.classe;
      const institution = p.institution || p.instituicao || 'Outros';
      const ticker = p.ticker || '';
      const description = p.description || p.descricao || '';
      
      if (filters.assetClass.length > 0 && assetClass && !filters.assetClass.includes(assetClass)) return false;
      if (filters.institution.length > 0 && !filters.institution.includes(institution)) return false;
      if (filters.search && !ticker.toLowerCase().includes(filters.search.toLowerCase()) && !description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [positions, filters]);

  const totalPages = Math.ceil(filteredPositions.length / ITEMS_PER_PAGE);
  const paginatedPositions = filteredPositions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const uniqueAssetClasses = [...new Set(positions.map(p => p.assetClass || p.classe).filter(Boolean))];
  const uniqueInstitutions = [...new Set(positions.map(p => p.institution || p.instituicao || 'Outros'))];

  if (positions.length === 0) {
    return (
      <EmptyState
        icon={Table}
        title="Nenhuma posição encontrada"
        description="Faça a importação da carteira para habilitar análises e gráficos."
        action={{ label: 'Ir para importação', onClick: () => { window.location.href = '/upload'; } }}
      />
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
      <h3 className="text-lg font-semibold text-sky-300 mb-3">Tabela de posições</h3>
      
      {/* Filtros */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Buscar por ticker ou descrição..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full rounded-md bg-slate-700 border-slate-600 text-slate-100 p-2"
        />
        <div className="flex space-x-4">
          <select
            multiple
            value={filters.assetClass}
            onChange={(e) => setFilters({ ...filters, assetClass: Array.from(e.target.selectedOptions, o => o.value as AssetClass) })}
            className="rounded-md bg-slate-700 border-slate-600 text-slate-100 p-2"
          >
            {uniqueAssetClasses.map(ac => <option key={ac} value={ac}>{ac}</option>)}
          </select>
          <select
            multiple
            value={filters.institution}
            onChange={(e) => setFilters({ ...filters, institution: Array.from(e.target.selectedOptions, o => o.value) })}
            className="rounded-md bg-slate-700 border-slate-600 text-slate-100 p-2"
          >
            {uniqueInstitutions.map(inst => <option key={inst} value={inst}>{inst}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead>
            <tr>
              <th className="px-3 py-2">Ticker</th>
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2">Instituição</th>
              <th className="px-3 py-2">Conta</th>
              <th className="px-3 py-2">Quant</th>
              <th className="px-3 py-2">Preço</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">% Carteira</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPositions.map((p) => {
              const price = p.price ?? p.precoMedio ?? 0;
              const grossValue = p.grossValue ?? p.valorAtualBruto ?? 0;
              const totalValue = positions.reduce((sum, q) => sum + (q.grossValue ?? q.valorAtualBruto ?? 0), 0);
              
              return (
              <tr key={p.id} className="border-b border-white/10 hover:bg-slate-900">
                <td className="px-3 py-2">{p.ticker || '-'}</td>
                <td className="px-3 py-2">{p.description || p.descricao || '-'}</td>
                <td className="px-3 py-2">{p.institution || p.instituicao || '-'}</td>
                <td className="px-3 py-2">{p.account || p.conta || '-'}</td>
                <td className="px-3 py-2">{p.quantity || p.quantidade || 0}</td>
                <td className="px-3 py-2">{formatCurrency(price)}</td>
                <td className="px-3 py-2">{formatCurrency(grossValue)}</td>
                <td className="px-3 py-2 min-w-[120px]">
                  <div className="text-xs text-slate-300 mb-1">{(grossValue / Math.max(1, totalValue) * 100).toFixed(2)}%</div>
                  <div className="h-1.5 w-full rounded-full bg-slate-700/70 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-teal-500"
                      style={{ width: `${Math.min((grossValue / Math.max(1, totalValue) * 100), 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => setEditingPosition(p)}
                    className="text-sky-400 hover:text-sky-200 transition-colors p-1 rounded"
                    aria-label={`Editar posição ${p.ticker}`}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="mt-4 flex justify-between items-center">
        <p className="text-slate-300">Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredPositions.length)} de {filteredPositions.length} posições</p>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-slate-600 text-slate-100 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-slate-600 text-slate-100 rounded disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>

      {editingPosition && (
        <EditPositionModal
          position={editingPosition}
          onClose={() => setEditingPosition(null)}
        />
      )}
    </section>
  );
}
