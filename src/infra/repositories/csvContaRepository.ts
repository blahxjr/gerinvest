import fs from 'fs/promises';
import path from 'path';
import { readCsv } from '../csv/csv-reader';

interface Conta {
  id: string;
  nome: string;
  tipo: string;
  cliente_id: string;
  created_at: string;
}

const DEFAULT_CONTAS_CSV = path.join('public', 'data', 'contas.csv');

const mapRowToConta = (row: Record<string, unknown>): Conta => {
  return {
    id: String(row.id),
    nome: String(row.nome),
    tipo: String(row.tipo),
    cliente_id: String(row.cliente_id),
    created_at: String(row.created_at),
  };
};

export class CsvContaRepository {
  private readonly csvPath: string;

  constructor(csvPath?: string) {
    this.csvPath = csvPath ?? DEFAULT_CONTAS_CSV;
  }

  async getAllContas(): Promise<Conta[]> {
    const result = await readCsv(this.csvPath, mapRowToConta);
    return result.data;
  }
}