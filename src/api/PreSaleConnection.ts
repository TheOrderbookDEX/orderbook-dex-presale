import { ConnectedChain } from './Chain';
import { IOrderbookDEXPreSale } from '@theorderbookdex/orderbook-dex-token/dist/interfaces/IOrderbookDEXPreSale';
import { IOrderbookDEXToken } from '@theorderbookdex/orderbook-dex-token/dist/interfaces/IOrderbookDEXToken';
import { createAbortableWrapper } from './createAbortableWrapper';
import { preSaleAddresses } from './preSaleAddresses';
import { PreSale } from './PreSale';

export class PreSaleConnection {
  private readonly chain: ConnectedChain;
  private readonly eventTarget: EventTarget;
  private readonly abortController: AbortController;

  constructor(chain: ConnectedChain) {
    this.chain = chain;
    this.eventTarget = new EventTarget();
    this.abortController = new AbortController();
    setTimeout(() => this.init(), 0);
  }

  private init() {
    void (async () => {
      const abortSignal = this.abortController.signal;
      try {
        const { chain } = this;
        if (chain.chainId === 1337 && window.location.host !== 'localhost:3000') {
          throw new InvalidChain();
        }
        const preSaleAddress = preSaleAddresses.get(chain.chainId);
        if (!preSaleAddress) {
          throw new InvalidChain();
        }
        const abortable = createAbortableWrapper(abortSignal);
        const preSaleContract = IOrderbookDEXPreSale.at(preSaleAddress);
        const tokenContract = IOrderbookDEXToken.at(await abortable(preSaleContract.token()));
        const preSale = new PreSale({
          preSaleContract,
          tokenContract,
          startTime:             await abortable(preSaleContract.startTime()),
          earlyEndTime:          await abortable(preSaleContract.earlyEndTime()),
          endTime:               await abortable(preSaleContract.endTime()),
          releaseTime:           await abortable(preSaleContract.releaseTime()),
          vestingPeriod:         await abortable(preSaleContract.vestingPeriod()),
          earlyExchangeRate:     await abortable(preSaleContract.earlyExchangeRate()),
          exchangeRate:          await abortable(preSaleContract.exchangeRate()),
          buyLimit:              await abortable(preSaleContract.buyLimit()),
          earlyLimit:            await abortable(preSaleContract.earlyLimit()),
          successThreshold:      await abortable(preSaleContract.successThreshold()),
          availableAtRelease:    await abortable(preSaleContract.availableAtRelease()),
          vestedAmountPerPeriod: await abortable(preSaleContract.vestedAmountPerPeriod()),
          totalTokens:           await abortable(tokenContract.preSaleTokens()),
        });
        this.eventTarget.dispatchEvent(new PreSaleReadyEvent(preSale));

      } catch (error) {
        if (error !== abortSignal.reason) {
          this.eventTarget.dispatchEvent(new PreSaleErrorEvent(error));
        }
      }
    })();
  }

  abort() {
    this.abortController.abort();
  }

  addEventListener<K extends keyof PreSaleConnectionEventMap>(type: K, listener: (event: PreSaleConnectionEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.addEventListener(type, listener as (event: Event) => void, options);
  }

  removeEventListener<K extends keyof PreSaleConnectionEventMap>(type: K, listener: (event: PreSaleConnectionEventMap[K]) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.removeEventListener(type, listener as (event: Event) => void, options);
  }
}

interface PreSaleConnectionEventMap {
  ready: PreSaleReadyEvent;
  error: PreSaleErrorEvent;
}

export abstract class PreSaleConnectionEvent extends Event {
  protected constructor(type: keyof PreSaleConnectionEventMap) {
    super(type);
  }
}

export class PreSaleReadyEvent extends PreSaleConnectionEvent {
  readonly preSale: PreSale;

  constructor(preSale: PreSale) {
    super('ready');
    this.preSale = preSale;
  }
}

export class PreSaleErrorEvent extends PreSaleConnectionEvent {
  readonly error: unknown;

  constructor(error: unknown) {
    super('error');
    this.error = error;
  }
}

export class InvalidChain extends Error {
  constructor() {
    super('Invalid Chain');
    this.name = 'InvalidChain';
  }
}
