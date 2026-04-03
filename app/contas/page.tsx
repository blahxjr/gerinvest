import Link from "next/link";
import { CsvContaRepository } from "@/infra/repositories/csvContaRepository";

export default async function ContasPage() {
  const repo = new CsvContaRepository();
  const contas = await repo.getAllContas();

  return (
    <div className="main-card">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-300">Contas</h1>
          <p className="text-slate-300">Contas vinculadas aos clientes.</p>
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
              <th style={{ padding: "12px" }}>Nome</th>
              <th style={{ padding: "12px" }}>Tipo</th>
              <th style={{ padding: "12px" }}>Cliente ID</th>
              <th style={{ padding: "12px" }}>Criado em</th>
            </tr>
          </thead>
          <tbody>
            {contas.map((conta) => (
              <tr key={conta.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px" }}>{conta.nome}</td>
                <td style={{ padding: "12px" }}>{conta.tipo}</td>
                <td style={{ padding: "12px" }}>{conta.cliente_id}</td>
                <td style={{ padding: "12px" }}>{new Date(conta.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
            {contas.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "16px", textAlign: "center" }}>
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