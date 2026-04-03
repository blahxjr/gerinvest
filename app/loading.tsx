export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Skeleton para KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
        {/* Skeleton para gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 rounded-xl bg-slate-800 animate-pulse" />
          <div className="h-64 rounded-xl bg-slate-800 animate-pulse" />
        </div>
      </div>
    </main>
  );
}