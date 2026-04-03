import { ClasseAtivo, SubclasseAtivo, Currency } from './types';

export type Position = {
  id: string;
  classe: ClasseAtivo;
  subclasse?: SubclasseAtivo;
  ticker?: string;
  nome: string;
  descricao?: string;
  instituicao?: string;
  conta?: string;
  custoria?: string;
  quantidade?: number;
  precoMedio?: number;
  valorAtualBruto?: number;
  valorAtualBrl: number;
  moedaOriginal: Currency;
  dataEntrada?: string;
  dataVencimento?: string;
  benchmark?: string;
  
  // Campos para compatibilidade com código antigo
  assetClass?: ClasseAtivo;
  description?: string;
  institution?: string;
  account?: string;
  quantity?: number;
  price?: number;
  grossValue?: number;
  currency?: Currency;
  indexer?: string;
  maturityDate?: string;
  issuer?: string;
};
