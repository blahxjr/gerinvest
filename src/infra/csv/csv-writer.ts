import fs from 'fs/promises';
import path from 'path';

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function writeCsv<T>(filePath: string, rows: T[], headers?: string[]): Promise<void> {
  const computedHeaders = headers ?? (rows.length > 0 ? Object.keys(rows[0] as object) : []);

  const lines = [computedHeaders.join(',')];

  for (const row of rows) {
    const rowRecord = row as Record<string, unknown>;
    const line = computedHeaders
      .map((header) => escapeCsvValue(rowRecord[header]))
      .join(',');
    lines.push(line);
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, lines.join('\n'), 'utf8');
}
