import { AssetClass, Currency } from './types';

export type Position = {
  id: string;
  assetClass: AssetClass;
  ticker: string;
  description: string;
  institution: string;
  account: string;
  quantity: number;
  price: number;
  grossValue: number;
  currency: Currency;
  indexer?: string;
  maturityDate?: string;
  issuer?: string;
};
