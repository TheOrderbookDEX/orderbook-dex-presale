import { Ethereum } from './ethereum';

export class Chain {
  static async connect(ethereum: Ethereum, abortSignal: AbortSignal): Promise<Chain> {
    const chainId = Number(await ethereum.request({ method: 'eth_chainId' }));
    abortSignal.throwIfAborted();
    return new this(ethereum, chainId);
  }

  readonly ethereum: Ethereum;
  readonly chainId: number;
  readonly chainName: string;

  private readonly eventTarget: EventTarget;
  private readonly disconnectController: AbortController;

  get connected(): boolean {
    return !this.disconnectController.signal.aborted;
  }

  private constructor(ethereum: Ethereum, chainId: number) {
    this.ethereum = ethereum;
    this.chainId = chainId;
    this.chainName = chainNames.get(chainId) ?? `Chain #${chainId}`;
    this.eventTarget = new EventTarget();
    this.disconnectController = new AbortController();
    this.disconnectController.signal.addEventListener('abort', () => {
      this.eventTarget.dispatchEvent(new ChainDisconnectEvent());
    });
    ethereum.once('chainChanged', () => this.disconnect());
  }

  disconnect() {
    this.disconnectController.abort();
  }

  addEventListener(type: 'disconnect', listener: (event: ChainDisconnectEvent) => void, options?: AddEventListenerOptions): void;
  addEventListener(type: ChainEventType, listener: (event: ChainEvent) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.addEventListener(type, listener, options);
  }

  removeEventListener(type: 'disconnect', listener: (event: ChainDisconnectEvent) => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: ChainEventType, listener: (event: ChainEvent) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.removeEventListener(type, listener, options);
  }
}

export type ChainEventType = 'disconnect';

export class ChainEvent extends Event {
  protected constructor(type: ChainEventType) {
    super(type);
  }
}

export class ChainDisconnectEvent extends ChainEvent {
  constructor() {
    super('disconnect');
  }
}

const chainNames = new Map<number, string>();
chainNames.set(   1, 'Ethereum Mainnet');
chainNames.set(   3, 'Ropsten Testnet');
chainNames.set(   4, 'Rinkeby Testnet');
chainNames.set(   5, 'Goerli Testnet');
chainNames.set(  42, 'Kovan Testnet');
chainNames.set(  56, 'BSC Mainnet');
chainNames.set(  97, 'BSC Testnet');
chainNames.set(1337, 'Development Testnet');
