import { pool } from "@/lib/db";
import { parse } from "csv-parse/sync";
import { createHash } from "crypto";
import path from "path";
import { writeCsv } from "@/infra/csv/csv-writer";
import type { Position } from "@/core/domain/position";
import type { ClasseAtivo } from "@/core/domain/types";

export const runtime = "nodejs";

const PORTFOLIO_CSV = path.join(process.cwd(), "public", "data", "portfolio-positions.csv");

function mapB3TipoToClasse(tipo: string): ClasseAtivo {
  const map: Record<string, ClasseAtivo> = {
    ACAO: "ACAO_BR",
    BDR: "BDR",
    ETF: "ETF_BR",
    FII: "FII",
    FIAGRO: "FII",
    TESOURO: "RENDA_FIXA",
    RENDA_FIXA: "RENDA_FIXA",
  };
  return map[tipo] ?? "ALTERNATIVO";
}

type CsvRow = Record<string, string>;

function normalizarNumero(valor?: string | null) {
  if (!valor) return null;
  const limpo = valor
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/\s/g, "")
    .trim();

  if (!limpo) return null;

  const numero = Number(limpo);
  return Number.isNaN(numero) ? null : numero;
}

function normalizarData(valor?: string | null) {
  if (!valor) return null;

  const texto = valor.trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
    const [dia, mes, ano] = texto.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto;
  }

  return null;
}

function gerarHashLinha(row: CsvRow) {
  return createHash("sha256")
    .update(JSON.stringify(row))
    .digest("hex");
}

function detectarTipoInvestimento(row: CsvRow) {
  const tipo =
    row["Tipo"] ||
    row["Tipo de Investimento"] ||
    row["Categoria"] ||
    row["Segmento"] ||
    "";

  const texto = tipo.toUpperCase();

  if (texto.includes("BDR")) return "BDR";
  if (texto.includes("ETF")) return "ETF";
  if (texto.includes("FII")) return "FII";
  if (texto.includes("FIAGRO")) return "FIAGRO";
  if (texto.includes("TESOURO")) return "TESOURO";
  if (
    texto.includes("CDB") ||
    texto.includes("LCI") ||
    texto.includes("LCA") ||
    texto.includes("DEB") ||
    texto.includes("RENDA FIXA")
  ) {
    return "RENDA_FIXA";
  }

  return "ACAO";
}

function obterCampo(row: CsvRow, nomes: string[]) {
  for (const nome of nomes) {
    if (row[nome] !== undefined && row[nome] !== null && row[nome] !== "") {
      return row[nome];
    }
  }
  return null;
}

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  const parsedPositions: Position[] = [];

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json(
        { ok: false, error: "Arquivo não enviado." },
        { status: 400 }
      );
    }

    const nomeArquivo = file.name.toLowerCase();
    if (!nomeArquivo.endsWith(".csv") && !nomeArquivo.endsWith(".txt")) {
      return Response.json(
        { ok: false, error: "Por enquanto a API aceita apenas CSV/TXT." },
        { status: 400 }
      );
    }

    const texto = await file.text();

    const registros = parse(texto, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ";",
      bom: true,
      trim: true,
    }) as CsvRow[];

    if (!registros.length) {
      return Response.json(
        { ok: false, error: "Arquivo vazio ou sem linhas válidas." },
        { status: 400 }
      );
    }

    const contaResult = await client.query(`
      SELECT id, apelido
      FROM contas_corretora
      ORDER BY created_at ASC
      LIMIT 1
    `);

    if (!contaResult.rows.length) {
      return Response.json(
        { ok: false, error: "Nenhuma conta cadastrada para vincular a importação." },
        { status: 400 }
      );
    }

    const contaId = contaResult.rows[0].id;

    let inseridos = 0;
    let ignorados = 0;
    let ativosCriados = 0;
    const erros: string[] = [];

    await client.query("BEGIN");

    for (let i = 0; i < registros.length; i++) {
      const row = registros[i];

      try {
        const codigo = obterCampo(row, [
          "Código",
          "Codigo",
          "Ticker",
          "Código de Negociação",
          "Produto",
        ]);

        const nomeProduto = obterCampo(row, [
          "Nome",
          "Nome do Ativo",
          "Produto",
          "Ativo",
          "Descrição",
          "Descricao",
        ]);

        const dataReferencia = normalizarData(
          obterCampo(row, ["Data", "Data de Referência", "Data Referência", "Pregão", "Pregao"])
        );

        const quantidade = normalizarNumero(
          obterCampo(row, ["Quantidade", "Qtde", "Quantidade Total"])
        );

        const precoFechamento = normalizarNumero(
          obterCampo(row, ["Preço", "Preco", "Preço Fechamento", "Preco Fechamento"])
        );

        const valorLiquido = normalizarNumero(
          obterCampo(row, ["Valor Líquido", "Valor Liquido", "Valor", "Financeiro"])
        );

        if (!codigo || !nomeProduto || !dataReferencia || quantidade === null) {
          ignorados++;
          erros.push(`Linha ${i + 1}: faltam campos obrigatórios.`);
          continue;
        }

        const tipoInvestimento = detectarTipoInvestimento(row);

        const tipoResult = await client.query(
          `SELECT id FROM tipos_investimento WHERE nome = $1 LIMIT 1`,
          [tipoInvestimento]
        );

        if (!tipoResult.rows.length) {
          ignorados++;
          erros.push(`Linha ${i + 1}: tipo ${tipoInvestimento} não encontrado.`);
          continue;
        }

        const tipoInvestimentoId = tipoResult.rows[0].id;

        let ativoId: string;

        const ativoExistente = await client.query(
          `
          SELECT id
          FROM ativos
          WHERE codigo_negociacao = $1
          LIMIT 1
          `,
          [codigo]
        );

        if (ativoExistente.rows.length) {
          ativoId = ativoExistente.rows[0].id;
        } else {
          const ativoInsert = await client.query(
            `
            INSERT INTO ativos (
              codigo_negociacao,
              nome_produto,
              tipo_papel,
              emissor,
              tipo_investimento_id
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `,
            [
              codigo,
              nomeProduto,
              obterCampo(row, ["Papel", "Tipo Papel", "Tipo do Papel"]) || tipoInvestimento,
              obterCampo(row, ["Emissor", "Instituição", "Instituicao"]) || null,
              tipoInvestimentoId,
            ]
          );

          ativoId = ativoInsert.rows[0].id;
          ativosCriados++;
        }

        const hashLinha = gerarHashLinha(row);

        const insertPosicao = await client.query(
          `
          INSERT INTO posicoes_diarias (
            conta_id,
            ativo_id,
            data_referencia,
            quantidade,
            quantidade_disponivel,
            preco_fechamento,
            valor_liquido,
            origem,
            hash_linha
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (conta_id, ativo_id, data_referencia, origem, hash_linha)
          DO NOTHING
          RETURNING id
          `,
          [
            contaId,
            ativoId,
            dataReferencia,
            quantidade,
            quantidade,
            precoFechamento,
            valorLiquido,
            "B3",
            hashLinha,
          ]
        );

        if (insertPosicao.rows.length) {
          inseridos++;
          // Coleta posição para sincronizar com portfolio-positions.csv
          const classe = mapB3TipoToClasse(tipoInvestimento);
          const grossVal = valorLiquido ?? (quantidade ?? 0) * (precoFechamento ?? 0);
          parsedPositions.push({
            id: `B3-${codigo}-${dataReferencia}`,
            classe,
            assetClass: classe,
            nome: nomeProduto,
            ticker: codigo,
            description: nomeProduto,
            quantidade: quantidade ?? undefined,
            quantity: quantidade ?? undefined,
            precoMedio: precoFechamento ?? undefined,
            price: precoFechamento ?? undefined,
            valorAtualBruto: grossVal,
            grossValue: grossVal,
            valorAtualBrl: grossVal,
            moedaOriginal: "BRL",
            currency: "BRL",
          });
        } else {
          ignorados++;
        }
      } catch (erroInterno: unknown) {
        ignorados++;
        const message =
          erroInterno && typeof erroInterno === "object" && erroInterno !== null && "message" in erroInterno
            ? (erroInterno as Error).message
            : "Erro interno na linha";
        erros.push(`Linha ${i + 1}: ${message}`);
      }
    }

    await client.query("COMMIT");

    // Sincroniza posições importadas com portfolio-positions.csv para o dashboard
    if (parsedPositions.length > 0) {
      try {
        const { CsvPortfolioRepository } = await import("@/infra/repositories/csvPortfolioRepository");
        const repo = new CsvPortfolioRepository(PORTFOLIO_CSV);
        const existing = await repo.getAllPositions().catch(() => []);

        // Mescla: remove posições B3 antigas, inclui as novas
        const nonB3 = existing.filter((p) => !p.id?.startsWith("B3-"));
        const merged = [...nonB3, ...parsedPositions];
        await writeCsv(PORTFOLIO_CSV, merged);
      } catch (csvErr) {
        console.warn("Importação OK no Postgres, mas falha ao sincronizar CSV:", csvErr);
      }
    }

    return Response.json({
      ok: true,
      arquivo: file.name,
      totalLinhas: registros.length,
      inseridos,
      ignorados,
      ativosCriados,
      erros: erros.slice(0, 20),
    });
  } catch (error: unknown) {
    await client.query("ROLLBACK");

    const message =
      error && typeof error === "object" && error !== null && "message" in error
        ? (error as Error).message
        : "Erro ao processar arquivo.";

    return Response.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}