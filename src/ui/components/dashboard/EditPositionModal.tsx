'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Position } from '@/core/domain/position';
import { AssetClass, ASSET_CLASS_LABELS } from '@/core/domain/types';

type Props = {
  position: Position;
  onClose: () => void;
};

export default function EditPositionModal({ position, onClose }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    ticker: position.ticker || '',
    description: position.description || '',
    assetClass: position.assetClass || 'ALTERNATIVO',
    institution: position.institution || '',
    account: position.account || '',
    quantity: (position.quantity || 0).toString(),
    price: (position.price ?? 0).toString(),
    grossValue: (position.grossValue ?? 0).toString(),
    indexer: position.indexer || '',
    maturityDate: position.maturityDate || '',
    issuer: position.issuer || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const updated = {
        ...form,
        quantity: parseFloat(form.quantity),
        price: parseFloat(form.price),
        grossValue: parseFloat(form.grossValue),
      };

      const res = await fetch(`/api/positions/${position.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao salvar');
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-sky-300 mb-4">Editar Posição</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200">Ticker</label>
            <input
              type="text"
              value={form.ticker}
              onChange={(e) => setForm({ ...form, ticker: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Descrição</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Classe de Ativo</label>
            <select
              value={form.assetClass}
              onChange={(e) => setForm({ ...form, assetClass: e.target.value as AssetClass })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
            >
              {Object.entries(ASSET_CLASS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Instituição</label>
            <input
              type="text"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Conta</label>
            <input
              type="text"
              value={form.account}
              onChange={(e) => setForm({ ...form, account: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Quantidade</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Preço</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Valor Bruto</label>
            <input
              type="number"
              step="0.01"
              value={form.grossValue}
              onChange={(e) => setForm({ ...form, grossValue: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Indexador</label>
            <input
              type="text"
              value={form.indexer}
              onChange={(e) => setForm({ ...form, indexer: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Data de Vencimento</label>
            <input
              type="date"
              value={form.maturityDate}
              onChange={(e) => setForm({ ...form, maturityDate: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Emissor</label>
            <input
              type="text"
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
              className="mt-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>
          {errors.general && <p className="text-red-400 text-sm">{errors.general}</p>}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-100 rounded">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}