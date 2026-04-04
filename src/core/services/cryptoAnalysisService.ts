import { Position } from '../domain/position';

/**
 * Resultado da análise de Criptomoedas
 * Alinhado com docs/ai/07-diversification-strategy.md - seção Criptomoedas
 */
export interface CryptoAnalysisResult {
  totalValue: number;
  numberOfCryptos: number;
  allocationBySubclass: Record<string, { value: number; percentage: number; positionCount: number }>;
  allocationByAsset: Record<string, { value: number; percentage: number }>;
  btcEthConcentration: {
    btcValue: number;
    btcPercentage: number;
    ethValue: number;
    ethPercentage: number;
    totalConcentration: number;
  };
  custodyDistribution: {
    exchange: { value: number; percentage: number };
    selfCustody: { value: number; percentage: number };
    unknown: { value: number; percentage: number };
  };
  diversificationScore: number;
  recommendations: CryptoRecommendation[];
}

export interface CryptoRecommendation {
  type: 'REDUCE_BTC_ETH' | 'DIVERSIFY_TOKENS' | 'IMPROVE_CUSTODY' | 'BALANCE_LAYERS';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

/**
 * Analisar portfólio de criptomoedas
 */
export function analyzeCrypto(positions: Position[]): CryptoAnalysisResult {
  // Filtrar apenas criptos
  const cryptos = positions.filter(
    (p) => p.classe === 'CRIPTO' || String(p.assetClass ?? '').toUpperCase() === 'CRYPTO',
  );

  if (cryptos.length === 0) {
    return {
      totalValue: 0,
      numberOfCryptos: 0,
      allocationBySubclass: {},
      allocationByAsset: {},
      btcEthConcentration: { btcValue: 0, btcPercentage: 0, ethValue: 0, ethPercentage: 0, totalConcentration: 0 },
      custodyDistribution: { exchange: { value: 0, percentage: 0 }, selfCustody: { value: 0, percentage: 0 }, unknown: { value: 0, percentage: 0 } },
      diversificationScore: 0,
      recommendations: [],
    };
  }

  const totalValue = cryptos.reduce((sum, p) => sum + (p.valorAtualBrl || p.grossValue || 0), 0);

  // 1. Alocação por layer (BASE, INFRASTRUTURA, DEFI, ESPECULATIVO)
  const allocationBySubclass = calculateCryptoAllocationBySubclass(cryptos, totalValue);

  // 2. Alocação por ativo individual
  const allocationByAsset = calculateCryptoAllocationByAsset(cryptos, totalValue);

  // 3. Concentração BTC/ETH
  const btcEthConcentration = calculateBtcEthConcentration(cryptos, totalValue);

  // 4. Distribuição de custódia
  const custodyDistribution = calculateCryptoCustodyDistribution(cryptos, totalValue);

  // 5. Score de diversificação
  const diversificationScore = calculateCryptoDiversificationScore(cryptos, totalValue);

  // 6. Recomendações
  const recommendations = generateCryptoRecommendations(btcEthConcentration, allocationBySubclass, custodyDistribution, cryptos.length);

  return {
    totalValue,
    numberOfCryptos: cryptos.length,
    allocationBySubclass,
    allocationByAsset,
    btcEthConcentration,
    custodyDistribution,
    diversificationScore,
    recommendations,
  };
}

/**
 * Calcular alocação por layer/subclasse
 */
function calculateCryptoAllocationBySubclass(
  cryptos: Position[],
  totalValue: number
): Record<string, { value: number; percentage: number; positionCount: number }> {
  const layers = ['CRIPTO_BASE', 'CRIPTO_INFRAESTRUTURA', 'CRIPTO_DEFI', 'CRIPTO_ESPECULATIVO'];
  const allocation: Record<string, { value: number; percentage: number; positionCount: number }> = {};

  layers.forEach((layer) => {
    allocation[layer] = { value: 0, percentage: 0, positionCount: 0 };
  });

  cryptos.forEach((crypto) => {
    const subclasse = crypto.subclasse || 'CRIPTO_BASE';
    const value = crypto.valorAtualBrl || crypto.grossValue || 0;

    if (allocation[subclasse]) {
      allocation[subclasse].value += value;
      allocation[subclasse].positionCount += 1;
    } else {
      // Fallback para camada desconhecida
      allocation['CRIPTO_BASE'].value += value;
      allocation['CRIPTO_BASE'].positionCount += 1;
    }
  });

  // Calcular percentuais
  Object.keys(allocation).forEach((layer) => {
    allocation[layer].percentage = totalValue > 0 ? (allocation[layer].value / totalValue) * 100 : 0;
  });

  return allocation;
}

/**
 * Calcular alocação por ativo (BTC, ETH, etc.)
 */
function calculateCryptoAllocationByAsset(positions: Position[], totalValue: number): Record<string, { value: number; percentage: number }> {
  const assetMap: Record<string, number> = {};

  positions.forEach((crypto) => {
    const ticker = (crypto.ticker || crypto.nome || 'UNKNOWN').toUpperCase();
    const value = crypto.valorAtualBrl || crypto.grossValue || 0;

    if (!assetMap[ticker]) {
      assetMap[ticker] = 0;
    }
    assetMap[ticker] += value;
  });

  const result: Record<string, { value: number; percentage: number }> = {};
  Object.entries(assetMap).forEach(([ticker, value]) => {
    result[ticker] = {
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    };
  });

  // Ordenar por valor decrescente
  return Object.entries(result)
    .sort(([, a], [, b]) => b.value - a.value)
    .reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {} as Record<string, { value: number; percentage: number }>);
}

/**
 * Calcular concentração BTC + ETH
 */
function calculateBtcEthConcentration(
  cryptos: Position[],
  totalValue: number
): CryptoAnalysisResult['btcEthConcentration'] {
  let btcValue = 0;
  let ethValue = 0;

  cryptos.forEach((crypto) => {
    const ticker = (crypto.ticker || '').toUpperCase();
    const value = crypto.valorAtualBrl || crypto.grossValue || 0;

    if (ticker.includes('BTC') || ticker.includes('BITCOIN')) {
      btcValue += value;
    } else if (ticker.includes('ETH') || ticker.includes('ETHEREUM')) {
      ethValue += value;
    }
  });

  const btcPercentage = totalValue > 0 ? (btcValue / totalValue) * 100 : 0;
  const ethPercentage = totalValue > 0 ? (ethValue / totalValue) * 100 : 0;

  return {
    btcValue,
    btcPercentage,
    ethValue,
    ethPercentage,
    totalConcentration: btcPercentage + ethPercentage,
  };
}

/**
 * Calcular distribuição de custódia
 */
function calculateCryptoCustodyDistribution(
  cryptos: Position[],
  totalValue: number
): CryptoAnalysisResult['custodyDistribution'] {
  let exchange = 0;
  let selfCustody = 0;
  let unknown = 0;

  cryptos.forEach((crypto) => {
    const value = crypto.valorAtualBrl || crypto.grossValue || 0;
    const custody = (crypto.custoria || crypto.issuer || '').toLowerCase();

    if (custody.includes('exchange') || custody.includes('binance') || custody.includes('kraken') || custody.includes('coinbase')) {
      exchange += value;
    } else if (
      custody.includes('wallet') ||
      custody.includes('hardware') ||
      custody.includes('ledger') ||
      custody.includes('metamask') ||
      custody.includes('self')
    ) {
      selfCustody += value;
    } else {
      unknown += value;
    }
  });

  return {
    exchange: { value: exchange, percentage: totalValue > 0 ? (exchange / totalValue) * 100 : 0 },
    selfCustody: { value: selfCustody, percentage: totalValue > 0 ? (selfCustody / totalValue) * 100 : 0 },
    unknown: { value: unknown, percentage: totalValue > 0 ? (unknown / totalValue) * 100 : 0 },
  };
}

/**
 * Calcular score de diversificação de criptos
 */
function calculateCryptoDiversificationScore(cryptos: Position[], totalValue: number): number {
  if (cryptos.length < 2) return 0;

  // Herfindahl-Hirschman Index
  let hhi = 0;
  cryptos.forEach((crypto) => {
    const value = crypto.valorAtualBrl || crypto.grossValue || 0;
    const percentage = totalValue > 0 ? value / totalValue : 0;
    hhi += percentage * percentage;
  });

  const minHhi = 1 / cryptos.length;
  const score = ((1 - hhi) / (1 - minHhi)) * 100;

  return Math.max(0, Math.min(100, score));
}

/**
 * Gerar recomendações para carteira de criptos
 */
function generateCryptoRecommendations(
  btcEth: CryptoAnalysisResult['btcEthConcentration'],
  allocation: Record<string, { value: number; percentage: number; positionCount: number }>,
  custody: CryptoAnalysisResult['custodyDistribution'],
  cryptoCount: number
): CryptoRecommendation[] {
  const recommendations: CryptoRecommendation[] = [];

  // Recomendação 1: Reduzir BTC/ETH se muito concentrado
  if (btcEth.totalConcentration > 70) {
    recommendations.push({
      type: 'REDUCE_BTC_ETH',
      message: `BTC+ETH concentram ${btcEth.totalConcentration.toFixed(1)}% do portfólio cripto. Considere diversificar.`,
      impact: 'high',
    });
  }

  // Recomendação 2: Diversificar tokens
  if (cryptoCount < 3) {
    recommendations.push({
      type: 'DIVERSIFY_TOKENS',
      message: `Apenas ${cryptoCount} cripto(s) na carteira. Recomenda-se mínimo 3-5 para diversificação.`,
      impact: 'high',
    });
  }

  // Recomendação 3: Melhorar custódia
  if (custody.unknown.percentage > (custody.exchange.percentage + custody.selfCustody.percentage) * 0.3) {
    recommendations.push({
      type: 'IMPROVE_CUSTODY',
      message: `${custody.unknown.percentage.toFixed(1)}% da custódia não classificada. Revise a informação de armazenamento.`,
      impact: 'medium',
    });
  }

  // Recomendação 4: Balancear camadas
  const layersWithValue = Object.values(allocation).filter((a) => a.value > 0).length;
  if (layersWithValue < 2) {
    recommendations.push({
      type: 'BALANCE_LAYERS',
      message: 'Diversifique entre camadas: base (BTC/ETH), infraestrutura, DeFi, especulativo.',
      impact: 'medium',
    });
  }

  return recommendations;
}
