import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

const REQUIRED_COLUMNS = ['ticker', 'assetClass', 'grossValue'];

export async function readCsv<T>(filePath: string, mapper: (row: any) => T): Promise<{ data: T[]; errors: string[] }> {
  try { await fs.access(filePath); } catch { return { data: [], errors: ['Arquivo não encontrado'] }; }
  
  const content = await fs.readFile(filePath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });
  
  if (records.length === 0) return { data: [], errors: ['CSV vazio'] };
  
  const headers = Object.keys(records[0] || {});
  const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
  if (missing.length > 0) {
    return { data: [], errors: [`Colunas obrigatórias ausentes: ${missing.join(', ')}`] };
  }
  
  const errors: string[] = [];
  const data = records.map((row: any, i: number) => {
    try { return mapper(row); }
    catch (e) { errors.push(`Linha ${i + 2}: ${String(e)}`); return null; }
  }).filter(Boolean) as T[];
  
  return { data, errors };
}
