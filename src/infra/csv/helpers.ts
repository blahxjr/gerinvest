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
  let normalized = normalizeNumber(value);
  if (normalized === 0) {
    return 0;
  }

  // Ajuste de escala para evitar distorções 
  // - valores inteiros até 6 dígitos provavelmente em centavos, convertem para reais
  // - valores extremos (ex: > 10 bilhões) são reduzidos em fator de 100 até ficarem em escala plausível
  if (Number.isInteger(normalized) && normalized >= 100) {
    if (normalized <= 1_000_000) {
      normalized = normalized / 100;
    }
  }

  while (normalized > 10_000_000_000) {
    normalized = normalized / 100;
  }

  return Number.isFinite(normalized) ? normalized : 0;
}

export function normalizeString(value: unknown): string {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}
