import fs from 'fs/promises';
import path from 'path';
import { readCsv } from '../csv/csv-reader';

interface Cliente {
  id: string;
  nome: string;
  documento: string;
  email: string;
  created_at: string;
}

const DEFAULT_CLIENTES_CSV = path.join('public', 'data', 'clientes.csv');

const mapRowToCliente = (row: Record<string, any>): Cliente => {
  return {
    id: String(row.id),
    nome: String(row.nome),
    documento: String(row.documento),
    email: String(row.email),
    created_at: String(row.created_at),
  };
};

export class CsvClienteRepository {
  private readonly csvPath: string;

  constructor(csvPath?: string) {
    this.csvPath = csvPath ?? DEFAULT_CLIENTES_CSV;
  }

  async getAllClientes(): Promise<Cliente[]> {
    const result = await readCsv(this.csvPath, mapRowToCliente);
    return result.data;
  }
}