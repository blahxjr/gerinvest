'use client';

import { useState, useEffect } from 'react';
import { Ativo, CreatePosicaoInput, Currency } from '@/core/domain/entities';

type PosicaoFormProps = {
  onSubmit: (data: CreatePosicaoInput) => Promise<void>;
  onCancel: () => void;
  carteiras: Array<{ id: string; nome: string }>;
  ativos: Ativo[];
  isLoading?: boolean;
};

export default function PosicaoForm({
  onSubmit,
  onCancel,
  carteiras,
  ativos,
  isLoading = false,
}: PosicaoFormProps) {
  const [form, setForm] = useState({
    carteiraId: '',
    ativoId: '',
    quantidade: 0,
    precoMedio: 0,
    valorAtualBrl: 0,
    moedaOriginal: 'BRL',
    instituicao: '',
    conta: '',
    custodia: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    dataVencimento: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Filtra ativos baseado na carteira selecionada (futura integração com classe)
  const ativosDisponiveis = ativos;

  const ativoSelecionado = ativos.find((a) => a.id === form.ativoId);

  // Auto-calcula valorAtualBrl quando quantidade ou precoMedio mudam
  useEffect(() => {
    if (form.quantidade && form.precoMedio) {
      const calculado = form.quantidade * form.precoMedio;
      setForm((prev) => ({ ...prev, valorAtualBrl: calculado }));
    }
  }, [form.quantidade, form.precoMedio]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.carteiraId) {
      newErrors.carteiraId = 'Carteira é obrigatória';
    }

    if (!form.ativoId) {
      newErrors.ativoId = 'Ativo é obrigatório';
    }

    if (form.quantidade <= 0) {
      newErrors.quantidade = 'Quantidade deve ser maior que 0';
    }

    if (form.precoMedio <= 0) {
      newErrors.precoMedio = 'Preço médio deve ser maior que 0';
    }

    if (form.valorAtualBrl <= 0) {
      newErrors.valorAtualBrl = 'Valor atual deve ser maior que 0';
    }

    if (!form.dataEntrada) {
      newErrors.dataEntrada = 'Data de entrada é obrigatória';
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
        carteiraId: form.carteiraId,
        ativoId: form.ativoId,
        quantidade: form.quantidade,
        precoMedio: form.precoMedio,
        valorAtualBrl: form.valorAtualBrl,
        moedaOriginal: form.moedaOriginal as Currency,
        instituicao: form.instituicao.trim() || undefined,
        conta: form.conta.trim() || undefined,
        custodia: form.custodia.trim() || undefined,
        dataEntrada: new Date(form.dataEntrada),
        dataVencimento: form.dataVencimento ? new Date(form.dataVencimento) : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cascading Dropdowns: Carteira → Ativo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="carteiraId" className="block text-sm font-medium text-slate-200 mb-1">
            Carteira <span className="text-red-400">*</span>
          </label>
          <select
            id="carteiraId"
            value={form.carteiraId}
            onChange={(e) => setForm({ ...form, carteiraId: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.carteiraId ? 'border-red-500' : 'border-slate-600'
            } bg-slate-700 text-white`}
            disabled={isLoading || submitting}
          >
            <option value="">-- Selecione uma carteira --</option>
            {carteiras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {errors.carteiraId && <p className="mt-1 text-sm text-red-400">{errors.carteiraId}</p>}
        </div>

        <div>
          <label htmlFor="ativoId" className="block text-sm font-medium text-slate-200 mb-1">
            Ativo <span className="text-red-400">*</span>
          </label>
          <select
            id="ativoId"
            value={form.ativoId}
            onChange={(e) => setForm({ ...form, ativoId: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.ativoId ? 'border-red-500' : 'border-slate-600'
            } bg-slate-700 text-white`}
            disabled={isLoading || submitting || !form.carteiraId}
          >
            <option value="">-- Selecione um ativo --</option>
            {ativosDisponiveis.map((a) => (
              <option key={a.id} value={a.id}>
                {a.ticker} - {a.nome}
              </option>
            ))}
          </select>
          {errors.ativoId && <p className="mt-1 text-sm text-red-400">{errors.ativoId}</p>}
        </div>
      </div>

      {/* Informação do ativo selecionado */}
      {ativoSelecionado && (
        <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-xs text-slate-400">Classe/Subclasse</p>
              <p className="text-sm text-white">
                {ativoSelecionado.classe} / {ativoSelecionado.subclasse}
              </p>
            </div>
            {ativoSelecionado.setor && (
              <div>
                <p className="text-xs text-slate-400">Setor</p>
                <p className="text-sm text-white">{ativoSelecionado.setor}</p>
              </div>
            )}
            {ativoSelecionado.pais && (
              <div>
                <p className="text-xs text-slate-400">País</p>
                <p className="text-sm text-white">{ativoSelecionado.pais}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quantidade e Preço */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantidade" className="block text-sm font-medium text-slate-200 mb-1">
            Quantidade <span className="text-red-400">*</span>
          </label>
          <input
            id="quantidade"
            type="number"
            step="0.01"
            value={form.quantidade}
            onChange={(e) => setForm({ ...form, quantidade: parseFloat(e.target.value) || 0 })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.quantidade ? 'border-red-500' : 'border-slate-600'
            } bg-slate-700 text-white`}
            placeholder="0.00"
            disabled={isLoading || submitting}
          />
          {errors.quantidade && <p className="mt-1 text-sm text-red-400">{errors.quantidade}</p>}
        </div>

        <div>
          <label htmlFor="precoMedio" className="block text-sm font-medium text-slate-200 mb-1">
            Preço Médio <span className="text-red-400">*</span>
          </label>
          <input
            id="precoMedio"
            type="number"
            step="0.01"
            value={form.precoMedio}
            onChange={(e) => setForm({ ...form, precoMedio: parseFloat(e.target.value) || 0 })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.precoMedio ? 'border-red-500' : 'border-slate-600'
            } bg-slate-700 text-white`}
            placeholder="0.00"
            disabled={isLoading || submitting}
          />
          {errors.precoMedio && <p className="mt-1 text-sm text-red-400">{errors.precoMedio}</p>}
        </div>
      </div>

      {/* Valor Atual - Auto-calculado mas editável */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="valorAtualBrl" className="block text-sm font-medium text-slate-200 mb-1">
            Valor Atual (BRL) <span className="text-red-400">*</span>
          </label>
          <input
            id="valorAtualBrl"
            type="number"
            step="0.01"
            value={form.valorAtualBrl}
            onChange={(e) => setForm({ ...form, valorAtualBrl: parseFloat(e.target.value) || 0 })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.valorAtualBrl ? 'border-red-500' : 'border-slate-600'
            } bg-slate-700 text-white`}
            placeholder="0.00"
            disabled={isLoading || submitting}
          />
          {errors.valorAtualBrl && (
            <p className="mt-1 text-sm text-red-400">{errors.valorAtualBrl}</p>
          )}
          <p className="mt-1 text-xs text-slate-400">Auto-calculado: Qtd × Preço</p>
        </div>

        <div>
          <label htmlFor="moedaOriginal" className="block text-sm font-medium text-slate-200 mb-1">
            Moeda Original
          </label>
          <select
            id="moedaOriginal"
            value={form.moedaOriginal}
            onChange={(e) => setForm({ ...form, moedaOriginal: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            disabled={isLoading || submitting}
          >
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
      </div>

      {/* Instituição e Conta */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="instituicao" className="block text-sm font-medium text-slate-200 mb-1">
            Instituição
          </label>
          <input
            id="instituicao"
            type="text"
            value={form.instituicao}
            onChange={(e) => setForm({ ...form, instituicao: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            placeholder="Ex: XP Investimentos"
            disabled={isLoading || submitting}
          />
        </div>

        <div>
          <label htmlFor="conta" className="block text-sm font-medium text-slate-200 mb-1">
            Conta/Operação
          </label>
          <input
            id="conta"
            type="text"
            value={form.conta}
            onChange={(e) => setForm({ ...form, conta: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            placeholder="Ex: Conta Corrente"
            disabled={isLoading || submitting}
          />
        </div>
      </div>

      {/* Custódia */}
      <div>
        <label htmlFor="custodia" className="block text-sm font-medium text-slate-200 mb-1">
          Custódia
        </label>
        <input
          id="custodia"
          type="text"
          value={form.custodia}
          onChange={(e) => setForm({ ...form, custodia: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
          placeholder="Ex: Banco X"
          disabled={isLoading || submitting}
        />
      </div>

      {/* Datas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dataEntrada" className="block text-sm font-medium text-slate-200 mb-1">
            Data de Entrada <span className="text-red-400">*</span>
          </label>
          <input
            id="dataEntrada"
            type="date"
            value={form.dataEntrada}
            onChange={(e) => setForm({ ...form, dataEntrada: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.dataEntrada ? 'border-red-500' : 'border-slate-600'
            } bg-slate-700 text-white`}
            disabled={isLoading || submitting}
          />
          {errors.dataEntrada && (
            <p className="mt-1 text-sm text-red-400">{errors.dataEntrada}</p>
          )}
        </div>

        <div>
          <label htmlFor="dataVencimento" className="block text-sm font-medium text-slate-200 mb-1">
            Data de Vencimento
          </label>
          <input
            id="dataVencimento"
            type="date"
            value={form.dataVencimento}
            onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            disabled={isLoading || submitting}
          />
          <p className="mt-1 text-xs text-slate-400">Para renda fixa e derivativos</p>
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
          {submitting ? 'Salvando...' : 'Salvar Posição'}
        </button>
      </div>
    </form>
  );
}
