import { getPortfolioRepository } from "@/infra/repositories/postgresPortfolioRepository";
import { ASSET_CLASS_LABELS } from "@/core/domain/types";

export default async function PosicoesPage() {
  let positions: any[] = [];
  try {
    const repo = getPortfolioRepository();
    positions = await repo.getAllPositionsEnriched();
  } catch {
    // banco indisponível — exibe tabela vazia com mensagem
  }

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
              <th style={{ padding: "12px" }}>Preço Médio</th>
              <th style={{ padding: "12px" }}>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr key={pos.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px" }}>{pos.ticker || "-"}</td>
                <td style={{ padding: "12px" }}>{pos.description || pos.nome || "-"}</td>
                <td style={{ padding: "12px" }}>
                  {ASSET_CLASS_LABELS[pos.classe as keyof typeof ASSET_CLASS_LABELS] || pos.classe || "-"}
                </td>
                <td style={{ padding: "12px" }}>{pos.institution || "-"}</td>
                <td style={{ padding: "12px" }}>{pos.account || "-"}</td>
                <td style={{ padding: "12px" }}>{pos.quantity ?? 0}</td>
                <td style={{ padding: "12px" }}>
                  {pos.price != null
                    ? Number(pos.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "-"}
                </td>
                <td style={{ padding: "12px" }}>
                  {Number(pos.valorAtualBrl ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
            ))}
            {positions.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "16px", textAlign: "center", color: "#94a3b8" }}>
                  Nenhuma posição cadastrada. Importe uma planilha para começar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}