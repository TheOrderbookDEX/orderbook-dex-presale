import { Chain } from './chain';
import { getDevChainFunds } from './dev-chain';
import { isProviderRpcError, USER_REJECTED_REQUEST } from './ethereum';

export class Wallet {
  static async connect(chain: Chain, abortSignal: AbortSignal): Promise<Wallet> {
    try {
      const { ethereum } = chain;
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      abortSignal.throwIfAborted();
      if (!accounts.length) {
        if (ethereum.isMetaMask) {
          throw new PermissionToWalletRequired();
        } else {
          throw new WalletAddressNotFound();
        }
      }
      if (chain.chainId === 1337 && window.location.host === 'localhost:3000') {
        await getDevChainFunds(abortSignal);
      }
      return new this(chain, accounts[0]);

    } catch (error) {
      if (isProviderRpcError(error)) {
        if (error.code === USER_REJECTED_REQUEST) {
          throw new WalletConnectionRejected();
        }
      }
      throw error;
    }
  }

  static async requestAccess(chain: Chain, abortSignal: AbortSignal): Promise<Wallet> {
    try {
      const { ethereum } = chain;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      abortSignal.throwIfAborted();
      if (!accounts.length) {
        throw new WalletAddressNotFound();
      }
      if (chain.chainId === 1337 && window.location.host === 'localhost:3000') {
        await getDevChainFunds(abortSignal);
      }
      return new this(chain, accounts[0]);

    } catch (error) {
      if (isProviderRpcError(error)) {
        if (error.code === USER_REJECTED_REQUEST) {
          throw new WalletConnectionRejected();
        }
      }
      throw error;
    }
  }

  readonly chain: Chain;
  readonly address: string;

  private readonly eventTarget: EventTarget;
  private readonly disconnectController: AbortController;

  get connected(): boolean {
    return !this.disconnectController.signal.aborted;
  }

  private constructor(chain: Chain, address: string) {
    this.chain = chain;
    this.address = address;
    this.eventTarget = new EventTarget();
    this.disconnectController = new AbortController();
    this.disconnectController.signal.addEventListener('abort', () => {
      this.eventTarget.dispatchEvent(new WalletDisconnectEvent());
    });
    chain.ethereum.once('accountsChanged', () => this.disconnect());
  }

  disconnect() {
    this.disconnectController.abort();
  }

  addEventListener(type: 'disconnect', listener: (event: WalletDisconnectEvent) => void, options?: AddEventListenerOptions): void;
  addEventListener(type: WalletEventType, listener: (event: WalletEvent) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.addEventListener(type, listener, options);
  }

  removeEventListener(type: 'disconnect', listener: (event: WalletDisconnectEvent) => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: WalletEventType, listener: (event: WalletEvent) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.removeEventListener(type, listener, options);
  }
}

export type WalletEventType = 'disconnect';

export class WalletEvent extends Event {
  protected constructor(type: WalletEventType) {
    super(type);
  }
}

export class WalletDisconnectEvent extends WalletEvent {
  constructor() {
    super('disconnect');
  }
}

export class PermissionToWalletRequired extends Error {
  constructor() {
    super('Permission To Wallet Required');
    this.name = 'PermissionToWalletRequired';
  }
}

export class WalletConnectionRejected extends Error {
  constructor() {
    super('Wallet Connection Rejected');
    this.name = 'WalletConnectionRejected';
  }
}

export class WalletAddressNotFound extends Error {
  constructor() {
    super('Wallet Address Not Found');
    this.name = 'WalletAddressNotFound';
  }
}
