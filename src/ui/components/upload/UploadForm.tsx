'use client';

import { FormEvent, useState } from 'react';

type UploadResponse = {
  success: boolean;
  preview?: boolean;
  totalCount?: number;
  totalValue?: number;
  perAssetClass?: Array<{ classe: string; importedCount: number; importedValue: number; errors: { row: number; message: string; }[]}>;
  previewRows?: Array<{
    id: string;
    ticker: string;
    nome: string;
    classe: string;
    instituicao: string;
    conta: string;
    quantidade: number;
    preco: number;
    valor: number;
  }>;
  persisted?: {
    inserted: number;
    updated: number;
    skipped: number;
  };
  error?: string;
};

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [editableJson, setEditableJson] = useState<string>('');
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [excelPreviewReady, setExcelPreviewReady] = useState(false);

  async function callUploadApi(endpoint: string, body: FormData | { spreadsheetUrl: string }) {
    let response;

    if (body instanceof FormData) {
      response = await fetch(endpoint, {
        method: 'POST',
        body,
      });
    } else {
      response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return response.json() as Promise<UploadResponse>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setMessage('Selecione um arquivo .xlsx antes de enviar.');
      return;
    }

    setStatus('uploading');
    setMessage('Enviando para o PostgreSQL...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('previewOnly', 'false');

    try {
      const response = await fetch('/api/upload-positions', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!response.ok || !data.success) {
        setStatus('error');
        setMessage(data.error || 'Erro ao enviar arquivo');
        setResult(data);
        return;
      }

      setResult(data);
      setEditableJson(JSON.stringify(data, null, 2));
      setStatus('done');
      setMessage(
        `Importação concluída: ${data.totalCount} posições processadas. Inseridas: ${data.persisted?.inserted ?? 0}, atualizadas: ${data.persisted?.updated ?? 0}, ignoradas: ${data.persisted?.skipped ?? 0}.`
      );
      setExcelPreviewReady(false);
    } catch (error) {
      setStatus('error');
      setMessage('Falha ao enviar o arquivo.');
    }
  }

  async function handleExcelPreview() {
    if (!file) {
      setMessage('Selecione um arquivo .xlsx antes de validar.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setMessage('Validando e montando prévia da planilha...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('previewOnly', 'true');

    try {
      const response = await fetch('/api/upload-positions', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!response.ok || !data.success) {
        setStatus('error');
        setMessage(data.error || 'Erro ao validar arquivo');
        setResult(data);
        setExcelPreviewReady(false);
        return;
      }

      setResult(data);
      setStatus('done');
      setExcelPreviewReady(true);
      setMessage('Prévia gerada. Confira a tabela e clique em "Confirmar envio ao PostgreSQL".');
    } catch {
      setStatus('error');
      setExcelPreviewReady(false);
      setMessage('Falha ao validar a planilha.');
    }
  }

  async function handleSheetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sheetUrl.trim()) {
      setMessage('Cole o link da planilha do Google Sheets.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setMessage('Importando do Google Sheets...');

    try {
      const data = await callUploadApi('/api/upload-positions/google-sheet', { spreadsheetUrl: sheetUrl.trim() });

      if (!data.success) {
        setStatus('error');
        setMessage(data.error || 'Erro ao importar do Google Sheets');
        setResult(data);
        return;
      }

      setResult(data);
      setEditableJson(JSON.stringify(data, null, 2));
      setStatus('done');
      setMessage(`Importação do Google Sheets concluída: ${data.totalCount} posições carregadas.`);
    } catch (error) {
      setStatus('error');
      setMessage('Falha ao importar do Google Sheets.');
    }
  }

  return (
    <section className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-sky-400 mb-4">Importar posição de investimentos</h1>
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold text-sky-300">Upload de arquivo Excel</h2>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded border border-white/10 bg-slate-800 text-slate-100 p-2"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExcelPreview}
              disabled={!file || status === 'uploading'}
              className="rounded bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              {status === 'uploading' ? 'Processando...' : 'Validar planilha'}
            </button>
            <button
              type="submit"
              disabled={!file || status === 'uploading' || !excelPreviewReady}
              className="rounded bg-sky-500 px-4 py-2 font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
            >
              {status === 'uploading' ? 'Processando...' : 'Confirmar envio ao PostgreSQL'}
            </button>
          </div>
        </form>

        <form onSubmit={handleSheetSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold text-sky-300">Importar do Google Sheets</h2>
          <input
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="Cole o link da planilha do Google Sheets aqui"
            className="w-full rounded border border-white/10 bg-slate-800 text-slate-100 p-2"
          />
          <button
            type="submit"
            disabled={!sheetUrl.trim() || status === 'uploading'}
            className="rounded bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
          >
            {status === 'uploading' ? 'Processando...' : 'Importar do Google Sheets'}
          </button>
        </form>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-slate-800 p-4">
        <p className="text-sm text-slate-200">Status: {status}</p>
        <p className="text-sm text-slate-200">{message}</p>

        {status === 'done' && result && (
          <div className="mt-3 text-sm text-slate-100">
            <p>Linhas importadas: {result.totalCount}</p>
            <p>Valor total: R$ {result.totalValue?.toFixed(2)}</p>
            <p>Detalhamento por classe:</p>
            <ul className="list-disc ml-5">
              {result.perAssetClass?.map((item) => (
                <li key={item.classe}>
                  {item.classe}: {item.importedCount} itens ({item.importedValue.toFixed(2)}). Erros: {item.errors.length}
                </li>
              ))}
            </ul>

            {result.previewRows && result.previewRows.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-slate-200">Prévia para conferência (até 20 linhas):</p>
                <div className="overflow-x-auto rounded border border-white/10">
                  <table className="min-w-full text-left text-xs text-slate-200">
                    <thead className="bg-slate-700/70 text-slate-100">
                      <tr>
                        <th className="px-2 py-2">Ticker</th>
                        <th className="px-2 py-2">Nome</th>
                        <th className="px-2 py-2">Classe</th>
                        <th className="px-2 py-2">Instituição</th>
                        <th className="px-2 py-2">Conta</th>
                        <th className="px-2 py-2 text-right">Qtd</th>
                        <th className="px-2 py-2 text-right">Preço</th>
                        <th className="px-2 py-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.previewRows.map((row) => (
                        <tr key={row.id} className="border-t border-white/10">
                          <td className="px-2 py-2">{row.ticker}</td>
                          <td className="px-2 py-2">{row.nome}</td>
                          <td className="px-2 py-2">{row.classe}</td>
                          <td className="px-2 py-2">{row.instituicao}</td>
                          <td className="px-2 py-2">{row.conta}</td>
                          <td className="px-2 py-2 text-right">{row.quantidade}</td>
                          <td className="px-2 py-2 text-right">R$ {row.preco.toFixed(2)}</td>
                          <td className="px-2 py-2 text-right">R$ {row.valor.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm text-slate-200 mb-2">Editar posições manualmente (JSON):</label>
              <textarea
                rows={10}
                value={editableJson || JSON.stringify(result, null, 2)}
                onChange={(e) => setEditableJson(e.target.value)}
                className="w-full rounded border border-white/10 bg-slate-900 p-2 text-xs text-slate-100 font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  try {
                    const updated = JSON.parse(editableJson || JSON.stringify(result));
                    setResult((prev) => (prev ? { ...prev, ...updated } : prev));
                    setMessage('Dados atualizados manualmente (temporariamente).');
                    setStatus('done');
                  } catch {
                    setMessage('Formato JSON inválido.');
                  }
                }}
                className="mt-2 rounded bg-yellow-500 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
              >
                Salvar alterações manuais
              </button>
            </div>
          </div>
        )}

        {status === 'error' && result?.error && (
          <p className="mt-3 text-red-400">Erro: {result.error}</p>
        )}
      </div>
    </section>
  );
}
