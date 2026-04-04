import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Cada grupo representa alternativas equivalentes — basta um por grupo estar presente
const REQUIRED_COLUMN_GROUPS = [
  ['ticker', 'nome'],
  ['assetClass', 'classe'],
  ['grossValue', 'valorAtualBrl', 'valorAtualBruto'],
];

export async function readCsv<T>(filePath: string, mapper: (row: any) => T): Promise<{ data: T[]; errors: string[] }> {
  try { await fs.access(filePath); } catch { return { data: [], errors: ['Arquivo não encontrado'] }; }
  
  const content = await fs.readFile(filePath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });
  
  if (records.length === 0) return { data: [], errors: ['CSV vazio'] };
  
  const headers = Object.keys(records[0] || {});
  const missingGroups = REQUIRED_COLUMN_GROUPS.filter(group => !group.some(col => headers.includes(col)));
  if (missingGroups.length > 0) {
    const desc = missingGroups.map(g => g.join(' ou ')).join(', ');
    return { data: [], errors: [`Colunas obrigatórias ausentes: ${desc}`] };
  }
  
  const errors: string[] = [];
  const data = records.map((row: any, i: number) => {
    try { return mapper(row); }
    catch (e) { errors.push(`Linha ${i + 2}: ${String(e)}`); return null; }
  }).filter(Boolean) as T[];
  
  return { data, errors };
}
