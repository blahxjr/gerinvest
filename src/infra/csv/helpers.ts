export function normalizeNumber(value: unknown): number {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  const asString = String(value).trim().replace(/\./g, '').replace(',', '.');
  const parsed = Number(asString);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeCurrency(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  
  let str = String(value).trim();
  // Remove símbolo R$, espaços e caracteres não numéricos exceto vírgula e ponto
  str = str.replace(/[R$\s]/g, '');
  
  // Detecta formato brasileiro: 1.234,56 → ponto como milhar, vírgula como decimal
  const brFormat = /^\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(str);
  if (brFormat) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    // Formato americano: 1,234.56 → vírgula como milhar, ponto como decimal
    str = str.replace(/,/g, '');
  }
  
  const parsed = parseFloat(str);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeString(value: unknown): string {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}
