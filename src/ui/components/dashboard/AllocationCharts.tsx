import { AllocationEntry } from '@/core/domain/portfolio';

type Props = {
  assetClass: AllocationEntry[];
  institution: AllocationEntry[];
};

export default function AllocationCharts({ assetClass, institution }: Props) {
  const maxAsset = Math.max(...assetClass.map((item) => item.value), 1);
  const maxInstitution = Math.max(...institution.map((item) => item.value), 1);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-3">Alocação por classe de ativo</h3>
        <ul className="space-y-2">
          {assetClass.map((item) => (
            <li key={item.assetClass}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="font-medium text-slate-100">{item.assetClass}</span>
                <span className="text-slate-300">{item.percentage.toFixed(2)}%</span>
              </div>
              <div className="h-2 rounded bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-sky-500"
                  style={{ width: `${Math.min(100, (item.value / maxAsset) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-sky-300 mb-3">Alocação por instituição</h3>
        <ul className="space-y-2">
          {institution.map((item) => (
            <li key={item.institution ?? item.value.toString()}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="font-medium text-slate-100">{item.institution}</span>
                <span className="text-slate-300">{item.percentage.toFixed(2)}%</span>
              </div>
              <div className="h-2 rounded bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.min(100, (item.value / maxInstitution) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
