'use client';

import { useState } from 'react';
import { Carteira, CreateCarteiraInput } from '@/core/domain/entities';

type CarteiraFormProps = {
  onSubmit: (data: CreateCarteiraInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Carteira;
  isLoading?: boolean;
};

export default function CarteiraForm({ onSubmit, onCancel, initialData, isLoading = false }: CarteiraFormProps) {
  const [form, setForm] = useState({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    perfil: initialData?.perfil || 'moderado',
    moedaBase: initialData?.moedaBase || 'BRL',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.nome.trim()) {
      newErrors.nome = 'Nome da carteira é obrigatório';
    }
    
    if (form.nome.length > 100) {
      newErrors.nome = 'Nome não pode ter mais de 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        perfil: form.perfil,
        moedaBase: form.moedaBase as any,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-slate-200 mb-1">
          Nome da Carteira <span className="text-red-400">*</span>
        </label>
        <input
          id="nome"
          type="text"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className={`w-full px-3 py-2 rounded-lg border ${
            errors.nome ? 'border-red-500' : 'border-slate-600'
          } bg-slate-700 text-white`}
          placeholder="Ex: Carteira Principal"
          maxLength={100}
          disabled={isLoading || submitting}
        />
        {errors.nome && <p className="mt-1 text-sm text-red-400">{errors.nome}</p>}
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-slate-200 mb-1">
          Descrição
        </label>
        <textarea
          id="descricao"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
          placeholder="Descrição opcional da carteira"
          rows={3}
          disabled={isLoading || submitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="perfil" className="block text-sm font-medium text-slate-200 mb-1">
            Perfil de Risco
          </label>
          <select
            id="perfil"
            value={form.perfil}
            onChange={(e) => setForm({ ...form, perfil: e.target.value as 'conservador' | 'moderado' | 'arrojado' })}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            disabled={isLoading || submitting}
          >
            <option value="conservador">Conservador</option>
            <option value="moderado">Moderado</option>
            <option value="arrojado">Arrojado</option>
          </select>
        </div>

        <div>
          <label htmlFor="moedaBase" className="block text-sm font-medium text-slate-200 mb-1">
            Moeda Base
          </label>
          <select
            id="moedaBase"
            value={form.moedaBase}
            onChange={(e) => setForm({ ...form, moedaBase: e.target.value as any })}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            disabled={isLoading || submitting}
          >
            <option value="BRL">BRL (Real)</option>
            <option value="USD">USD (Dólar)</option>
            <option value="EUR">EUR (Euro)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 transition"
          disabled={isLoading || submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-50"
          disabled={isLoading || submitting}
        >
          {submitting ? 'Salvando...' : 'Salvar Carteira'}
        </button>
      </div>
    </form>
  );
}
