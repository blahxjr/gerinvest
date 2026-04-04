"use client";

import { useState } from "react";

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage("");

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data: unknown = await res.json();
      const msg = (data && typeof data === 'object' && 'message' in data)
        ? String((data as Record<string, unknown>).message)
        : 'Se este e-mail estiver cadastrado, você receberá um link em breve.';

      setStatus('success');
      setMessage(msg);
    } catch {
      setStatus('error');
      setMessage('Erro ao processar solicitação. Tente novamente.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900/80 p-8 shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-2">Recuperar senha</h1>
        <p className="text-sm text-slate-400 mb-6">
          Informe seu e-mail cadastrado. Você receberá um link para redefinir sua senha.
        </p>

        <label className="block mb-4">
          <span className="text-sm text-slate-300">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading' || status === 'success'}
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-white disabled:opacity-50"
            aria-label="Endereço de e-mail"
          />
        </label>

        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="w-full rounded-md bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-busy={status === 'loading'}
        >
          {status === 'loading' ? 'Enviando…' : 'Enviar link de recuperação'}
        </button>

        {status === 'success' && (
          <p role="status" className="mt-4 text-sm text-emerald-300">{message}</p>
        )}
        {status === 'error' && (
          <p role="alert" className="mt-4 text-sm text-red-400">{message}</p>
        )}

        <p className="mt-4 text-xs text-slate-400">
          Lembrou a senha?{' '}
          <a href="/login" className="text-sky-300 hover:text-sky-200">
            Voltar ao login
          </a>
        </p>
      </form>
    </main>
  );
}
