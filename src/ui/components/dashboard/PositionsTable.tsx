import { Position } from '@/core/domain/position';

type Props = {
  positions: Position[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function PositionsTable({ positions }: Props) {
  if (positions.length === 0) {
    return <p className="text-slate-300">Nenhuma posição encontrada. Faça o upload da planilha primeiro.</p>;
  }

  return (
    <section className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
      <h3 className="text-lg font-semibold text-sky-300 mb-3">Tabela de posições</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead>
            <tr>
              <th className="px-3 py-2">Ticker</th>
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2">Instituição</th>
              <th className="px-3 py-2">Conta</th>
              <th className="px-3 py-2">Quant</th>
              <th className="px-3 py-2">Preço</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">% Carteira</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id} className="border-b border-white/10 hover:bg-slate-900">
                <td className="px-3 py-2">{p.ticker}</td>
                <td className="px-3 py-2">{p.description}</td>
                <td className="px-3 py-2">{p.institution}</td>
                <td className="px-3 py-2">{p.account}</td>
                <td className="px-3 py-2">{p.quantity}</td>
                <td className="px-3 py-2">{formatCurrency(p.price)}</td>
                <td className="px-3 py-2">{formatCurrency(p.grossValue)}</td>
                <td className="px-3 py-2">{(p.grossValue / Math.max(1, positions.reduce((sum, q) => sum + q.grossValue, 0)) * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
