/**
 * impostoService — regras de IR brasileiro por classe de ativo (2026)
 * Fonte: RFB — sem dependência de I/O.
 */
import { ClasseAtivo } from '../domain/types';
import { TipoProvento } from '../domain/provento';

// ----------------------------------------------------------------
// Constantes legais
// ----------------------------------------------------------------

/** Isenção mensal de GCAP para ações (art. 22 Lei 8.981/95) */
const LIMITE_ISENCAO_GCAP_ACOES = 20_000;

/** Alíquota GCAP ações swing-trade */
const ALIQUOTA_GCAP_ACOES = 0.15;

/** Alíquota GCAP day-trade */
const ALIQUOTA_GCAP_DAY_TRADE = 0.20;

/** Alíquota GCAP FII (não isento) */
const ALIQUOTA_GCAP_FII = 0.20;

/** Alíquota GCAP BDR */
const ALIQUOTA_GCAP_BDR = 0.15;

/** Alíquota GCAP ETF renda variável */
const ALIQUOTA_GCAP_ETF = 0.15;

/** Alíquota JCP (IRRF) */
const ALIQUOTA_JCP = 0.15;

/** Alíquota GCAP criptoativos */
const ALIQUOTA_GCAP_CRIPTO = 0.15; // faixa base (> R$35k/mês pode ter progressividade)

interface GcapInput {
  classe: ClasseAtivo;
  valorVenda: number;
  custoAquisicao: number;
  totalVendasMes?: number; // para checar limite de isenção
  isDayTrade?: boolean;
}

export interface GcapResult {
  lucro: number;
  isento: boolean;
  motivoIsencao?: string;
  aliquota: number;
  impostoDevido: number;
}

/**
 * Calcula IR sobre ganho de capital (GCAP) por classe de ativo.
 * Retorna ganho, isenção e imposto devido.
 */
export function calcularGcap(input: GcapInput): GcapResult {
  const { classe, valorVenda, custoAquisicao, totalVendasMes = valorVenda, isDayTrade = false } = input;

  const lucro = valorVenda - custoAquisicao;

  if (lucro <= 0) {
    return { lucro, isento: true, motivoIsencao: 'Prejuízo ou empate', aliquota: 0, impostoDevido: 0 };
  }

  switch (classe) {
    case 'ACAO_BR':
    case 'ETF_BR': {
      if (isDayTrade) {
        return { lucro, isento: false, aliquota: ALIQUOTA_GCAP_DAY_TRADE, impostoDevido: lucro * ALIQUOTA_GCAP_DAY_TRADE };
      }
      if (totalVendasMes <= LIMITE_ISENCAO_GCAP_ACOES) {
        return {
          lucro,
          isento: true,
          motivoIsencao: `Vendas no mês ≤ R$${LIMITE_ISENCAO_GCAP_ACOES.toLocaleString('pt-BR')}`,
          aliquota: 0,
          impostoDevido: 0,
        };
      }
      return { lucro, isento: false, aliquota: ALIQUOTA_GCAP_ACOES, impostoDevido: lucro * ALIQUOTA_GCAP_ACOES };
    }

    case 'FII': {
      // Renda (rendimento mensal) é isenta PF. GCAP (venda de cotas) é 20%.
      return { lucro, isento: false, aliquota: ALIQUOTA_GCAP_FII, impostoDevido: lucro * ALIQUOTA_GCAP_FII };
    }

    case 'BDR': {
      return { lucro, isento: false, aliquota: ALIQUOTA_GCAP_BDR, impostoDevido: lucro * ALIQUOTA_GCAP_BDR };
    }

    case 'CRIPTO': {
      return { lucro, isento: false, aliquota: ALIQUOTA_GCAP_CRIPTO, impostoDevido: lucro * ALIQUOTA_GCAP_CRIPTO };
    }

    case 'RENDA_FIXA':
    case 'POUPANCA': {
      // Poupança e RF têm IR retido na fonte, imposto_incidente = 0 extra
      return { lucro, isento: true, motivoIsencao: 'IR retido na fonte pelo emissor', aliquota: 0, impostoDevido: 0 };
    }

    case 'PREVIDENCIA': {
      return { lucro, isento: true, motivoIsencao: 'Tributação diferida (PGBL/VGBL)', aliquota: 0, impostoDevido: 0 };
    }

    default: {
      return { lucro, isento: false, aliquota: ALIQUOTA_GCAP_ACOES, impostoDevido: lucro * ALIQUOTA_GCAP_ACOES };
    }
  }
}

/**
 * Retorna se um tipo de provento é isento de IR na fonte para PF.
 */
export function isProventoIsentoIRRF(tipo: TipoProvento, classe: ClasseAtivo): boolean {
  if (tipo === 'DIVIDENDO') return true;       // Dividendos isentos no Brasil (lei atual)
  if (tipo === 'RENDA_FII' && classe === 'FII') return true; // Renda FII isenta PF
  return false;
}

/**
 * Alíquota IRRF para JCP (sempre 15%).
 */
export function aliquotaJcp(): number {
  return ALIQUOTA_JCP;
}

/**
 * Calcula IR retido na fonte para JCP.
 */
export function calcularIrJcp(valorBruto: number): { irRetido: number; valorLiquido: number } {
  const irRetido = +(valorBruto * ALIQUOTA_JCP).toFixed(2);
  return { irRetido, valorLiquido: +(valorBruto - irRetido).toFixed(2) };
}
