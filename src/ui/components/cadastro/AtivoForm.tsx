'use client';

import { useState } from 'react';
import { ClasseAtivo, SubclasseAtivo, CreateAtivoInput } from '@/core/domain/entities';

type AtivoFormProps = {
  onSubmit: (data: CreateAtivoInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

const CLASSE_LABELS: Record<ClasseAtivo, string> = {
  ACAO_BR: 'Ações Brasil',
  ACAO_EUA: 'Ações EUA',
  BDR: 'BDR',
  ETF_BR: 'ETF Brasil',
  ETF_EUA: 'ETF EUA',
  FII: 'Fundo Imobiliário (FII)',
  REIT: 'REIT Internacional',
  FUNDO: 'Fundos Multimercado',
  CRIPTO: 'Criptoativos',
  RENDA_FIXA: 'Renda Fixa',
  POUPANCA: 'Poupança',
  PREVIDENCIA: 'Previdência Privada',
  ALTERNATIVO: 'Investimentos Alternativos',
};

const SUBCLASSE_LABELS: Record<SubclasseAtivo, string> = {
  FII_TIJOLO: 'FII - Tijolo',
  FII_PAPEL: 'FII - Papel',
  FII_FOF: 'FII - FOF',
  FII_DESENVOLVIMENTO: 'FII - Desenvolvimento',
  CRIPTO_BASE: 'Cripto - Base',
  CRIPTO_INFRAESTRUTURA: 'Cripto - Infraestrutura',
  CRIPTO_DEFI: 'Cripto - DeFi',
  CRIPTO_ESPECULATIVO: 'Cripto - Especulativo',
  FUNDO_RENDA_FIXA: 'Fundo - Renda Fixa',
  FUNDO_MULTIMERCADO: 'Fundo - Multimercado',
  FUNDO_ACOES: 'Fundo - Ações',
  FUNDO_CAMBIAL: 'Fundo - Cambial',
  FUNDO_FOF: 'Fundo - FOF',
  RF_POS_FIXADO: 'RF - Pós-Fixado',
  RF_IPCA: 'RF - IPCA+',
  RF_PREFIXADO: 'RF - Prefixado',
  RF_TESOURO: 'RF - Tesouro',
};

const SUBCLASSE_BY_CLASSE: Record<ClasseAtivo, SubclasseAtivo[]> = {
  ACAO_BR: [] as SubclasseAtivo[],
  ACAO_EUA: [] as SubclasseAtivo[],
  BDR: [] as SubclasseAtivo[],
  ETF_BR: [] as SubclasseAtivo[],
  ETF_EUA: [] as SubclasseAtivo[],
  FII: ['FII_TIJOLO', 'FII_PAPEL', 'FII_FOF', 'FII_DESENVOLVIMENTO'] as SubclasseAtivo[],
  REIT: [] as SubclasseAtivo[],
  FUNDO: ['FUNDO_RENDA_FIXA', 'FUNDO_MULTIMERCADO', 'FUNDO_ACOES', 'FUNDO_CAMBIAL', 'FUNDO_FOF'] as SubclasseAtivo[],
  CRIPTO: ['CRIPTO_BASE', 'CRIPTO_INFRAESTRUTURA', 'CRIPTO_DEFI', 'CRIPTO_ESPECULATIVO'] as SubclasseAtivo[],
  RENDA_FIXA: ['RF_POS_FIXADO', 'RF_IPCA', 'RF_PREFIXADO', 'RF_TESOURO'] as SubclasseAtivo[],
  POUPANCA: [] as SubclasseAtivo[],
  PREVIDENCIA: [] as SubclasseAtivo[],
  ALTERNATIVO: [] as SubclasseAtivo[],
};

export default function AtivoForm({ onSubmit, onCancel, isLoading = false }: AtivoFormProps) {
  const [form, setForm] = useState({
    ticker: '',
    nome: '',
    classe: 'ACAO_BR' as ClasseAtivo,
    subclasse: undefined as SubclasseAtivo | undefined,
    setor: '',
    pais: 'Brasil',
    moeda: 'BRL' as any,
    segmento: '',
    indexador: '',
    metadata: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.ticker.trim()) {
      newErrors.ticker = 'Ticker é obrigatório';
    } else if (!/^[A-Z0-9]+$/.test(form.ticker)) {
      newErrors.ticker = 'Ticker deve conter apenas letras maiúsculas e números';
    }

    if (!form.nome.trim()) {
      newErrors.nome = 'Nome do ativo é obrigatório';
    }

    if (['ACAO_BR', 'ACAO_EUA', 'BDR'].includes(form.classe) && !form.setor.trim()) {
      newErrors.setor = 'Setor é obrigatório para esta classe';
    }

    if (['CRIPTO'].includes(form.classe) && !form.indexador.trim()) {
      newErrors.indexador = 'Indexador é obrigatório para criptoativos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      const metadata = form.metadata ? { raw: form.metadata } : undefined;

      await onSubmit({
        ticker: form.ticker.toUpperCase().trim(),
        nome: form.nome.trim(),
        classe: form.classe,
        subclasse: form.subclasse,
        moeda: form.moeda,
        setor: form.setor.trim() || undefined,
        pais: form.pais || 'Brasil',
        segmento: form.segmento || undefined,
        indexador: form.indexador.trim() || undefined,
        metadata,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClasseChange = (novaClasse: ClasseAtivo) => {
    const subclassesDisponiveis = SUBCLASSE_BY_CLASSE[novaClasse];
    const novaSubclasse = subclassesDisponiveis.length > 0 ? subclassesDisponiveis[0] : undefined;
    
    setForm({
      ...form,
      classe: novaClasse,
      subclasse: novaSubclasse,
      setor: '',
      pais: novaClasse.includes('EUA') ? 'USA' : 'Brasil',
      segmento: '',
      indexador: '',
    });
  };

  const subclassesDisponiveis = SUBCLASSE_BY_CLASSE[form.classe] || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-slate-200 mb-1">
            Ticker <span className="text-red-400">*</span>
          </label>
          <input
            id="ticker"
            type="text"
            value={form.ticker}
            onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.ticker ? 'border-red-500' : 'border-slate-600'
            } bg-slate-700 text-white uppercase`}
            placeholder="Ex: PETR4"
            maxLength={10}
            disabled={isLoading || submitting}
          />
          {errors.ticker && <p className="mt-1 text-sm text-red-400">{errors.ticker}</p>}
        </div>

        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-slate-200 mb-1">
            Nome do Ativo <span className="text-red-400">*</span>
          </label>
          <input
            id="nome"
            type="text"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.nome ? 'border-red-500' : 'border-slate-600'
            } bg-slate-700 text-white`}
            placeholder="Ex: Petrobras SA"
            disabled={isLoading || submitting}
          />
          {errors.nome && <p className="mt-1 text-sm text-red-400">{errors.nome}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="classe" className="block text-sm font-medium text-slate-200 mb-1">
            Classe de Ativo <span className="text-red-400">*</span>
          </label>
          <select
            id="classe"
            value={form.classe}
            onChange={(e) => handleClasseChange(e.target.value as ClasseAtivo)}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            disabled={isLoading || submitting}
          >
            {Object.entries(CLASSE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subclasse" className="block text-sm font-medium text-slate-200 mb-1">
            Subclasse
          </label>
          <select
            id="subclasse"
            value={form.subclasse ?? ''}
            onChange={(e) => setForm({ ...form, subclasse: e.target.value ? (e.target.value as SubclasseAtivo) : undefined })}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            disabled={isLoading || submitting}
          >
            <option value="">-- Sem subclasse --</option>
            {subclassesDisponiveis.map((sub) => (
              <option key={sub} value={sub}>
                {SUBCLASSE_LABELS[sub]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pais" className="block text-sm font-medium text-slate-200 mb-1">
            País
          </label>
          <input
            id="pais"
            type="text"
            value={form.pais}
            onChange={(e) => setForm({ ...form, pais: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            placeholder="Ex: Brasil"
            disabled={isLoading || submitting}
          />
        </div>

        <div>
          <label htmlFor="moeda" className="block text-sm font-medium text-slate-200 mb-1">
            Moeda
          </label>
          <select
            id="moeda"
            value={form.moeda}
            onChange={(e) => setForm({ ...form, moeda: e.target.value as any })}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            disabled={isLoading || submitting}
          >
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {['ACAO_BR', 'ACAO_EUA', 'BDR'].includes(form.classe) && (
        <div>
          <label htmlFor="setor" className="block text-sm font-medium text-slate-200 mb-1">
            Setor <span className="text-red-400">*</span>
          </label>
          <input
            id="setor"
            type="text"
            value={form.setor}
            onChange={(e) => setForm({ ...form, setor: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.setor ? 'border-red-500' : 'border-slate-600'
            } bg-slate-700 text-white`}
            placeholder="Ex: Energia"
            disabled={isLoading || submitting}
          />
          {errors.setor && <p className="mt-1 text-sm text-red-400">{errors.setor}</p>}
        </div>
      )}

      {form.classe === 'FII' && (
        <div>
          <label htmlFor="segmento" className="block text-sm font-medium text-slate-200 mb-1">
            Segmento do FII
          </label>
          <select
            id="segmento"
            value={form.segmento}
            onChange={(e) => setForm({ ...form, segmento: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
            disabled={isLoading || submitting}
          >
            <option value="">-- Selecione --</option>
            <option value="TIJOLOS">Tijolos (Imóveis Físicos)</option>
            <option value="PAPEL">Papel (CRIs/CRAs)</option>
            <option value="FOF">FOF (Fundos de Fundos)</option>
            <option value="DESENVOLVIMENTO">Desenvolvimento</option>
            <option value="HIBRIDO">Híbrido</option>
          </select>
        </div>
      )}

      {form.classe === 'CRIPTO' && (
        <div>
          <label htmlFor="indexador" className="block text-sm font-medium text-slate-200 mb-1">
            Indexador <span className="text-red-400">*</span>
          </label>
          <input
            id="indexador"
            type="text"
            value={form.indexador}
            onChange={(e) => setForm({ ...form, indexador: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.indexador ? 'border-red-500' : 'border-slate-600'
            } bg-slate-700 text-white`}
            placeholder="Ex: USD, USDT"
            disabled={isLoading || submitting}
          />
          {errors.indexador && <p className="mt-1 text-sm text-red-400">{errors.indexador}</p>}
        </div>
      )}

      <div>
        <label htmlFor="metadata" className="block text-sm font-medium text-slate-200 mb-1">
          Dados Adicionais (JSON)
        </label>
        <textarea
          id="metadata"
          value={form.metadata}
          onChange={(e) => setForm({ ...form, metadata: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white text-xs font-mono"
          placeholder='{"key": "value"}'
          rows={3}
          disabled={isLoading || submitting}
        />
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
          {submitting ? 'Salvando...' : 'Salvar Ativo'}
        </button>
      </div>
    </form>
  );
}
