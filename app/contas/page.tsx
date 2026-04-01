import Link from "next/link";
import { pool } from "../../lib/db";

export default async function ContasPage() {
  const result = await pool.query(`
    SELECT
      cc.id,
      cc.numero_conta,
      cc.apelido,
      c.nome AS cliente_nome,
      i.nome AS instituicao_nome,
      cc.created_at
    FROM contas_corretora cc
    JOIN clientes c ON c.id = cc.cliente_id
    JOIN instituicoes i ON i.id = cc.instituicao_id
    ORDER BY cc.created_at DESC
  `);

  const contas = result.rows;

  return (
    <div className="main-card">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-300">Contas</h1>
          <p className="text-slate-300">Contas vinculadas aos clientes e instituições.</p>
        </div>
        <Link
          href="/contas/new"
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          Nova conta
        </Link>
      </div>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "12px" }}>Apelido</th>
              <th style={{ padding: "12px" }}>Número</th>
              <th style={{ padding: "12px" }}>Cliente</th>
              <th style={{ padding: "12px" }}>Instituição</th>
              <th style={{ padding: "12px" }}>Criado em</th>
            </tr>
          </thead>
          <tbody>
            {contas.map((conta: { id: string; numero_conta: string; apelido: string | null; cliente_nome: string; instituicao_nome: string; created_at: string }) => (
              <tr key={conta.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px" }}>{conta.apelido || "-"}</td>
                <td style={{ padding: "12px" }}>{conta.numero_conta}</td>
                <td style={{ padding: "12px" }}>{conta.cliente_nome}</td>
                <td style={{ padding: "12px" }}>{conta.instituicao_nome}</td>
                <td style={{ padding: "12px" }}>
                  {new Date(conta.created_at).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}

            {contas.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "16px", textAlign: "center" }}>
                  Nenhuma conta cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}