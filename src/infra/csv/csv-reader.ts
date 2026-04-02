import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function readCsv<T>(filePath: string, mapper: (row: any) => T): Promise<T[]> {
  // Se o CSV ainda não existe (nenhuma importação feita), retorna coleção vazia.
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    return [];
  }

  const content = await fs.readFile(filePath, 'utf8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map(mapper);
}
