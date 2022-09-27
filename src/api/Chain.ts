import { Ethereum } from './Ethereum';

export type Chain = ConnectedChain | undefined;

export interface ConnectedChain {
  readonly ethereum: Ethereum;
  readonly chainId: number;
  readonly chainName: string;
}
