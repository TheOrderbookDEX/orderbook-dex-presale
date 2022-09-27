import { IOrderbookDEXPreSale } from '@theorderbookdex/orderbook-dex-token/dist/interfaces/IOrderbookDEXPreSale';
import { createAbortableWrapper } from './createAbortableWrapper';
import { PreSaleAccount } from './PreSaleAccount';
import { UpdateTimer } from './UpdateTimer';
import { ConnectedWallet } from './Wallet';

export class PreSaleAccountWatcher {
  private readonly preSaleContract: IOrderbookDEXPreSale;
  private readonly wallet: ConnectedWallet;
  private readonly eventTarget: EventTarget;
  private readonly abortController: AbortController;

  constructor(updateTimer: UpdateTimer, preSaleContract: IOrderbookDEXPreSale, wallet: ConnectedWallet) {
    this.preSaleContract = preSaleContract;
    this.wallet = wallet;
    this.eventTarget = new EventTarget();
    this.abortController = new AbortController();
    updateTimer.addEventListener('update', () => this.update());
    setTimeout(() => this.update());
  }

  private update() {
    void (async () => {
      const abortSignal = this.abortController.signal;
      try {
        const abortable = createAbortableWrapper(abortSignal);
        const amountBought = await abortable(this.preSaleContract.amountSold(this.wallet.address));
        const amountPaid = await abortable(this.preSaleContract.amountPaid(this.wallet.address));
        this.eventTarget.dispatchEvent(new PreSaleAccountChangeEvent({ amountBought, amountPaid }));

      } catch (error) {
        if (error !== abortSignal.reason) {
          this.eventTarget.dispatchEvent(new PreSaleAccountErrorEvent(error));
        }
      }
    })();
  }

  abort() {
    this.abortController.abort();
  }

  addEventListener<K extends keyof PreSaleAccountWatcherEventMap>(type: K, listener: (event: PreSaleAccountWatcherEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.addEventListener(type, listener as (event: Event) => void, options);
  }

  removeEventListener<K extends keyof PreSaleAccountWatcherEventMap>(type: K, listener: (event: PreSaleAccountWatcherEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.removeEventListener(type, listener as (event: Event) => void, options);
  }
}

interface PreSaleAccountWatcherEventMap {
  change: PreSaleAccountChangeEvent;
  error: PreSaleAccountErrorEvent;
}

export abstract class PreSaleAccountWatcherEvent extends Event {
  protected constructor(type: keyof PreSaleAccountWatcherEventMap) {
    super(type);
  }
}

export class PreSaleAccountChangeEvent extends PreSaleAccountWatcherEvent {
  readonly preSaleAccount: PreSaleAccount;

  constructor(preSaleAccount: PreSaleAccount) {
    super('change');
    this.preSaleAccount = preSaleAccount;
  }
}

export class PreSaleAccountErrorEvent extends PreSaleAccountWatcherEvent {
  readonly error: unknown;

  constructor(error: unknown) {
    super('error');
    this.error = error;
  }
}
