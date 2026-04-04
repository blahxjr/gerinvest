'use client';

import { FormEvent, useState, useRef } from 'react';

type B3UploadResponse = {
  sucesso: boolean;
  carteira?: { id: string; nome: string };
  ativosImportados?: number;
  posicionsImportadas?: number;
  erros?: string[];
  erro?: string;
};

export default function B3UploaderForm() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [result, setResult] = useState<B3UploadResponse | null>(null);
  const [carteiraNome, setCarteiraNome] = useState<string>('Minha Carteira B3');
  const [instituicao, setInstituicao] = useState<string>('B3');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage('❌ Selecione um arquivo CSV');
      setStatus('error');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage('❌ Apenas arquivos .csv são aceitos');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setMessage('📤 Processando arquivo CSV B3...');
    setResult(null);

    try {
      const csvContent = await file.text();

      const response = await fetch('/api/upload-b3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent,
          carteiraNome: carteiraNome || 'Minha Carteira B3',
          instituicao,
        }),
      });

      const data: B3UploadResponse = await response.json();

      if (!response.ok || !data.sucesso) {
        setStatus('error');
        setMessage(`❌ ${data.erro || 'Erro ao processar arquivo'}`);
        setResult(data);
        return;
      }

      setStatus('done');
      setMessage(
        `✅ Importação concluída! 
        • Carteira: ${data.carteira?.nome}
        • Ativos: ${data.ativosImportados || 0}
        • Posições: ${data.posicionsImportadas || 0}`
      );
      setResult(data);

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Erro ao enviar arquivo: ${String(error)}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">📊 Importar do B3</h1>
        <p className="text-slate-400 mb-6">
          Importe sua carteira de investimentos a partir do extrato do site B3 Investidor
        </p>

        {/* Mensagem de status */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg whitespace-pre-wrap ${
              status === 'done'
                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-100'
                : status === 'error'
                ? 'bg-red-500/20 border border-red-500 text-red-100'
                : 'bg-blue-500/20 border border-blue-500 text-blue-100'
            }`}
          >
            {message}
          </div>
        )}

        {/* Erros detalhados */}
        {result?.erros && result.erros.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500">
            <p className="text-yellow-100 font-semibold mb-2">⚠️ Erros durante importação:</p>
            <ul className="text-yellow-100 text-sm space-y-1 list-disc list-inside">
              {result.erros.map((erro, i) => (
                <li key={i}>{erro}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Nome da Carteira
            </label>
            <input
              type="text"
              value={carteiraNome}
              onChange={(e) => setCarteiraNome(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-500"
              placeholder="Ex: Minha Carteira 2024"
              disabled={status === 'uploading'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Instituição
            </label>
            <select
              value={instituicao}
              onChange={(e) => setInstituicao(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white"
              disabled={status === 'uploading'}
            >
              <option value="B3">B3 (Padrão)</option>
              <option value="XP">XP Investimentos</option>
              <option value="Clear">Clear</option>
              <option value="Inter">Banco Inter</option>
              <option value="Rico">Órama/Rico</option>
              <option value="Outra">Outra</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Arquivo CSV <span className="text-red-400">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white file:bg-sky-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded file:cursor-pointer"
              disabled={status === 'uploading'}
            />
            <p className="text-xs text-slate-500 mt-2">📥 Selecione o arquivo CSV exportado da B3</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={status === 'uploading'}
              className="flex-1 px-6 py-3 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'uploading' ? '🔄 Processando...' : '📤 Importar'}
            </button>
          </div>
        </form>

        {/* Info box */}
        <div className="mt-8 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <h3 className="font-semibold text-slate-200 mb-2">📝 Como exportar do B3?</h3>
          <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
            <li>Acesse <a href="https://www.b3.com.br" target="_blank" rel="noopener" className="text-sky-400 hover:underline">b3.com.br</a> - Investidor</li>
            <li>Vá em "Carteiras" ou "Meus Investimentos"</li>
            <li>Procure por "Exportar" ou "Download"</li>
            <li>Selecione o formato "CSV" ou "Planilha"</li>
            <li>Cole o arquivo aqui</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
