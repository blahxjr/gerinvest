import CadastroManualInvestimentosClient from "../../src/ui/components/cadastro/CadastroManualInvestimentosClient";
import { getPortfolioRepository } from "@/infra/repositories/postgresPortfolioRepository";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

type ClienteRow = {
  id: string;
  nome: string;
  documento?: string;
};

type InstituicaoRow = {
  id: string;
  nome: string;
};

type ContaRow = {
  id: string;
  clienteId: string;
  instituicaoId: string;
  instituicaoNome: string;
  numeroConta: string;
  apelido?: string;
};

export default async function CadastroManualInvestimentosPage() {
  const repo = getPortfolioRepository();

  const [clientesResult, instituicoesResult, contasResult, carteiras] = await Promise.all([
    pool.query<ClienteRow>(`SELECT id, nome, documento FROM clientes ORDER BY nome ASC`),
    pool.query<InstituicaoRow>(`SELECT id, nome FROM instituicoes ORDER BY nome ASC`),
    pool.query<ContaRow>(`
      SELECT
        cc.id,
        cc.cliente_id as "clienteId",
        cc.instituicao_id as "instituicaoId",
        i.nome as "instituicaoNome",
        cc.numero_conta as "numeroConta",
        cc.apelido
      FROM contas_corretora cc
      JOIN instituicoes i ON i.id = cc.instituicao_id
      ORDER BY i.nome ASC, cc.numero_conta ASC
    `),
    repo.getAllCarteiras(),
  ]);

  return (
    <CadastroManualInvestimentosClient
      clientes={clientesResult.rows}
      instituicoes={instituicoesResult.rows}
      contas={contasResult.rows}
      carteiras={carteiras}
    />
  );
}
