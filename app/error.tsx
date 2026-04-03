'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-red-400">Erro ao carregar dashboard</h2>
        <p className="text-slate-400">{error.message}</p>
        <button onClick={reset} className="bg-sky-600 text-white px-4 py-2 rounded-lg">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}