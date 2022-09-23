export interface Ethereum {
  isMetaMask?: boolean;
  request(args: { method: 'eth_chainId' }): Promise<string>;
  request(args: { method: 'eth_accounts' }): Promise<string[]>;
  request(args: { method: 'eth_requestAccounts' }): Promise<string[]>;
  on(eventName: 'chainChanged', listener: (chainId: string) => void): void;
  once(eventName: 'chainChanged', listener: (chainId: string) => void): void;
  on(eventName: 'accountsChanged', listener: (accounts: string[]) => void): void;
  once(eventName: 'accountsChanged', listener: (accounts: string[]) => void): void;
}

interface Global {
  ethereum?: Ethereum;
}

const global = globalThis as Global;

export function getEthereum(): Ethereum {
  if (!global.ethereum) {
    throw new NoEthereumProvider();
  }
  return global.ethereum;
}

export class NoEthereumProvider extends Error {
  constructor() {
    super('No Ethereum Provider');
    this.name = 'NoEthereumProvider';
  }
}

export interface ProviderRpcError {
  code: number;
}

export const USER_REJECTED_REQUEST = 4001;

export function isProviderRpcError(error: unknown): error is ProviderRpcError {
  return error instanceof Object
    && 'code' in error
    && typeof (error as ProviderRpcError).code == 'number';
}
