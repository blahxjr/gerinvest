import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';

export default async function PosicoesPage() {
  const repo = getPortfolioRepository();
  const positions = await repo.getAllPositions();

  return (
    <div className="main-card">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sky-300">Posições</h1>
        <p className="text-slate-300">Posições da carteira consolidadas por ativo e conta.</p>
      </div>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "12px" }}>Ticker</th>
              <th style={{ padding: "12px" }}>Descrição</th>
              <th style={{ padding: "12px" }}>Classe</th>
              <th style={{ padding: "12px" }}>Instituição</th>
              <th style={{ padding: "12px" }}>Conta</th>
              <th style={{ padding: "12px" }}>Quantidade</th>
              <th style={{ padding: "12px" }}>Preço</th>
              <th style={{ padding: "12px" }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr key={pos.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px" }}>{pos.ticker}</td>
                <td style={{ padding: "12px" }}>{pos.description || '-'}</td>
                <td style={{ padding: "12px" }}>{pos.assetClass || '-'}</td>
                <td style={{ padding: "12px" }}>{pos.institution || '-'}</td>
                <td style={{ padding: "12px" }}>{pos.account || '-'}</td>
                <td style={{ padding: "12px" }}>{pos.quantity || 0}</td>
                <td style={{ padding: "12px" }}>{(pos.price ?? 0).toFixed(2)}</td>
                <td style={{ padding: "12px" }}>{(pos.grossValue ?? 0).toFixed(2)}</td>
              </tr>
            ))}
            {positions.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "16px", textAlign: "center" }}>
                  Nenhuma posição cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}