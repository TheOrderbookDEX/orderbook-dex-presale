import { createAbortableWrapper } from './createAbortableWrapper';
import { ConnectedChain } from './Chain';
import { CONNECTING_WALLET, Wallet } from './Wallet';
import { getDevChainFunds } from './getDevChainFunds';
import { isProviderRpcError, USER_REJECTED_REQUEST } from './Ethereum';

export class WalletConnection {
  private readonly chain: ConnectedChain;
  private readonly eventTarget: EventTarget;
  private abortController: AbortController;

  constructor(chain: ConnectedChain) {
    this.chain = chain;
    this.eventTarget = new EventTarget();
    this.abortController = new AbortController();
    chain.ethereum.on('accountsChanged', () => {
      this.abortController.abort();
      this.abortController = new AbortController();
      this.connect();
    });
    setTimeout(() => this.connect(), 0);
  }

  private connect(requestAccess = false) {
    void (async () => {
      const abortSignal = this.abortController.signal;
      try {
        this.eventTarget.dispatchEvent(new WalletChangeEvent(CONNECTING_WALLET));
        const abortable = createAbortableWrapper(abortSignal);
        const { chain } = this;
        const { ethereum } = chain;
        const [ address ] = await abortable(requestAccess ? ethereum.request({ method: 'eth_requestAccounts' }) : ethereum.request({ method: 'eth_accounts' }));
        if (address) {
          if (this.chain.chainId === 1337 && window.location.host === 'localhost:3000') {
            await getDevChainFunds(abortSignal);
          }
          this.eventTarget.dispatchEvent(new WalletChangeEvent({ chain, address }));

        } else {
          this.eventTarget.dispatchEvent(new WalletChangeEvent(undefined));
        }

      } catch (error) {
        if (error !== abortSignal.reason) {
          if (isProviderRpcError(error) && error.code === USER_REJECTED_REQUEST) {
            return;
          }
          this.eventTarget.dispatchEvent(new WalletChangeEvent(undefined));
          this.eventTarget.dispatchEvent(new WalletErrorEvent(error));
        }
      }
    })();
  }

  requestAccess() {
    this.abortController.abort();
    this.abortController = new AbortController();
    this.connect(true);
  }

  abort() {
    this.abortController.abort();
  }

  addEventListener<K extends keyof WalletConnectionEventMap>(type: K, listener: (event: WalletConnectionEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.addEventListener(type, listener as (event: Event) => void, options);
  }

  removeEventListener<K extends keyof WalletConnectionEventMap>(type: K, listener: (event: WalletConnectionEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.removeEventListener(type, listener as (event: Event) => void, options);
  }
}

interface WalletConnectionEventMap {
  change: WalletChangeEvent;
  error: WalletErrorEvent;
}

export abstract class WalletConnectionEvent extends Event {
  protected constructor(type: keyof WalletConnectionEventMap) {
    super(type);
  }
}

export class WalletChangeEvent extends WalletConnectionEvent {
  readonly wallet: Wallet;

  constructor(chain: Wallet) {
    super('change');
    this.wallet = chain;
  }
}

export class WalletErrorEvent extends WalletConnectionEvent {
  readonly error: unknown;

  constructor(error: unknown) {
    super('error');
    this.error = error;
  }
}

export class WalletConnectionRejected extends Error {
  constructor() {
    super('Wallet Connection Rejected');
    this.name = 'WalletConnectionRejected';
  }
}
