import axios from 'axios';

export type LiveQuote = {
  ticker: string;
  price: number;
  change: number;
};

type BrapiResultItem = {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  price?: number;
  change?: number;
  changePercent?: number;
};

type BrapiQuoteResponse = {
  results?: BrapiResultItem[];
};

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export async function getCotacao(ticker: string): Promise<LiveQuote | null> {
  const normalized = normalizeTicker(ticker);
  if (!normalized) return null;

  const { data } = await axios.get<BrapiQuoteResponse>(
    `https://brapi.dev/api/quote/${encodeURIComponent(normalized)}?range=1d`,
    { timeout: 5000 },
  );

  const row = data.results?.[0];
  if (!row) return null;

  return {
    ticker: normalizeTicker(row.symbol ?? normalized),
    price: toNumber(row.regularMarketPrice ?? row.price),
    change: toNumber(row.regularMarketChange ?? row.change),
  };
}

export async function getCotacoes(tickers: string[]): Promise<Record<string, LiveQuote>> {
  const unique = Array.from(new Set(tickers.map(normalizeTicker).filter(Boolean)));
  if (unique.length === 0) return {};

  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 15) {
    chunks.push(unique.slice(i, i + 15));
  }

  const output: Record<string, LiveQuote> = {};

  for (const chunk of chunks) {
    try {
      const { data } = await axios.get<BrapiQuoteResponse>(
        `https://brapi.dev/api/quote/${encodeURIComponent(chunk.join(','))}?range=1d`,
        { timeout: 6000 },
      );

      for (const row of data.results ?? []) {
        const symbol = normalizeTicker(row.symbol ?? '');
        if (!symbol) continue;
        output[symbol] = {
          ticker: symbol,
          price: toNumber(row.regularMarketPrice ?? row.price),
          change: toNumber(row.regularMarketChange ?? row.change),
        };
      }
    } catch {
      // Keep the dashboard resilient even if a quote batch fails.
      continue;
    }
  }

  return output;
}
