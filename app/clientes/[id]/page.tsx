import Link from "next/link";
import { pool } from "@/lib/db";

type PageProps = {
  params: { id: string };
};

export default async function ClienteDetalhePage({ params }: PageProps) {
  const clienteId = params.id;

  // 1) Dados do cliente
  const clienteResult = await pool.query(
    `
    SELECT id, nome, documento, email, created_at
    FROM clientes
    WHERE id = $1
  `,
    [clienteId]
  );

  const cliente = clienteResult.rows[0];

  if (!cliente) {
    return (
      <div>
        <h1>Cliente não encontrado</h1>
        <p>Verifique o endereço ou selecione um cliente pela lista.</p>
      </div>
    );
  }

  // 2) Contas do cliente
  const contasResult = await pool.query(
    `
    SELECT
      cc.id,
      cc.numero_conta,
      cc.apelido,
      i.nome AS instituicao_nome,
      cc.created_at
    FROM contas_corretora cc
    JOIN instituicoes i ON i.id = cc.instituicao_id
    WHERE cc.cliente_id = $1
    ORDER BY cc.created_at DESC
  `,
    [clienteId]
  );

  type Conta = {
    id: string;
    numero_conta: string;
    apelido: string | null;
    instituicao_nome: string;
    created_at: string;
  };

  type Posicao = {
    id: string;
    data_referencia: string;
    quantidade: number;
    valor_liquido: number;
    preco_fechamento: number;
    conta: string;
    codigo_negociacao: string | null;
    nome_produto: string;
    tipo_investimento: string | null;
  };

  const contas = contasResult.rows as Conta[];

  // 3) Posições do cliente
  const posicoesResult = await pool.query(
    `
    SELECT
      pd.id,
      pd.data_referencia,
      pd.quantidade,
      pd.valor_liquido,
      pd.preco_fechamento,
      cc.apelido AS conta,
      a.codigo_negociacao,
      a.nome_produto,
      ti.nome AS tipo_investimento
    FROM posicoes_diarias pd
    JOIN contas_corretora cc ON cc.id = pd.conta_id
    JOIN ativos a ON a.id = pd.ativo_id
    LEFT JOIN tipos_investimento ti ON ti.id = a.tipo_investimento_id
    WHERE cc.cliente_id = $1
    ORDER BY pd.data_referencia DESC, a.nome_produto ASC
  `,
    [clienteId]
  );

  const posicoes = posicoesResult.rows;

  // 4) KPIs da carteira do cliente
  const kpiResult = await pool.query(
    `
    SELECT
      COALESCE(SUM(pd.valor_liquido), 0) AS valor_total,
      MAX(pd.data_referencia)           AS ultima_data
    FROM posicoes_diarias pd
    JOIN contas_corretora cc ON cc.id = pd.conta_id
    WHERE cc.cliente_id = $1
  `,
    [clienteId]
  );

  const kpi = kpiResult.rows[0];
  const valorTotal = Number(kpi?.valor_total || 0);
  const ultimaData = kpi?.ultima_data
    ? new Date(kpi.ultima_data).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className="main-card" style={{ maxWidth: "1120px" }}>
      {/* HERO / RESUMO ESTILO B3 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sky-300">Cliente</h1>
        <p className="text-slate-300">Visualização detalhada e histórico do cliente.</p>
      </div>
      <div
        className="panel"
        style={{
          marginBottom: "24px",
          padding: "20px 24px",
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1d4ed8 40%, #22c55e 100%)",
          color: "#f9fafb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.55)",
        }}
      >
        <div>
          <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>Cliente</p>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 600 }}>
            {cliente.nome}
          </h1>
          <p style={{ marginTop: "4px", fontSize: "0.9rem", opacity: 0.9 }}>
            Documento: {cliente.documento || "-"} • Email: {cliente.email || "-"}
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Valor total da carteira
          </p>
          <p style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            {valorTotal.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p style={{ marginTop: "4px", fontSize: "0.8rem", opacity: 0.85 }}>
            {ultimaData
              ? `Com base em ${ultimaData}`
              : "Sem posições registradas"}
          </p>
        </div>
      </div>

      {/* LINHA DE CARDS RESUMO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "12px 16px",
            border: "1px solid #e5e7eb",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Contas</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>{contas.length}</p>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "12px 16px",
            border: "1px solid #e5e7eb",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Posições</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
            {posicoes.length}
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "12px 16px",
            border: "1px solid #e5e7eb",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Criado em</p>
          <p style={{ fontSize: "0.95rem", fontWeight: 500 }}>
            {new Date(cliente.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* CONTAS DO CLIENTE */}
      <div className="panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-sky-300">Contas do cliente</h2>
          <Link
            href="/contas/new"
            className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Nova conta
          </Link>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Apelido</th>
                <th>Número</th>
                <th>Instituição</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {contas.length > 0 ? (
                contas.map((conta: Conta) => (
                  <tr key={conta.id}>
                    <td>{conta.apelido || "-"}</td>
                    <td>{conta.numero_conta}</td>
                    <td>{conta.instituicao_nome}</td>
                    <td>{new Date(conta.created_at).toLocaleString("pt-BR")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-slate-400 py-4">
                    Nenhuma conta cadastrada para este cliente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POSIÇÕES DO CLIENTE */}
      <div className="panel">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-sky-300">Posições do cliente</h2>
        </div>

        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Conta</th>
                <th>Código</th>
                <th>Ativo</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Preço</th>
                <th>Valor líquido</th>
              </tr>
            </thead>
            <tbody>
              {posicoes.length > 0 ? (
                posicoes.map((p: Posicao) => (
                  <tr key={p.id}>
                    <td>{new Date(p.data_referencia).toLocaleDateString("pt-BR")}</td>
                    <td>{p.conta}</td>
                    <td>{p.codigo_negociacao || "-"}</td>
                    <td>{p.nome_produto}</td>
                    <td>{p.tipo_investimento || "-"}</td>
                    <td>{p.quantidade}</td>
                    <td>{p.preco_fechamento || "-"}</td>
                    <td>{p.valor_liquido || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-slate-400 py-4">
                    Nenhuma posição cadastrada para este cliente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}