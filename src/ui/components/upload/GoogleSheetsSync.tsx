'use client';

import { FormEvent, useState } from 'react';

type SyncResponse = {
  sucesso: boolean;
  carteira?: { id: string; nome: string };
  ativosImportados?: number;
  positionsImportadas?: number;
  erros?: string[];
  resumo?: {
    totalPositoes: number;
    processadas: number;
    errosDetectados: number;
  };
  erro?: string;
  detalhes?: string;
};

export default function GoogleSheetsSync() {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('');
  const [carteiraNome, setCarteiraNome] = useState<string>('Minha Carteira B3');
  const [instituicao, setInstituicao] = useState<string>('B3');
  const [status, setStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [result, setResult] = useState<SyncResponse | null>(null);

  async function handleSync(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!spreadsheetUrl.trim()) {
      setMessage('❌ Cole o link da planilha do Google Sheets.');
      setStatus('error');
      return;
    }

    if (!carteiraNome.trim()) {
      setMessage('❌ Informe o nome da carteira.');
      setStatus('error');
      return;
    }

    setStatus('syncing');
    setMessage('⏳ Sincronizando com Google Sheets...');

    try {
      const response = await fetch('/api/google-sheet-to-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetUrl: spreadsheetUrl.trim(),
          carteiraNome: carteiraNome.trim(),
          instituicao,
        }),
      });

      const data: SyncResponse = await response.json();

      if (!response.ok || !data.sucesso) {
        setStatus('error');
        setMessage(`❌ Erro: ${data.erro || 'Falha ao sincronizar'}`);
        if (data.detalhes) {
          setMessage((prev) => `${prev}\n${data.detalhes}`);
        }
        setResult(data);
        return;
      }

      setResult(data);
      setStatus('done');
      setMessage(
        `✅ Sincronização concluída!\n` +
        `📊 Carteira: ${data.carteira?.nome}\n` +
        `📈 ${data.positionsImportadas} posições importadas\n` +
        `💾 ${data.ativosImportados} ativos criados`
      );

      // Limpar formulário após sucesso
      setSpreadsheetUrl('');
      setCarteiraNome('Minha Carteira B3');
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Erro ao processar: ${String(error)}`);
    }
  }

  return (
    <section className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
        <h2 className="text-xl font-semibold text-emerald-400 mb-2">📱 Sincronizar com Google Sheets</h2>
        <p className="text-sm text-slate-300 mb-4">
          Importe diretamente suas posições do Google Sheets para o banco de dados.
          Os ativos serão criados automaticamente caso não existam.
        </p>

        <form onSubmit={handleSync} className="space-y-4">
          {/* URL da Planilha */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Link da Planilha do Google Sheets *
            </label>
            <input
              type="url"
              value={spreadsheetUrl}
              onChange={(e) => setSpreadsheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full rounded border border-slate-600 bg-slate-800 text-slate-100 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              A planilha deve estar compartilhada com permissão de leitura
            </p>
          </div>

          {/* Nome da Carteira */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Nome da Carteira *
            </label>
            <input
              type="text"
              value={carteiraNome}
              onChange={(e) => setCarteiraNome(e.target.value)}
              placeholder="Ex: Minha Carteira B3"
              className="w-full rounded border border-slate-600 bg-slate-800 text-slate-100 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Instituição */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Instituição
            </label>
            <select
              value={instituicao}
              onChange={(e) => setInstituicao(e.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-800 text-slate-100 p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="B3">B3</option>
              <option value="XP">XP Investimentos</option>
              <option value="Clear">Clear</option>
              <option value="Inter">Inter</option>
              <option value="Rico">Banco Rico</option>
              <option value="NuInvest">NuInvest</option>
              <option value="Outro">Outra</option>
            </select>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={!spreadsheetUrl.trim() || !carteiraNome.trim() || status === 'syncing'}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'syncing' ? '⏳ Sincronizando...' : '🔄 Sincronizar'}
          </button>
        </form>
      </div>

      {/* Status */}
      {message && (
        <div
          className={`rounded-lg p-4 whitespace-pre-wrap text-sm ${
            status === 'done'
              ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-200'
              : status === 'error'
              ? 'bg-red-950/30 border border-red-500/30 text-red-200'
              : 'bg-slate-800 border border-slate-600 text-slate-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Detalhes de Sucesso */}
      {status === 'done' && result && (
        <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-300">Carteira:</span>
            <span className="font-medium text-emerald-300">{result.carteira?.nome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Posições Importadas:</span>
            <span className="font-medium text-emerald-300">
              {result.positionsImportadas}/{result.resumo?.totalPositoes}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Ativos Criados:</span>
            <span className="font-medium text-emerald-300">{result.ativosImportados}</span>
          </div>
          {result.erros && result.erros.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-600">
              <p className="text-yellow-300 font-medium mb-2">⚠️ Erros encontrados:</p>
              <ul className="space-y-1 text-slate-300">
                {result.erros.map((erro, idx) => (
                  <li key={idx} className="text-xs">
                    • {erro}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
