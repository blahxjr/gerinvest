/**
 * proventosService — CRUD e apuração de proventos via PostgreSQL.
 * Toda lógica de IR é delegada ao impostoService (sem side-effects).
 */
import { pool } from '@/lib/db';
import {
  Provento,
  ProventoInput,
  ResumoIRMensal,
  TipoProvento,
} from '../domain/provento';
import { calcularIrJcp, isProventoIsentoIRRF } from './impostoService';
import { ClasseAtivo } from '../domain/types';

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function rowToProvento(row: Record<string, unknown>): Provento {
  return {
    id:               String(row.id),
    posicaoId:        row.posicao_id ? String(row.posicao_id) : null,
    carteiraId:       row.carteira_id ? String(row.carteira_id) : null,
    tipo:             row.tipo as TipoProvento,
    ticker:           row.ticker ? String(row.ticker) : null,
    descricao:        row.descricao ? String(row.descricao) : null,
    valorBruto:       Number(row.valor_bruto),
    irRetido:         Number(row.ir_retido),
    valorLiquido:     Number(row.valor_liquido),
    impostoIncidente: Number(row.imposto_incidente),
    dataCom:          row.data_com ? String(row.data_com).substring(0, 10) : null,
    dataPagamento:    String(row.data_pagamento).substring(0, 10),
    competencia:      row.competencia ? String(row.competencia) : null,
    observacao:       row.observacao ? String(row.observacao) : null,
    criadoEm:        row.criado_em ? String(row.criado_em) : undefined,
    atualizadoEm:    row.atualizado_em ? String(row.atualizado_em) : undefined,
  };
}

/**
 * Auto-preenche irRetido e impostoIncidente conforme regras tributárias BR.
 */
function enriquecerComIR(input: ProventoInput, classeAtivo?: ClasseAtivo): ProventoInput {
  let irRetido = input.irRetido ?? 0;
  let impostoIncidente = input.impostoIncidente ?? 0;

  if (input.tipo === 'JCP') {
    const { irRetido: ir } = calcularIrJcp(input.valorBruto);
    irRetido = ir;
    impostoIncidente = 0; // já retido
  }

  if (classeAtivo && isProventoIsentoIRRF(input.tipo, classeAtivo)) {
    irRetido = 0;
    impostoIncidente = 0;
  }

  return { ...input, irRetido: irRetido ?? 0, impostoIncidente: impostoIncidente ?? 0 };
}

// ------------------------------------------------------------------
// CRUD
// ------------------------------------------------------------------

export async function listarProventos(carteiraId?: string): Promise<Provento[]> {
  const query = carteiraId
    ? `SELECT * FROM proventos WHERE carteira_id = $1 ORDER BY data_pagamento DESC`
    : `SELECT * FROM proventos ORDER BY data_pagamento DESC`;

  const params = carteiraId ? [carteiraId] : [];
  const result = await pool.query(query, params);
  return result.rows.map(rowToProvento);
}

export async function buscarProvento(id: string): Promise<Provento | null> {
  const result = await pool.query('SELECT * FROM proventos WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return rowToProvento(result.rows[0]);
}

export async function criarProvento(input: ProventoInput, classeAtivo?: ClasseAtivo): Promise<Provento> {
  const enriched = enriquecerComIR(input, classeAtivo);

  const result = await pool.query(
    `INSERT INTO proventos
       (posicao_id, carteira_id, tipo, ticker, descricao, valor_bruto, ir_retido,
        imposto_incidente, data_com, data_pagamento, competencia, observacao)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      enriched.posicaoId ?? null,
      enriched.carteiraId ?? null,
      enriched.tipo,
      enriched.ticker ?? null,
      enriched.descricao ?? null,
      enriched.valorBruto,
      enriched.irRetido,
      enriched.impostoIncidente,
      enriched.dataCom ?? null,
      enriched.dataPagamento,
      enriched.competencia ?? null,
      enriched.observacao ?? null,
    ],
  );

  return rowToProvento(result.rows[0]);
}

export async function atualizarProvento(id: string, input: Partial<ProventoInput>): Promise<Provento> {
  const existing = await buscarProvento(id);
  if (!existing) throw new Error(`Provento ${id} não encontrado`);

  const merged: ProventoInput = {
    tipo:             input.tipo              ?? existing.tipo,
    valorBruto:       input.valorBruto        ?? existing.valorBruto,
    irRetido:         input.irRetido          ?? existing.irRetido,
    impostoIncidente: input.impostoIncidente  ?? existing.impostoIncidente,
    dataPagamento:    input.dataPagamento     ?? existing.dataPagamento,
    posicaoId:        input.posicaoId         !== undefined ? input.posicaoId  : existing.posicaoId,
    carteiraId:       input.carteiraId        !== undefined ? input.carteiraId : existing.carteiraId,
    ticker:           input.ticker            !== undefined ? input.ticker     : existing.ticker,
    descricao:        input.descricao         !== undefined ? input.descricao  : existing.descricao,
    dataCom:          input.dataCom           !== undefined ? input.dataCom    : existing.dataCom,
    competencia:      input.competencia       !== undefined ? input.competencia: existing.competencia,
    observacao:       input.observacao        !== undefined ? input.observacao : existing.observacao,
  };

  const result = await pool.query(
    `UPDATE proventos SET
       posicao_id=$1, carteira_id=$2, tipo=$3, ticker=$4, descricao=$5,
       valor_bruto=$6, ir_retido=$7, imposto_incidente=$8,
       data_com=$9, data_pagamento=$10, competencia=$11, observacao=$12
     WHERE id=$13 RETURNING *`,
    [
      merged.posicaoId ?? null,
      merged.carteiraId ?? null,
      merged.tipo,
      merged.ticker ?? null,
      merged.descricao ?? null,
      merged.valorBruto,
      merged.irRetido,
      merged.impostoIncidente,
      merged.dataCom ?? null,
      merged.dataPagamento,
      merged.competencia ?? null,
      merged.observacao ?? null,
      id,
    ],
  );

  return rowToProvento(result.rows[0]);
}

export async function deletarProvento(id: string): Promise<void> {
  await pool.query('DELETE FROM proventos WHERE id = $1', [id]);
}

// ------------------------------------------------------------------
// Apuração mensal IR
// ------------------------------------------------------------------

export async function apurarIRMensal(competencia: string, carteiraId?: string): Promise<ResumoIRMensal> {
  const baseQuery = `
    SELECT tipo, valor_bruto, ir_retido, imposto_incidente
    FROM proventos
    WHERE competencia = $1 ${carteiraId ? 'AND carteira_id = $2' : ''}
  `;
  const params: string[] = carteiraId ? [competencia, carteiraId] : [competencia];
  const result = await pool.query(baseQuery, params);

  let dividendos = 0;
  let jcp = 0;
  let rendimentoFII = 0;
  let gcapBruto = 0;
  let irRetidoFonte = 0;
  let irARecolher = 0;

  for (const row of result.rows) {
    const tipo = row.tipo as TipoProvento;
    const bruto = Number(row.valor_bruto);
    const irFonte = Number(row.ir_retido);
    const irDarf = Number(row.imposto_incidente);

    irRetidoFonte += irFonte;
    irARecolher += irDarf;

    switch (tipo) {
      case 'DIVIDENDO':    dividendos    += bruto; break;
      case 'JCP':          jcp           += bruto; break;
      case 'RENDA_FII':    rendimentoFII += bruto; break;
      case 'GCAP':         gcapBruto     += bruto; break;
    }
  }

  return {
    competencia,
    dividendos,
    jcp,
    rendimentoFII,
    gcapBruto,
    gcapIsento: 0, // informado via input de gcap separado
    gcapTributavel: gcapBruto,
    irRetidoFonte,
    irARecolher,
    baseCalculo: [],
  };
}
