import { Transaction } from '@theorderbookdex/abi2ts-lib';
import { isProviderRpcError, USER_REJECTED_REQUEST } from './Ethereum';

interface TransactionCallback {
  (abortSignal: AbortSignal): Promise<Transaction>;
}

export class TransactionSender {
  private readonly callback: TransactionCallback;
  private readonly eventTarget: EventTarget;
  private readonly abortController: AbortController;

  constructor(callback: TransactionCallback) {
    this.callback = callback;
    this.eventTarget = new EventTarget();
    this.abortController = new AbortController();
    setTimeout(() => this.send(), 0);
  }

  private send() {
    void (async () => {
      const abortSignal = this.abortController.signal;
      try {
        await this.callback(abortSignal);
        this.eventTarget.dispatchEvent(new TransactionSuccessEvent());

      } catch (error) {
        if (error !== abortSignal.reason) {
          if (isProviderRpcError(error) && error.code === USER_REJECTED_REQUEST) {
            this.eventTarget.dispatchEvent(new TransactionRejectEvent());
          } else {
            this.eventTarget.dispatchEvent(new TransactionErrorEvent(error));
          }
        }
      }
    })();
  }

  abort() {
    this.abortController.abort();
  }

  addEventListener<K extends keyof TransactionSenderEventMap>(type: K, listener: (event: TransactionSenderEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.addEventListener(type, listener as (event: Event) => void, options);
  }

  removeEventListener<K extends keyof TransactionSenderEventMap>(type: K, listener: (event: TransactionSenderEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.removeEventListener(type, listener as (event: Event) => void, options);
  }
}

interface TransactionSenderEventMap {
  success: TransactionSuccessEvent;
  reject: TransactionSuccessEvent;
  error: TransactionErrorEvent;
}

export abstract class TransactionSenderEvent extends Event {
  protected constructor(type: keyof TransactionSenderEventMap) {
    super(type);
  }
}

export class TransactionSuccessEvent extends TransactionSenderEvent {
  constructor() {
    super('success');
  }
}

export class TransactionRejectEvent extends TransactionSenderEvent {
  constructor() {
    super('reject');
  }
}

export class TransactionErrorEvent extends TransactionSenderEvent {
  readonly error: unknown;

  constructor(error: unknown) {
    super('error');
    this.error = error;
  }
}
