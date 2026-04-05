/**
 * PostgreSQL Portfolio Repository
 * Integra com migrations/004_multiativo_schema.sql
 * Fornece CRUD completo para Carteiras, Ativos, Posições
 */

import { Pool, QueryResult } from 'pg';
import { Carteira, Ativo, PosicaoDB, CreateCarteiraInput, CreateAtivoInput, CreatePosicaoInput } from '@/core/domain/entities';
import { ClasseAtivo, SubclasseAtivo, Currency } from '@/core/domain/types';
import { Position } from '@/core/domain/position';
import { PortfolioSummary } from '@/core/domain/portfolio';

export class PostgresPortfolioRepository {
  private pool: Pool;

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL,
    });
  }

  /**
   * ========== CARTEIRAS ==========
   */

  async createCarteira(input: CreateCarteiraInput): Promise<Carteira> {
    const query = `
      INSERT INTO carteiras (nome, descricao, perfil, moeda_base, cliente_id, conta_referencia_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nome, descricao, perfil, moeda_base as "moedaBase",
                cliente_id as "clienteId", conta_referencia_id as "contaReferenciaId",
                criado_em as "criadoEm", atualizado_em as "atualizadoEm"
    `;
    const result = await this.pool.query(query, [
      input.nome,
      input.descricao,
      input.perfil,
      input.moedaBase,
      input.clienteId,
      input.contaReferenciaId,
    ]);
    return result.rows[0];
  }

  async getAllCarteiras(): Promise<Carteira[]> {
    const query = `
          SELECT id, nome, descricao, perfil, moeda_base as "moedaBase",
            cliente_id as "clienteId", conta_referencia_id as "contaReferenciaId",
             criado_em as "criadoEm", atualizado_em as "atualizadoEm"
      FROM carteiras
      ORDER BY criado_em DESC
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getCarteiraById(id: string): Promise<Carteira | null> {
    const query = `
          SELECT id, nome, descricao, perfil, moeda_base as "moedaBase",
            cliente_id as "clienteId", conta_referencia_id as "contaReferenciaId",
             criado_em as "criadoEm", atualizado_em as "atualizadoEm"
      FROM carteiras WHERE id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateCarteira(id: string, input: Partial<CreateCarteiraInput>): Promise<Carteira> {
    const fields: string[] = [];
    const values: unknown[] = [id];
    let paramCount = 2;

    if (input.nome) {
      fields.push(`nome = $${paramCount}`);
      values.push(input.nome);
      paramCount++;
    }
    if (input.descricao !== undefined) {
      fields.push(`descricao = $${paramCount}`);
      values.push(input.descricao);
      paramCount++;
    }
    if (input.perfil) {
      fields.push(`perfil = $${paramCount}`);
      values.push(input.perfil);
      paramCount++;
    }
    if (input.moedaBase) {
      fields.push(`moeda_base = $${paramCount}`);
      values.push(input.moedaBase);
      paramCount++;
    }
    if (input.clienteId !== undefined) {
      fields.push(`cliente_id = $${paramCount}`);
      values.push(input.clienteId);
      paramCount++;
    }
    if (input.contaReferenciaId !== undefined) {
      fields.push(`conta_referencia_id = $${paramCount}`);
      values.push(input.contaReferenciaId);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.getCarteiraById(id) as Promise<Carteira>;
    }

    const query = `
      UPDATE carteiras
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING id, nome, descricao, perfil, moeda_base as "moedaBase",
                cliente_id as "clienteId", conta_referencia_id as "contaReferenciaId",
                criado_em as "criadoEm", atualizado_em as "atualizadoEm"
    `;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteCarteira(id: string): Promise<void> {
    const query = 'DELETE FROM carteiras WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  /**
   * ========== ATIVOS ==========
   */

  async createAtivo(input: CreateAtivoInput): Promise<Ativo> {
    const query = `
      INSERT INTO ativos (ticker, nome, classe, subclasse, pais, moeda, setor, segmento, benchmark, indexador, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, ticker, nome, classe, subclasse, pais, moeda, setor, segmento, benchmark, indexador, metadata,
                criado_em as "criadoEm", atualizado_em as "atualizadoEm"
    `;
    const result = await this.pool.query(query, [
      input.ticker,
      input.nome,
      input.classe,
      input.subclasse,
      input.pais,
      input.moeda,
      input.setor,
      input.segmento,
      input.benchmark,
      input.indexador,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ]);
    return result.rows[0];
  }

  async getAllAtivos(): Promise<Ativo[]> {
    const query = `
      SELECT id, ticker, nome, classe, subclasse, pais, moeda, setor, segmento, benchmark, indexador, metadata,
             criado_em as "criadoEm", atualizado_em as "atualizadoEm"
      FROM ativos
      ORDER BY nome
    `;
    const result = await this.pool.query(query);
    return result.rows.map(this.parseAtivo);
  }

  async getAtivoById(id: string): Promise<Ativo | null> {
    const query = `
      SELECT id, ticker, nome, classe, subclasse, pais, moeda, setor, segmento, benchmark, indexador, metadata,
             criado_em as "criadoEm", atualizado_em as "atualizadoEm"
      FROM ativos WHERE id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.parseAtivo(result.rows[0]) : null;
  }

  async getAtivosByClasse(classe: ClasseAtivo): Promise<Ativo[]> {
    const query = `
      SELECT id, ticker, nome, classe, subclasse, pais, moeda, setor, segmento, benchmark, indexador, metadata,
             criado_em as "criadoEm", atualizado_em as "atualizadoEm"
      FROM ativos WHERE classe = $1
      ORDER BY nome
    `;
    const result = await this.pool.query(query, [classe]);
    return result.rows.map(this.parseAtivo);
  }

  async updateAtivo(id: string, input: Partial<CreateAtivoInput>): Promise<Ativo> {
    const fields: string[] = [];
    const values: unknown[] = [id];
    let paramCount = 2;

    const fieldMap: Record<string, string> = {
      ticker: 'ticker',
      nome: 'nome',
      classe: 'classe',
      subclasse: 'subclasse',
      pais: 'pais',
      moeda: 'moeda',
      setor: 'setor',
      segmento: 'segmento',
      benchmark: 'benchmark',
      indexador: 'indexador',
      metadata: 'metadata',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (key in input && input[key as keyof CreateAtivoInput] !== undefined) {
        fields.push(`${dbField} = $${paramCount}`);
        const value = input[key as keyof CreateAtivoInput];
        values.push(dbField === 'metadata' ? JSON.stringify(value) : value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return this.getAtivoById(id) as Promise<Ativo>;
    }

    const query = `
      UPDATE ativos
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING id, ticker, nome, classe, subclasse, pais, moeda, setor, segmento, benchmark, indexador, metadata,
                criado_em as "criadoEm", atualizado_em as "atualizadoEm"
    `;
    const result = await this.pool.query(query, values);
    return this.parseAtivo(result.rows[0]);
  }

  async deleteAtivo(id: string): Promise<void> {
    const query = 'DELETE FROM ativos WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  /**
   * ========== POSIÇÕES ==========
   */

  async getAllPositions(filters?: { classe?: ClasseAtivo; instituicao?: string }): Promise<Position[]> {
    const where: string[] = [];
    const values: unknown[] = [];

    if (filters?.classe) {
      values.push(filters.classe);
      where.push(`v.classe = $${values.length}`);
    }

    if (filters?.instituicao) {
      values.push(filters.instituicao);
      where.push(`v.instituicao_nome = $${values.length}`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const query = `
      SELECT
        v.posicao_id as id,
        v.classe,
        v.subclasse,
        COALESCE(v.ticker, '') as ticker,
        v.ativo_nome as nome,
        v.ativo_nome as descricao,
        v.cliente_nome as "clienteNome",
        v.carteira_nome as "carteiraNome",
        COALESCE(v.instituicao_nome, '') as instituicao,
        COALESCE(v.conta_apelido, v.numero_conta, '') as conta,
        v.conta_apelido as "contaApelido",
        v.quantidade,
        v.preco_medio as "precoMedio",
        v.valor_atual_bruto as "valorAtualBruto",
        v.valor_atual_brl as "valorAtualBrl",
        v.moeda_original as "moedaOriginal",
        a.indexador,
        v.data_vencimento as "dataVencimento",
        a.benchmark,
        a.metadata,
        v.atualizado_em as "atualizadoEm"
      FROM vw_posicoes_relacionais v
      JOIN ativos a ON a.id = v.ativo_id
      ${whereClause}
      ORDER BY v.atualizado_em DESC
    `;

    const result = await this.pool.query(query, values);
    return result.rows.map((row) => this.mapRowToPosition(row));
  }

  async getPositionsByAssetClass(classe: ClasseAtivo): Promise<Position[]> {
    return this.getAllPositions({ classe });
  }

  async getPositionsByInstitution(instituicao: string): Promise<Position[]> {
    return this.getAllPositions({ instituicao });
  }

  async getSummary(filters?: { classe?: ClasseAtivo; instituicao?: string }): Promise<PortfolioSummary> {
    const positions = await this.getAllPositions(filters);
    const totalInvested = positions.reduce((acc, p) => acc + (p.valorAtualBrl ?? p.grossValue ?? 0), 0);
    const uniqueTickers = new Set(positions.map((p) => p.ticker || p.nome)).size;
    const uniqueAccounts = new Set(positions.map((p) => p.conta || p.account).filter(Boolean)).size;
    const uniqueInstitutions = new Set(positions.map((p) => p.instituicao || p.institution).filter(Boolean)).size;
    const uniqueClients = new Set(positions.map((p) => p.clienteNome).filter(Boolean)).size;
    const uniquePortfolios = new Set(positions.map((p) => p.carteiraNome).filter(Boolean)).size;

    return {
      totalInvested,
      totalPositions: positions.length,
      uniqueTickers,
      uniqueAccounts,
      uniqueInstitutions,
      uniqueClients,
      uniquePortfolios,
    };
  }

  async getLastImportDate(): Promise<string | undefined> {
    const query = `SELECT MAX(atualizado_em) as "maxDate" FROM posicoes`;
    const result = await this.pool.query(query);
    const value = result.rows[0]?.maxDate as Date | string | undefined;
    if (!value) return undefined;
    const asDate = typeof value === 'string' ? new Date(value) : value;
    return asDate.toISOString();
  }

  async createPosicao(input: CreatePosicaoInput): Promise<PosicaoDB> {
    const query = `
      INSERT INTO posicoes (
        carteira_id, ativo_id, cliente_id, instituicao_id, conta_id,
        quantidade, preco_medio, valor_atual_bruto, valor_atual_brl, moeda_original,
        instituicao, conta, custodia, data_entrada, data_vencimento, origem_dado, importado_em
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id, carteira_id as "carteiraId", ativo_id as "ativoId",
                cliente_id as "clienteId", instituicao_id as "instituicaoId", conta_id as "contaId",
                quantidade, preco_medio as "precoMedio",
                valor_atual_bruto as "valorAtualBruto", valor_atual_brl as "valorAtualBrl", moeda_original as "moedaOriginal",
                instituicao, conta, custodia, data_entrada as "dataEntrada", data_vencimento as "dataVencimento",
                origem_dado as "origemDado", importado_em as "importadoEm",
                atualizado_em as "atualizadoEm"
    `;
    const result = await this.pool.query(query, [
      input.carteiraId,
      input.ativoId,
      input.clienteId,
      input.instituicaoId,
      input.contaId,
      input.quantidade,
      input.precoMedio,
      input.valorAtualBruto,
      input.valorAtualBrl,
      input.moedaOriginal,
      input.instituicao,
      input.conta,
      input.custodia,
      input.dataEntrada,
      input.dataVencimento,
      input.origemDado,
      input.importadoEm,
    ]);
    return result.rows[0];
  }

  async getPosicoesByCarteira(carteiraId: string): Promise<PosicaoDB[]> {
    const query = `
          SELECT id, carteira_id as "carteiraId", ativo_id as "ativoId",
            cliente_id as "clienteId", instituicao_id as "instituicaoId", conta_id as "contaId",
            quantidade, preco_medio as "precoMedio",
             valor_atual_bruto as "valorAtualBruto", valor_atual_brl as "valorAtualBrl", moeda_original as "moedaOriginal",
             instituicao, conta, custodia, data_entrada as "dataEntrada", data_vencimento as "dataVencimento",
            origem_dado as "origemDado", importado_em as "importadoEm",
             atualizado_em as "atualizadoEm"
      FROM posicoes
      WHERE carteira_id = $1
      ORDER BY atualizado_em DESC
    `;
    const result = await this.pool.query(query, [carteiraId]);
    return result.rows;
  }

  async getPosicaoById(id: string): Promise<PosicaoDB | null> {
    const query = `
          SELECT id, carteira_id as "carteiraId", ativo_id as "ativoId",
            cliente_id as "clienteId", instituicao_id as "instituicaoId", conta_id as "contaId",
            quantidade, preco_medio as "precoMedio",
             valor_atual_bruto as "valorAtualBruto", valor_atual_brl as "valorAtualBrl", moeda_original as "moedaOriginal",
             instituicao, conta, custodia, data_entrada as "dataEntrada", data_vencimento as "dataVencimento",
            origem_dado as "origemDado", importado_em as "importadoEm",
             atualizado_em as "atualizadoEm"
      FROM posicoes WHERE id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updatePosicao(id: string, input: Partial<CreatePosicaoInput>): Promise<PosicaoDB> {
    const fields: string[] = [];
    const values: unknown[] = [id];
    let paramCount = 2;

    const fieldMap: Record<string, string> = {
      clienteId: 'cliente_id',
      instituicaoId: 'instituicao_id',
      contaId: 'conta_id',
      quantidade: 'quantidade',
      precoMedio: 'preco_medio',
      valorAtualBruto: 'valor_atual_bruto',
      valorAtualBrl: 'valor_atual_brl',
      moedaOriginal: 'moeda_original',
      instituicao: 'instituicao',
      conta: 'conta',
      custodia: 'custodia',
      dataEntrada: 'data_entrada',
      dataVencimento: 'data_vencimento',
      origemDado: 'origem_dado',
      importadoEm: 'importado_em',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (key in input && input[key as keyof CreatePosicaoInput] !== undefined) {
        fields.push(`${dbField} = $${paramCount}`);
        values.push(input[key as keyof CreatePosicaoInput]);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return this.getPosicaoById(id) as Promise<PosicaoDB>;
    }

    const query = `
      UPDATE posicoes
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING id, carteira_id as "carteiraId", ativo_id as "ativoId",
                cliente_id as "clienteId", instituicao_id as "instituicaoId", conta_id as "contaId",
                quantidade, preco_medio as "precoMedio",
                valor_atual_bruto as "valorAtualBruto", valor_atual_brl as "valorAtualBrl", moeda_original as "moedaOriginal",
                instituicao, conta, custodia, data_entrada as "dataEntrada", data_vencimento as "dataVencimento",
                origem_dado as "origemDado", importado_em as "importadoEm",
                atualizado_em as "atualizadoEm"
    `;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deletePosicao(id: string): Promise<void> {
    const query = 'DELETE FROM posicoes WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  /**
   * ========== ANÁLISES ==========
   */

  async getResumoCarteira(carteiraId: string): Promise<{ totalBrl: number; posicoesCont: number }> {
    const query = `
      SELECT 
        SUM(valor_atual_brl) as total_brl,
        COUNT(*) as posicoes_cont
      FROM posicoes
      WHERE carteira_id = $1
    `;
    const result = await this.pool.query(query, [carteiraId]);
    const row = result.rows[0];
    return {
      totalBrl: parseFloat(row.total_brl) || 0,
      posicoesCont: parseInt(row.posicoes_cont) || 0,
    };
  }

  async getAlocacaoPorClasse(carteiraId: string): Promise<Record<ClasseAtivo, { totalBrl: number; percentual: number; posicoesCont: number }>> {
    const query = `
      SELECT 
        a.classe,
        SUM(p.valor_atual_brl) as total_brl,
        COUNT(p.id) as posicoes_cont
      FROM posicoes p
      JOIN ativos a ON p.ativo_id = a.id
      WHERE p.carteira_id = $1
      GROUP BY a.classe
    `;
    const result = await this.pool.query(query, [carteiraId]);

    const resumo = await this.getResumoCarteira(carteiraId);
    const totalBrl = resumo.totalBrl;

    const allocation: Record<ClasseAtivo, { totalBrl: number; percentual: number; posicoesCont: number }> = {} as Record<
      ClasseAtivo,
      { totalBrl: number; percentual: number; posicoesCont: number }
    >;
    result.rows.forEach((row: { classe: string; total_brl: string; posicoes_cont: string }) => {
      const classe = this.normalizeClasse(row.classe);
      const totalClasse = parseFloat(row.total_brl) || 0;
      allocation[classe] = {
        totalBrl: totalClasse,
        percentual: totalBrl > 0 ? (totalClasse / totalBrl) * 100 : 0,
        posicoesCont: parseInt(row.posicoes_cont) || 0,
      };
    });

    return allocation;
  }

  /**
   * ========== UTILITÁRIOS ==========
   */

  private mapRowToPosition(row: Record<string, unknown>): Position {
    const classe = this.normalizeClasse(String(row.classe || 'ALTERNATIVO'));
    const valorAtualBrl = this.toNumber(row.valorAtualBrl);
    const valorAtualBruto = this.toNumber(row.valorAtualBruto);
    const quantidade = this.toOptionalNumber(row.quantidade);
    const precoMedio = this.toOptionalNumber(row.precoMedio);
    const moeda = this.normalizeCurrency(String(row.moedaOriginal || 'BRL'));

    return {
      id: String(row.id),
      classe,
      subclasse: row.subclasse as SubclasseAtivo | undefined,
      clienteNome: this.toOptionalString(row.clienteNome),
      carteiraNome: this.toOptionalString(row.carteiraNome),
      ticker: this.toOptionalString(row.ticker),
      nome: this.toOptionalString(row.nome) || 'Sem nome',
      descricao: this.toOptionalString(row.descricao),
      instituicao: this.toOptionalString(row.instituicao),
      conta: this.toOptionalString(row.conta),
      contaApelido: this.toOptionalString(row.contaApelido),
      quantidade,
      precoMedio,
      valorAtualBruto,
      valorAtualBrl,
      moedaOriginal: moeda,
      dataVencimento: this.toOptionalString(row.dataVencimento),
      benchmark: this.toOptionalString(row.benchmark),
      assetClass: classe,
      description: this.toOptionalString(row.descricao),
      institution: this.toOptionalString(row.instituicao),
      account: this.toOptionalString(row.conta),
      quantity: quantidade,
      price: precoMedio,
      grossValue: valorAtualBruto,
      currency: moeda,
      indexer: this.toOptionalString(row.indexador),
      maturityDate: this.toOptionalString(row.dataVencimento),
    };
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toOptionalString(value: unknown): string | undefined {
    if (value === null || value === undefined) return undefined;
    const str = String(value).trim();
    return str.length > 0 ? str : undefined;
  }

  private normalizeClasse(value: string): ClasseAtivo {
    const allowed: ClasseAtivo[] = [
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
    return allowed.includes(value as ClasseAtivo) ? (value as ClasseAtivo) : 'ALTERNATIVO';
  }

  private normalizeCurrency(value: string): Currency {
    if (value === 'USD' || value === 'EUR' || value === 'BRL') return value;
    return 'BRL';
  }

  private parseAtivo(row: Record<string, unknown>): Ativo {
    return {
      id: String(row.id),
      ticker: typeof row.ticker === 'string' ? row.ticker : undefined,
      nome: String(row.nome ?? ''),
      classe: this.normalizeClasse(String(row.classe ?? 'ALTERNATIVO')),
      subclasse: row.subclasse as SubclasseAtivo | undefined,
      pais: typeof row.pais === 'string' ? row.pais : undefined,
      moeda: this.normalizeCurrency(String(row.moeda ?? 'BRL')),
      setor: typeof row.setor === 'string' ? row.setor : undefined,
      segmento: typeof row.segmento === 'string' ? row.segmento : undefined,
      benchmark: typeof row.benchmark === 'string' ? row.benchmark : undefined,
      indexador: typeof row.indexador === 'string' ? row.indexador : undefined,
      metadata:
        typeof row.metadata === 'string'
          ? (JSON.parse(row.metadata) as Record<string, unknown>)
          : (row.metadata as Record<string, unknown> | undefined),
      criadoEm: new Date(String(row.criadoEm ?? row.criado_em ?? new Date().toISOString())),
      atualizadoEm: new Date(String(row.atualizadoEm ?? row.atualizado_em ?? new Date().toISOString())),
    };
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    const fieldMapping: Record<string, string> = {
      quantidade: 'quantidade',
      quantity: 'quantidade',
      precoMedio: 'precoMedio',
      price: 'precoMedio',
      valorAtualBruto: 'valorAtualBruto',
      grossValue: 'valorAtualBruto',
      valorAtualBrl: 'valorAtualBrl',
      moedaOriginal: 'moedaOriginal',
      currency: 'moedaOriginal',
      instituicao: 'instituicao',
      institution: 'instituicao',
      conta: 'conta',
      account: 'conta',
      dataEntrada: 'dataEntrada',
      dataVencimento: 'dataVencimento',
      maturityDate: 'dataVencimento',
    };

    const mapped: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      const target = fieldMapping[key];
      if (target && value !== undefined) {
        mapped[target] = value;
      }
    }

    if (Object.keys(mapped).length > 0) {
      await this.updatePosicao(id, mapped as Partial<CreatePosicaoInput>);
    }

    const positions = await this.getAllPositions();
    const updated = positions.find((p) => p.id === id);
    if (!updated) throw new Error(`Posição não encontrada: ${id}`);
    return updated;
  }

  async deletePosition(id: string): Promise<void> {
    return this.deletePosicao(id);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Singleton para uso em API routes
let repositoryInstance: PostgresPortfolioRepository | null = null;

export function getPortfolioRepository(): PostgresPortfolioRepository {
  if (!repositoryInstance) {
    repositoryInstance = new PostgresPortfolioRepository();
  }
  return repositoryInstance;
}
