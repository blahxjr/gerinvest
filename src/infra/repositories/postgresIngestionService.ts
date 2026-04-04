import { pool } from '@/lib/db';
import type { PoolClient } from 'pg';
import type { Position } from '@/core/domain/position';
import type { ClasseAtivo, Currency } from '@/core/domain/types';

type PersistResult = {
  inserted: number;
  updated: number;
  skipped: number;
};

const ALLOWED_CLASSES: ClasseAtivo[] = [
  'ACAO_BR',
  'FII',
  'ETF_BR',
  'BDR',
  'ACAO_EUA',
  'ETF_EUA',
  'REIT',
  'FUNDO',
  'CRIPTO',
  'RENDA_FIXA',
  'POUPANCA',
  'PREVIDENCIA',
  'ALTERNATIVO',
];

function normalizeClasse(position: Position): ClasseAtivo {
  const raw = String(position.assetClass ?? position.classe ?? 'ALTERNATIVO');
  return ALLOWED_CLASSES.includes(raw as ClasseAtivo) ? (raw as ClasseAtivo) : 'ALTERNATIVO';
}

function normalizeCurrency(position: Position): Currency {
  const raw = String(position.moedaOriginal ?? position.currency ?? 'BRL');
  if (raw === 'USD' || raw === 'EUR' || raw === 'BRL') return raw;
  return 'BRL';
}

function toNumeric(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function ensureCarteiraId(client: PoolClient): Promise<string> {
  const existing = await client.query<{ id: string }>('SELECT id FROM carteiras ORDER BY criado_em ASC LIMIT 1');
  if (existing.rows[0]?.id) return existing.rows[0].id;

  const created = await client.query<{ id: string }>(
    `
      INSERT INTO carteiras (nome, descricao, perfil, moeda_base)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    ['Carteira Principal', 'Carteira criada automaticamente pela ingestao', 'moderado', 'BRL']
  );
  return created.rows[0].id;
}

async function upsertAtivoId(client: PoolClient, position: Position): Promise<string> {
  const classe = normalizeClasse(position);
  const ticker = (position.ticker ?? '').trim();
  const nome = (position.nome ?? position.description ?? 'Ativo sem nome').trim();

  const existingByTicker = ticker
    ? await client.query<{ id: string }>(
        'SELECT id FROM ativos WHERE classe = $1 AND ticker = $2 LIMIT 1',
        [classe, ticker]
      )
    : { rows: [] as Array<{ id: string }> };

  if (existingByTicker.rows[0]?.id) {
    return existingByTicker.rows[0].id;
  }

  const existingByName = await client.query<{ id: string }>(
    'SELECT id FROM ativos WHERE classe = $1 AND nome = $2 LIMIT 1',
    [classe, nome]
  );

  if (existingByName.rows[0]?.id) {
    return existingByName.rows[0].id;
  }

  const inserted = await client.query<{ id: string }>(
    `
      INSERT INTO ativos (ticker, nome, classe, moeda)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [ticker || null, nome, classe, normalizeCurrency(position)]
  );

  return inserted.rows[0].id;
}

export async function persistPositionsToPostgres(positions: Position[]): Promise<PersistResult> {
  const client = await pool.connect();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  try {
    await client.query('BEGIN');
    const carteiraId = await ensureCarteiraId(client);

    for (const position of positions) {
      const nome = (position.nome ?? position.description ?? '').trim();
      if (!nome) {
        skipped += 1;
        continue;
      }

      const ativoId = await upsertAtivoId(client, position);

      const quantidade = position.quantidade ?? position.quantity;
      const precoMedio = position.precoMedio ?? position.price;
      const valorBruto = position.valorAtualBruto ?? position.grossValue ?? toNumeric(quantidade, 0) * toNumeric(precoMedio, 0);
      const valorBrl = position.valorAtualBrl ?? valorBruto;
      const instituicao = (position.instituicao ?? position.institution ?? '').trim();
      const conta = (position.conta ?? position.account ?? '').trim();

      const existing = await client.query<{ id: string }>(
        `
          SELECT id
          FROM posicoes
          WHERE carteira_id = $1
            AND ativo_id = $2
            AND COALESCE(instituicao, '') = $3
            AND COALESCE(conta, '') = $4
          LIMIT 1
        `,
        [carteiraId, ativoId, instituicao, conta]
      );

      if (existing.rows[0]?.id) {
        await client.query(
          `
            UPDATE posicoes
            SET quantidade = $2,
                preco_medio = $3,
                valor_atual_bruto = $4,
                valor_atual_brl = $5,
                moeda_original = $6,
                instituicao = $7,
                conta = $8,
                data_vencimento = $9,
                atualizado_em = NOW()
            WHERE id = $1
          `,
          [
            existing.rows[0].id,
            quantidade ?? null,
            precoMedio ?? null,
            valorBruto,
            valorBrl,
            normalizeCurrency(position),
            instituicao || null,
            conta || null,
            position.dataVencimento ?? position.maturityDate ?? null,
          ]
        );
        updated += 1;
      } else {
        await client.query(
          `
            INSERT INTO posicoes (
              carteira_id,
              ativo_id,
              quantidade,
              preco_medio,
              valor_atual_bruto,
              valor_atual_brl,
              moeda_original,
              instituicao,
              conta,
              data_vencimento
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `,
          [
            carteiraId,
            ativoId,
            quantidade ?? null,
            precoMedio ?? null,
            valorBruto,
            valorBrl,
            normalizeCurrency(position),
            instituicao || null,
            conta || null,
            position.dataVencimento ?? position.maturityDate ?? null,
          ]
        );
        inserted += 1;
      }
    }

    await client.query('COMMIT');
    return { inserted, updated, skipped };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
