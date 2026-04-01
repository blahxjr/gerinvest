"use client";

import { useState } from "react";

type UploadResposta = {
  ok: boolean;
  arquivo?: string;
  totalLinhas?: number;
  inseridos?: number;
  ignorados?: number;
  ativosCriados?: number;
  erros?: string[];
  error?: string;
};

export default function ImportacaoPage() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<UploadResposta | null>(null);

  async function enviarArquivo(e: React.FormEvent) {
    e.preventDefault();

    if (!arquivo) {
      setResultado({
        ok: false,
        error: "Selecione um arquivo antes de importar.",
      });
      return;
    }

    try {
      setCarregando(true);
      setResultado(null);

      const formData = new FormData();
      formData.append("file", arquivo);

      const response = await fetch("/api/upload-b3", {
        method: "POST",
        body: formData,
      });

      const data: UploadResposta = await response.json();
      setResultado(data);
    } catch {
      setResultado({
        ok: false,
        error: "Erro inesperado ao enviar o arquivo.",
      });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="panel">
        <h1 className="text-2xl font-bold text-sky-300">Importação B3</h1>
        <p className="text-sm text-slate-300">
          Envie o arquivo da B3 para carregar posições da carteira.
        </p>

        <form onSubmit={enviarArquivo} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="arquivo-b3" className="block text-sm font-semibold text-slate-100">
              Arquivo da B3
            </label>
            <input
              id="arquivo-b3"
              name="arquivo-b3"
              type="file"
              accept=".csv,.txt"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
              className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {carregando ? "Importando..." : "Importar arquivo"}
          </button>
        </form>

        <div className="mt-5 rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
          {!resultado && <p>Nenhum arquivo processado ainda.</p>}

          {resultado && resultado.ok && (
            <div className="space-y-1">
              <p className="font-semibold text-sky-300">Importação concluída com sucesso.</p>
              <p>Arquivo: {resultado.arquivo}</p>
              <p>Total de linhas: {resultado.totalLinhas}</p>
              <p>Inseridos: {resultado.inseridos}</p>
              <p>Ignorados: {resultado.ignorados}</p>
              <p>Ativos criados: {resultado.ativosCriados}</p>

              {resultado.erros && resultado.erros.length > 0 && (
                <div className="mt-3 rounded-lg bg-slate-800 p-3 text-slate-100">
                  <p className="font-semibold">Observações:</p>
                  <ul className="list-disc pl-5">
                    {resultado.erros.map((erro, index) => (
                      <li key={index}>{erro}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {resultado && !resultado.ok && (
            <div className="rounded-lg bg-red-950 p-3 text-red-300">
              <p className="font-semibold">Falha na importação.</p>
              <p>{resultado.error || "Erro desconhecido."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}