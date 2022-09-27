import { ConnectedChain } from './Chain';

export type Wallet = ConnectedWallet | typeof CONNECTING_WALLET | undefined;

export const CONNECTING_WALLET = Symbol();

export interface ConnectedWallet {
  readonly chain: ConnectedChain;
  readonly address: string;
}
