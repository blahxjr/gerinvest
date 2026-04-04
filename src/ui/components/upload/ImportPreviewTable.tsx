'use client';

import { useState, useCallback } from 'react';
import { CLASSE_ATIVO_LABELS } from '@/core/domain/types';
import type { ClasseAtivo } from '@/core/domain/types';

export type PreviewPosition = {
  id: string;
  ticker?: string;
  nome: string;
  classe: string;
  descricao?: string;
  instituicao?: string;
  conta?: string;
  quantidade?: number;
  precoMedio?: number;
  valorAtualBruto?: number;
  valorAtualBrl: number;
  moedaOriginal: string;
  dataVencimento?: string;
};

type Props = {
  positions: PreviewPosition[];
  onConfirm: (positions: PreviewPosition[]) => void;
  onCancel: () => void;
  confirming: boolean;
};

const classeOptions = Object.entries(CLASSE_ATIVO_LABELS) as [ClasseAtivo, string][];

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ImportPreviewTable({ positions: initial, onConfirm, onCancel, confirming }: Props) {
  const [rows, setRows] = useState<PreviewPosition[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<PreviewPosition | null>(null);
  const [filterClasse, setFilterClasse] = useState<string>('');
  const [search, setSearch] = useState('');

  const handleDelete = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditBuffer(null);
    }
  }, [editingId]);

  const handleEditStart = useCallback((row: PreviewPosition) => {
    setEditingId(row.id);
    setEditBuffer({ ...row });
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditBuffer(null);
  }, []);

  const handleEditSave = useCallback(() => {
    if (!editBuffer) return;
    setRows((prev) => prev.map((r) => (r.id === editBuffer.id ? editBuffer : r)));
    setEditingId(null);
    setEditBuffer(null);
  }, [editBuffer]);

  const handleFieldChange = useCallback((field: keyof PreviewPosition, value: string | number) => {
    setEditBuffer((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const filtered = rows.filter((r) => {
    if (filterClasse && r.classe !== filterClasse) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        (r.ticker?.toLowerCase().includes(term)) ||
        r.nome.toLowerCase().includes(term) ||
        (r.instituicao?.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const totalValue = rows.reduce((acc, r) => acc + (r.valorAtualBruto ?? r.valorAtualBrl ?? 0), 0);

  const classesSummary: Record<string, { count: number; value: number }> = {};
  rows.forEach((r) => {
    if (!classesSummary[r.classe]) classesSummary[r.classe] = { count: 0, value: 0 };
    classesSummary[r.classe].count += 1;
    classesSummary[r.classe].value += r.valorAtualBruto ?? r.valorAtualBrl ?? 0;
  });

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-white/10 bg-slate-800/60 p-3">
          <p className="text-xs text-slate-400">Total posições</p>
          <p className="text-lg font-bold text-sky-300">{rows.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-800/60 p-3">
          <p className="text-xs text-slate-400">Valor total</p>
          <p className="text-lg font-bold text-emerald-300">{formatBRL(totalValue)}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-800/60 p-3">
          <p className="text-xs text-slate-400">Classes</p>
          <p className="text-lg font-bold text-violet-300">{Object.keys(classesSummary).length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-800/60 p-3">
          <p className="text-xs text-slate-400">Removidos</p>
          <p className="text-lg font-bold text-red-300">{initial.length - rows.length}</p>
        </div>
      </div>

      {/* Resumo por classe */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(classesSummary).map(([classe, info]) => (
          <span
            key={classe}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-800 px-2.5 py-1 text-xs text-slate-200"
          >
            {CLASSE_ATIVO_LABELS[classe as ClasseAtivo] ?? classe}: {info.count} ({formatBRL(info.value)})
          </span>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por ticker, nome ou instituição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400"
        />
        <select
          value={filterClasse}
          onChange={(e) => setFilterClasse(e.target.value)}
          className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400"
          aria-label="Filtrar por classe de ativo"
        >
          <option value="">Todas as classes</option>
          {classeOptions.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full text-left text-sm text-slate-200" aria-label="Posições para importação">
          <thead className="bg-slate-700/70 text-xs text-slate-300 uppercase">
            <tr>
              <th scope="col" className="px-3 py-2">Ticker</th>
              <th scope="col" className="px-3 py-2">Nome</th>
              <th scope="col" className="px-3 py-2">Classe</th>
              <th scope="col" className="px-3 py-2">Instituição</th>
              <th scope="col" className="px-3 py-2">Conta</th>
              <th scope="col" className="px-3 py-2 text-right">Qtde</th>
              <th scope="col" className="px-3 py-2 text-right">Preço Médio</th>
              <th scope="col" className="px-3 py-2 text-right">Valor</th>
              <th scope="col" className="px-3 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((row) => {
              const isEditing = editingId === row.id;
              const data = isEditing && editBuffer ? editBuffer : row;

              return (
                <tr key={row.id} className={isEditing ? 'bg-sky-950/30' : 'hover:bg-slate-800/50'}>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.ticker ?? ''}
                        onChange={(e) => handleFieldChange('ticker', e.target.value)}
                        className="w-24 rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-xs"
                      />
                    ) : (
                      <span className="font-mono font-semibold text-sky-300">{row.ticker || '-'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.nome}
                        onChange={(e) => handleFieldChange('nome', e.target.value)}
                        className="w-40 rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-xs"
                      />
                    ) : (
                      row.nome
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <select
                        value={data.classe}
                        onChange={(e) => handleFieldChange('classe', e.target.value)}
                        className="rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-xs"
                      >
                        {classeOptions.map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs">
                        {CLASSE_ATIVO_LABELS[row.classe as ClasseAtivo] ?? row.classe}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.instituicao ?? ''}
                        onChange={(e) => handleFieldChange('instituicao', e.target.value)}
                        className="w-28 rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-xs"
                      />
                    ) : (
                      row.instituicao || '-'
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.conta ?? ''}
                        onChange={(e) => handleFieldChange('conta', e.target.value)}
                        className="w-24 rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-xs"
                      />
                    ) : (
                      row.conta || '-'
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={data.quantidade ?? ''}
                        onChange={(e) => handleFieldChange('quantidade', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-20 rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-xs text-right"
                      />
                    ) : (
                      row.quantidade ?? '-'
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={data.precoMedio ?? ''}
                        onChange={(e) => handleFieldChange('precoMedio', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-24 rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-xs text-right"
                      />
                    ) : (
                      row.precoMedio != null ? formatBRL(row.precoMedio) : '-'
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={data.valorAtualBruto ?? data.valorAtualBrl ?? ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? 0 : Number(e.target.value);
                          handleFieldChange('valorAtualBruto', v);
                          handleFieldChange('valorAtualBrl', v);
                        }}
                        className="w-28 rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-xs text-right"
                      />
                    ) : (
                      formatBRL(row.valorAtualBruto ?? row.valorAtualBrl ?? 0)
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={handleEditSave}
                            className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                            aria-label={`Salvar edição de ${row.ticker ?? row.nome}`}
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={handleEditCancel}
                            className="rounded bg-slate-600 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-500"
                            aria-label="Cancelar edição"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditStart(row)}
                            className="rounded bg-sky-700 px-2 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                            aria-label={`Editar ${row.ticker ?? row.nome}`}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="rounded bg-red-700 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600"
                            aria-label={`Excluir ${row.ticker ?? row.nome}`}
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="py-4 text-center text-sm text-slate-400">
          {rows.length === 0 ? 'Todas as posições foram removidas.' : 'Nenhum resultado para os filtros aplicados.'}
        </p>
      )}

      <p className="text-xs text-slate-400">
        Mostrando {filtered.length} de {rows.length} posições
        {initial.length !== rows.length && ` (${initial.length - rows.length} removidas)`}
      </p>

      {/* Botões de ação */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => onConfirm(rows)}
          disabled={rows.length === 0 || confirming}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Confirmar importação"
        >
          {confirming ? 'Importando...' : `Confirmar importação (${rows.length} posições)`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={confirming}
          className="rounded-lg border border-white/10 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          aria-label="Cancelar importação"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
