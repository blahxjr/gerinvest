import { parse } from "csv-parse/sync";
import { NextRequest } from "next/server";
import type { Position } from "@/core/domain/position";
import type { ClasseAtivo } from "@/core/domain/types";
import { persistPositionsToPostgres } from "@/infra/repositories/postgresIngestionService";

export const runtime = "nodejs";

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

export async function POST(req: NextRequest) {
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

    const positions: Position[] = [];
    const erros: string[] = [];

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
          erros.push(`Linha ${i + 2}: faltam campos obrigatórios.`);
          continue;
        }

        const tipoInvestimento = detectarTipoInvestimento(row);
        const classe = mapB3TipoToClasse(tipoInvestimento);
        const grossVal = valorLiquido ?? (quantidade ?? 0) * (precoFechamento ?? 0);
        const instituicao = obterCampo(row, ["Emissor", "Instituição", "Instituicao"]) ?? undefined;

        positions.push({
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
          instituicao,
          institution: instituicao,
          dataEntrada: dataReferencia,
        });
      } catch (erroInterno: unknown) {
        const message =
          erroInterno instanceof Error ? erroInterno.message : "Erro interno na linha";
        erros.push(`Linha ${i + 2}: ${message}`);
      }
    }

    if (positions.length === 0) {
      return Response.json(
        {
          ok: false,
          error: "Nenhuma posição válida encontrada no arquivo.",
          erros: erros.slice(0, 20),
        },
        { status: 400 }
      );
    }

    const persisted = await persistPositionsToPostgres(positions);

    return Response.json({
      ok: true,
      arquivo: file.name,
      totalLinhas: registros.length,
      inseridos: persisted.inserted,
      atualizados: persisted.updated,
      ignorados: persisted.skipped + erros.length,
      erros: erros.slice(0, 20),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao processar arquivo.";

    return Response.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}