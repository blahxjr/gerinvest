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
      INSERT INTO carteiras (nome, descricao, perfil, moeda_base)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nome, descricao, perfil, moeda_base as "moedaBase", 
                criado_em as "criadoEm", atualizado_em as "atualizadoEm"
    `;
    const result = await this.pool.query(query, [input.nome, input.descricao, input.perfil, input.moedaBase]);
    return result.rows[0];
  }

  async getAllCarteiras(): Promise<Carteira[]> {
    const query = `
      SELECT id, nome, descricao, perfil, moeda_base as "moedaBase",
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
             criado_em as "criadoEm", atualizado_em as "atualizadoEm"
      FROM carteiras WHERE id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateCarteira(id: string, input: Partial<CreateCarteiraInput>): Promise<Carteira> {
    const fields: string[] = [];
    const values: any[] = [id];
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

    if (fields.length === 0) {
      return this.getCarteiraById(id) as Promise<Carteira>;
    }

    const query = `
      UPDATE carteiras
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING id, nome, descricao, perfil, moeda_base as "moedaBase",
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
    const values: any[] = [id];
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
      where.push(`a.classe = $${values.length}`);
    }

    if (filters?.instituicao) {
      values.push(filters.instituicao);
      where.push(`p.instituicao = $${values.length}`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const query = `
      SELECT
        p.id,
        a.classe,
        a.subclasse,
        COALESCE(a.ticker, '') as ticker,
        a.nome,
        a.nome as descricao,
        p.instituicao,
        p.conta,
        p.quantidade,
        p.preco_medio as "precoMedio",
        p.valor_atual_bruto as "valorAtualBruto",
        p.valor_atual_brl as "valorAtualBrl",
        p.moeda_original as "moedaOriginal",
        a.indexador,
        p.data_vencimento as "dataVencimento",
        a.benchmark,
        a.metadata,
        p.atualizado_em as "atualizadoEm"
      FROM posicoes p
      JOIN ativos a ON a.id = p.ativo_id
      ${whereClause}
      ORDER BY p.atualizado_em DESC
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

    return {
      totalInvested,
      totalPositions: positions.length,
      uniqueTickers,
      uniqueAccounts,
      uniqueInstitutions,
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
      INSERT INTO posicoes (carteira_id, ativo_id, quantidade, preco_medio, valor_atual_bruto, valor_atual_brl, moeda_original, instituicao, conta, custodia, data_entrada, data_vencimento)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, carteira_id as "carteiraId", ativo_id as "ativoId", quantidade, preco_medio as "precoMedio",
                valor_atual_bruto as "valorAtualBruto", valor_atual_brl as "valorAtualBrl", moeda_original as "moedaOriginal",
                instituicao, conta, custodia, data_entrada as "dataEntrada", data_vencimento as "dataVencimento",
                atualizado_em as "atualizadoEm"
    `;
    const result = await this.pool.query(query, [
      input.carteiraId,
      input.ativoId,
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
    ]);
    return result.rows[0];
  }

  async getPosicoesByCarteira(carteiraId: string): Promise<PosicaoDB[]> {
    const query = `
      SELECT id, carteira_id as "carteiraId", ativo_id as "ativoId", quantidade, preco_medio as "precoMedio",
             valor_atual_bruto as "valorAtualBruto", valor_atual_brl as "valorAtualBrl", moeda_original as "moedaOriginal",
             instituicao, conta, custodia, data_entrada as "dataEntrada", data_vencimento as "dataVencimento",
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
      SELECT id, carteira_id as "carteiraId", ativo_id as "ativoId", quantidade, preco_medio as "precoMedio",
             valor_atual_bruto as "valorAtualBruto", valor_atual_brl as "valorAtualBrl", moeda_original as "moedaOriginal",
             instituicao, conta, custodia, data_entrada as "dataEntrada", data_vencimento as "dataVencimento",
             atualizado_em as "atualizadoEm"
      FROM posicoes WHERE id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updatePosicao(id: string, input: Partial<CreatePosicaoInput>): Promise<PosicaoDB> {
    const fields: string[] = [];
    const values: any[] = [id];
    let paramCount = 2;

    const fieldMap: Record<string, string> = {
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
      RETURNING id, carteira_id as "carteiraId", ativo_id as "ativoId", quantidade, preco_medio as "precoMedio",
                valor_atual_bruto as "valorAtualBruto", valor_atual_brl as "valorAtualBrl", moeda_original as "moedaOriginal",
                instituicao, conta, custodia, data_entrada as "dataEntrada", data_vencimento as "dataVencimento",
                atualizado_em as "atualizadoEm"
      WHERE id = $1
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

    const allocation: Record<string, any> = {};
    result.rows.forEach((row: any) => {
      allocation[row.classe] = {
        totalBrl: parseFloat(row.total_brl) || 0,
        percentual: totalBrl > 0 ? ((parseFloat(row.total_brl) || 0) / totalBrl) * 100 : 0,
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
      ticker: this.toOptionalString(row.ticker),
      nome: this.toOptionalString(row.nome) || 'Sem nome',
      descricao: this.toOptionalString(row.descricao),
      instituicao: this.toOptionalString(row.instituicao),
      conta: this.toOptionalString(row.conta),
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

  private parseAtivo(row: any): Ativo {
    return {
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
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
