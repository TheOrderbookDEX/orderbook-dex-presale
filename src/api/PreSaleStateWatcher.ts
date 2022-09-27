import { IOrderbookDEXPreSale } from '@theorderbookdex/orderbook-dex-token/dist/interfaces/IOrderbookDEXPreSale';
import { createAbortableWrapper } from './createAbortableWrapper';
import { PreSaleState } from './PreSaleState';
import { UpdateTimer } from './UpdateTimer';

export class PreSaleStateWatcher {
  private readonly preSaleContract: IOrderbookDEXPreSale;
  private readonly eventTarget: EventTarget;
  private readonly abortController: AbortController;

  constructor(updateTimer: UpdateTimer, preSaleContract: IOrderbookDEXPreSale) {
    this.preSaleContract = preSaleContract;
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
        const totalSold = await abortable(this.preSaleContract.totalSold());
        const totalPaid = await abortable(this.preSaleContract.totalPaid());
        this.eventTarget.dispatchEvent(new PreSaleStateChangeEvent({ totalSold, totalPaid }));

      } catch (error) {
        if (error !== abortSignal.reason) {
          this.eventTarget.dispatchEvent(new PreSaleStateErrorEvent(error));
        }
      }
    })();
  }

  abort() {
    this.abortController.abort();
  }

  addEventListener<K extends keyof PreSaleStateWatcherEventMap>(type: K, listener: (event: PreSaleStateWatcherEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.addEventListener(type, listener as (event: Event) => void, options);
  }

  removeEventListener<K extends keyof PreSaleStateWatcherEventMap>(type: K, listener: (event: PreSaleStateWatcherEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.removeEventListener(type, listener as (event: Event) => void, options);
  }
}

interface PreSaleStateWatcherEventMap {
  change: PreSaleStateChangeEvent;
  error: PreSaleStateErrorEvent;
}

export abstract class PreSaleStateWatcherEvent extends Event {
  protected constructor(type: keyof PreSaleStateWatcherEventMap) {
    super(type);
  }
}

export class PreSaleStateChangeEvent extends PreSaleStateWatcherEvent {
  readonly preSaleState: PreSaleState;

  constructor(preSaleState: PreSaleState) {
    super('change');
    this.preSaleState = preSaleState;
  }
}

export class PreSaleStateErrorEvent extends PreSaleStateWatcherEvent {
  readonly error: unknown;

  constructor(error: unknown) {
    super('error');
    this.error = error;
  }
}
