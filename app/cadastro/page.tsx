'use client';

import { useEffect, useState } from 'react';
import CarteiraForm from '@/ui/components/cadastro/CarteiraForm';
import AtivoForm from '@/ui/components/cadastro/AtivoForm';
import PosicaoForm from '@/ui/components/cadastro/PosicaoForm';
import { CreateCarteiraInput, CreateAtivoInput, CreatePosicaoInput, Ativo } from '@/core/domain/entities';

type Tab = 'carteira' | 'ativo' | 'posicao';

type ContentState = {
  carteiras: Array<{ id: string; nome: string }>;
  ativos: Ativo[];
};

export default function CadastroPage() {
  const [tab, setTab] = useState<Tab>('carteira');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [content, setContent] = useState<ContentState>({ carteiras: [], ativos: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Carrega carteiras e ativos ao abrir a página
  const loadData = async () => {
    try {
      const [carteirasResponse, ativosResponse] = await Promise.all([
        fetch('/api/carteiras'),
        fetch('/api/ativos'),
      ]);

      const carteirasData = carteirasResponse.ok ? await carteirasResponse.json() : [];
      const ativosData = ativosResponse.ok ? await ativosResponse.json() : [];

      setContent({
        carteiras: Array.isArray(carteirasData) ? carteirasData : [],
        ativos: Array.isArray(ativosData) ? ativosData : [],
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados iniciais' });
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega dados na primeira renderização
  useEffect(() => {
    loadData();
  }, []);

  const handleCarteiraSubmit = async (data: CreateCarteiraInput) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/carteiras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Carteira criada com sucesso!' });
        await loadData();
        // Mover para próximo passo automáticamente
        setTimeout(() => setTab('ativo'), 1500);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: `❌ Erro: ${error.message || 'Falha ao criar carteira'}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Erro: ${String(error)}` });
    } finally {
      setLoading(false);
    }
  };

  const handleAtivoSubmit = async (data: CreateAtivoInput) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/ativos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Ativo criado com sucesso!' });
        await loadData();
        // Mover para próximo passo automáticamente
        setTimeout(() => setTab('posicao'), 1500);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: `Erro: ${error.message || 'Falha ao criar ativo'}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Erro: ${String(error)}` });
    } finally {
      setLoading(false);
    }
  };

  const handlePosicaoSubmit = async (data: CreatePosicaoInput) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/posicoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Posição criada com sucesso!' });
        await loadData();
        // Limpar form após sucesso
        setTimeout(() => setMessage(null), 2000);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: `Erro: ${error.message || 'Falha ao criar posição'}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Erro: ${String(error)}` });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Cadastro de Investimentos</h1>

        {/* Mensagens de sucesso/erro */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-100'
                : 'bg-red-500/20 border border-red-500 text-red-100'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => setTab('carteira')}
            className={`px-6 py-3 font-medium transition-colors ${
              tab === 'carteira'
                ? 'border-b-2 border-sky-600 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Nova Carteira
          </button>
          <button
            onClick={() => setTab('ativo')}
            className={`px-6 py-3 font-medium transition-colors ${
              tab === 'ativo'
                ? 'border-b-2 border-sky-600 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Novo Ativo
          </button>
          <button
            onClick={() => setTab('posicao')}
            className={`px-6 py-3 font-medium transition-colors ${
              tab === 'posicao'
                ? 'border-b-2 border-sky-600 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Nova Posição
          </button>
        </div>

        {/* Form Content */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8">
          {tab === 'carteira' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Criar Nova Carteira</h2>
              <CarteiraForm
                onSubmit={handleCarteiraSubmit}
                onCancel={() => setTab('ativo')}
                isLoading={loading}
              />
            </div>
          )}

          {tab === 'ativo' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Cadastrar Novo Ativo</h2>
              <AtivoForm
                onSubmit={handleAtivoSubmit}
                onCancel={() => setTab('carteira')}
                isLoading={loading}
              />
            </div>
          )}

          {tab === 'posicao' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Criar Nova Posição</h2>
              {content.carteiras.length === 0 ? (
                <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-100">
                  <p>Você precisa criar uma carteira antes de adicionar posições.</p>
                </div>
              ) : content.ativos.length === 0 ? (
                <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500 text-amber-100">
                  <p>Você precisa criar um ativo antes de adicionar posições.</p>
                </div>
              ) : (
                <PosicaoForm
                  onSubmit={handlePosicaoSubmit}
                  onCancel={() => setTab('ativo')}
                  carteiras={content.carteiras}
                  ativos={content.ativos}
                  isLoading={loading}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
