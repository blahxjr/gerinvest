/**
 * Serviços de Análise de Carteira
 * 
 * Cada serviço é independente de UI e oferece:
 * - Tipos de entrada bem definidos (Position[])
 * - Resultados tipados com métricas específicas
 * - Recomendações acionáveis
 * 
 * Alinhado com docs/ai/07-diversification-strategy.md
 */

export { analyzeDiversification, type DiversificationResult, type ConcentrationMetrics, type CurrencyExposure, type Alert } from './diversificationService';

export { analyzeFiis, type FiiAnalysisResult, type FiiRecommendation } from './fiiAnalysisService';

export { analyzeCrypto, type CryptoAnalysisResult, type CryptoRecommendation } from './cryptoAnalysisService';

export { analyzeFixedIncome, type FixedIncomeAnalysisResult, type FixedIncomeRecommendation } from './fixedIncomeService';

export { analyzeFunds, type FundAnalysisResult, type FundRecommendation } from './fundAnalysisService';
