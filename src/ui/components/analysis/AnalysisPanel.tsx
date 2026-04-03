'use client';

import { useState } from 'react';
import {
  DiversificationResult,
  FiiAnalysisResult,
  CryptoAnalysisResult,
  FixedIncomeAnalysisResult,
  FundAnalysisResult,
} from '@/core/services';

type AnalysisResults = {
  diversification?: DiversificationResult;
  fiis?: FiiAnalysisResult;
  crypto?: CryptoAnalysisResult;
  fixedIncome?: FixedIncomeAnalysisResult;
  funds?: FundAnalysisResult;
};

interface AnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'border-red-500 bg-red-500/10 text-red-100',
  warning: 'border-amber-500 bg-amber-500/10 text-amber-100',
  info: 'border-blue-500 bg-blue-500/10 text-blue-100',
};

const SEVERITY_BADGES: Record<string, string> = {
  critical: 'bg-red-500 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-500 text-white',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatPercent = (value: number, decimals = 2) => `${value.toFixed(decimals)}%`;

export default function AnalysisPanel({ isOpen, onClose }: AnalysisPanelProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof AnalysisResults>('diversification');

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType: 'all' }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
        if (data.diversification) {
          setActiveTab('diversification');
        }
      } else {
        const errData = await res.json();
        setError(errData.error || 'Erro ao executar análises');
      }
    } catch (err) {
      setError(`Erro: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Análise da Carteira</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!results ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              {error && (
                <div className="w-full p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-100">
                  {error}
                </div>
              )}
              <button
                onClick={runAnalysis}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition disabled:opacity-50"
              >
                {loading ? 'Analisando...' : 'Executar Análises'}
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 border-b border-slate-700 pb-4 overflow-x-auto">
                {Object.keys(results).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as keyof AnalysisResults)}
                    className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                      activeTab === key
                        ? 'border-b-2 border-sky-600 text-sky-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {getTabLabel(key as keyof AnalysisResults)}
                  </button>
                ))}
              </div>

              {/* Analysis Content */}
              <div className="space-y-4">
                {activeTab === 'diversification' && results.diversification && (
                  <DiversificationPanel data={results.diversification} />
                )}
                {activeTab === 'fiis' && results.fiis && (
                  <FiisPanel data={results.fiis} />
                )}
                {activeTab === 'crypto' && results.crypto && (
                  <CryptoPanel data={results.crypto} />
                )}
                {activeTab === 'fixedIncome' && results.fixedIncome && (
                  <FixedIncomePanel data={results.fixedIncome} />
                )}
                {activeTab === 'funds' && results.funds && (
                  <FundsPanel data={results.funds} />
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-between">
          <button
            onClick={() => {
              setResults(null);
              setActiveTab('diversification');
            }}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 transition"
          >
            Nova Análise
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function getTabLabel(key: keyof AnalysisResults): string {
  const labels: Record<keyof AnalysisResults, string> = {
    diversification: 'Diversificação',
    fiis: 'FIIs',
    crypto: 'Criptomoedas',
    fixedIncome: 'Renda Fixa',
    funds: 'Fundos',
  };
  return labels[key];
}

function DiversificationPanel({ data }: { data: DiversificationResult }) {
  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-slate-400">Score de Diversificação</p>
            <p className="text-3xl font-bold text-sky-400">{data.diversificationScore.toFixed(0)}%</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-slate-400">Total da Carteira</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(data.totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Concentration */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
        <h3 className="font-semibold text-white mb-3">Concentração</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-400">Top 1</p>
            <p className="text-lg font-semibold text-white">
              {formatPercent(data.concentrationMetrics.top1Percentage)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Top 3</p>
            <p className="text-lg font-semibold text-white">
              {formatPercent(data.concentrationMetrics.top3Percentage)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Top 5</p>
            <p className="text-lg font-semibold text-white">
              {formatPercent(data.concentrationMetrics.top5Percentage)}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-white">Alertas</h3>
          {data.alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border ${SEVERITY_COLORS[alert.severity]}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    SEVERITY_BADGES[alert.severity]
                  }`}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  {alert.percentage && (
                    <p className="text-xs mt-1 opacity-75">
                      {formatPercent(alert.percentage)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FiisPanel({ data }: { data: FiiAnalysisResult }) {
  return (
    <div className="space-y-4">
      {data.numberOfFiis === 0 ? (
        <p className="text-slate-400">Nenhuma posição em FII encontrada</p>
      ) : (
        <>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-slate-400">FIIs na Carteira</p>
                <p className="text-3xl font-bold text-emerald-400">{data.numberOfFiis}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-slate-400">Total Alocado</p>
                <p className="text-2xl font-semibold text-white">{formatCurrency(data.totalValue)}</p>
              </div>
            </div>
          </div>

          {/* Maior FII */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-white mb-2">Maior Posição</h3>
            <div className="flex items-center justify-between">
              <span className="text-white">{data.concentrationMetrics.top1Fii.name}</span>
              <span className="text-slate-400">
                {formatPercent(data.concentrationMetrics.top1Fii.percentage)}
              </span>
            </div>
          </div>

          {/* Recomendações */}
          {data.recommendations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Recomendações</h3>
              {data.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-blue-500/10 border border-blue-500 text-blue-100 text-sm"
                >
                  {rec.message}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CryptoPanel({ data }: { data: CryptoAnalysisResult }) {
  return (
    <div className="space-y-4">
      {data.numberOfCryptos === 0 ? (
        <p className="text-slate-400">Nenhuma posição em criptomoedas encontrada</p>
      ) : (
        <>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-slate-400">Criptomoedas na Carteira</p>
                <p className="text-3xl font-bold text-teal-400">{data.numberOfCryptos}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-slate-400">Total Alocado</p>
                <p className="text-2xl font-semibold text-white">{formatCurrency(data.totalValue)}</p>
              </div>
            </div>
          </div>

          {/* BTC/ETH Concentration */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-white mb-3">Concentração BTC/ETH</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Bitcoin</p>
                <p className="text-lg font-semibold text-white">
                  {formatPercent(data.btcEthConcentration.btcPercentage)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Ethereum</p>
                <p className="text-lg font-semibold text-white">
                  {formatPercent(data.btcEthConcentration.ethPercentage)}
                </p>
              </div>
            </div>
          </div>

          {/* Recomendações */}
          {data.recommendations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Recomendações</h3>
              {data.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-teal-500/10 border border-teal-500 text-teal-100 text-sm"
                >
                  {rec.message}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FixedIncomePanel({ data }: { data: FixedIncomeAnalysisResult }) {
  return (
    <div className="space-y-4">
      {data.numberOfPositions === 0 ? (
        <p className="text-slate-400">Nenhuma posição em renda fixa encontrada</p>
      ) : (
        <>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-slate-400">Posições em Renda Fixa</p>
                <p className="text-3xl font-bold text-amber-400">{data.numberOfPositions}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-slate-400">Total Alocado</p>
                <p className="text-2xl font-semibold text-white">{formatCurrency(data.totalValue)}</p>
              </div>
            </div>
          </div>

          {/* Maturity Distribution */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-white mb-3">Distribuição de Vencimentos</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Até 1 ano</p>
                <p className="font-semibold text-white">
                  {formatPercent(data.maturityDistribution.upTo1year.percentage)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">1-3 anos</p>
                <p className="font-semibold text-white">
                  {formatPercent(data.maturityDistribution.from1to3years.percentage)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">3-5 anos</p>
                <p className="font-semibold text-white">
                  {formatPercent(data.maturityDistribution.from3to5years.percentage)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Acima de 5 anos</p>
                <p className="font-semibold text-white">
                  {formatPercent(data.maturityDistribution.above5years.percentage)}
                </p>
              </div>
            </div>
          </div>

          {/* FGC Coverage */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-white mb-3">Cobertura FGC</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Coberto</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {formatPercent(data.fgcCoverage.covered.percentage)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Não Coberto</p>
                <p className="text-lg font-semibold text-red-400">
                  {formatPercent(data.fgcCoverage.notCovered.percentage)}
                </p>
              </div>
            </div>
          </div>

          {/* Recomendações */}
          {data.recommendations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Recomendações</h3>
              {data.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-amber-500/10 border border-amber-500 text-amber-100 text-sm"
                >
                  {rec.message}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FundsPanel({ data }: { data: FundAnalysisResult }) {
  return (
    <div className="space-y-4">
      {data.numberOfFunds === 0 ? (
        <p className="text-slate-400">Nenhuma posição em fundos encontrada</p>
      ) : (
        <>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-slate-400">Fundos na Carteira</p>
                <p className="text-3xl font-bold text-pink-400">{data.numberOfFunds}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-slate-400">Total Alocado</p>
                <p className="text-2xl font-semibold text-white">{formatCurrency(data.totalValue)}</p>
              </div>
            </div>
          </div>

          {/* Liquidity */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-white mb-3">Perfil de Liquidez</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Diária</p>
                <p className="font-semibold text-white">
                  {formatPercent(data.liquidityProfile.daily.percentage)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Semanal</p>
                <p className="font-semibold text-white">
                  {formatPercent(data.liquidityProfile.weekly.percentage)}
                </p>
              </div>
            </div>
          </div>

          {/* Recomendações */}
          {data.recommendations.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Recomendações</h3>
              {data.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-pink-500/10 border border-pink-500 text-pink-100 text-sm"
                >
                  {rec.message}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
