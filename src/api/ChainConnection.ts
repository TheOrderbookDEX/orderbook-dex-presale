import { createAbortableWrapper } from './createAbortableWrapper';
import { Chain } from './Chain';
import { chainNames } from './chainNames';
import { Ethereum } from './Ethereum';

export class ChainConnection {
  private readonly ethereum: Ethereum;
  private readonly eventTarget: EventTarget;
  private abortController: AbortController;

  constructor(ethereum: Ethereum) {
    this.ethereum = ethereum;
    this.eventTarget = new EventTarget();
    this.abortController = new AbortController();
    ethereum.on('chainChanged', () => {
      this.abortController.abort();
      this.eventTarget.dispatchEvent(new ChainChangeEvent(undefined));
      this.abortController = new AbortController();
      this.connect();
    });
    setTimeout(() => this.connect(), 0);
  }

  private connect() {
    void (async () => {
      const abortSignal = this.abortController.signal;
      try {
        const abortable = createAbortableWrapper(abortSignal);
        const { ethereum } = this;
        const chainId = Number(await abortable(this.ethereum.request({ method: 'eth_chainId' })));
        const chainName = chainNames.get(chainId) ?? `Chain #${chainId}`;
        this.eventTarget.dispatchEvent(new ChainChangeEvent({ ethereum, chainId, chainName }));

      } catch (error) {
        if (error !== abortSignal.reason) {
          this.eventTarget.dispatchEvent(new ChainErrorEvent(error));
        }
      }
    })();
  }

  abort() {
    this.abortController.abort();
  }

  addEventListener<K extends keyof ChainConnectionEventMap>(type: K, listener: (event: ChainConnectionEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.addEventListener(type, listener as (event: Event) => void, options);
  }

  removeEventListener<K extends keyof ChainConnectionEventMap>(type: K, listener: (event: ChainConnectionEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.removeEventListener(type, listener as (event: Event) => void, options);
  }
}

interface ChainConnectionEventMap {
  change: ChainChangeEvent;
  error: ChainErrorEvent;
}

export abstract class ChainConnectionEvent extends Event {
  protected constructor(type: keyof ChainConnectionEventMap) {
    super(type);
  }
}

export class ChainChangeEvent extends ChainConnectionEvent {
  readonly chain: Chain;

  constructor(chain: Chain) {
    super('change');
    this.chain = chain;
  }
}

export class ChainErrorEvent extends ChainConnectionEvent {
  readonly error: unknown;

  constructor(error: unknown) {
    super('error');
    this.error = error;
  }
}
