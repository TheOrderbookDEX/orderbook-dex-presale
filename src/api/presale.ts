import { Chain } from './chain';
import { IOrderbookDEXPreSale } from '@theorderbookdex/orderbook-dex-token/dist/interfaces/IOrderbookDEXPreSale';
import { IOrderbookDEXToken } from '@theorderbookdex/orderbook-dex-token/dist/interfaces/IOrderbookDEXToken';
import { isProviderRpcError, USER_REJECTED_REQUEST } from './ethereum';

const UPDATE_INTERVAL = 15000;

export class PreSale {
  static async connect(chain: Chain, abortSignal: AbortSignal): Promise<PreSale> {
    if (chain.chainId === 1337 && window.location.host !== 'localhost:3000') {
      throw new InvalidChain();
    }
    const preSaleAddress = preSaleAddresses.get(chain.chainId);
    if (!preSaleAddress) {
      throw new InvalidChain();
    }
    const preSaleContract = IOrderbookDEXPreSale.at(preSaleAddress);
    const tokenContract = IOrderbookDEXToken.at(await preSaleContract.token());
    abortSignal.throwIfAborted();
    const startTime = await preSaleContract.startTime();
    abortSignal.throwIfAborted();
    const earlyEndTime = await preSaleContract.earlyEndTime();
    abortSignal.throwIfAborted();
    const endTime = await preSaleContract.endTime();
    abortSignal.throwIfAborted();
    const releaseTime = await preSaleContract.releaseTime();
    abortSignal.throwIfAborted();
    const vestingPeriod = await preSaleContract.vestingPeriod();
    abortSignal.throwIfAborted();
    const earlyExchangeRate = await preSaleContract.earlyExchangeRate();
    abortSignal.throwIfAborted();
    const exchangeRate = await preSaleContract.exchangeRate();
    abortSignal.throwIfAborted();
    const buyLimit = await preSaleContract.buyLimit();
    abortSignal.throwIfAborted();
    const earlyLimit = await preSaleContract.earlyLimit();
    abortSignal.throwIfAborted();
    const successThreshold = await preSaleContract.successThreshold();
    abortSignal.throwIfAborted();
    const availableAtRelease = await preSaleContract.availableAtRelease();
    abortSignal.throwIfAborted();
    const vestedAmountPerPeriod = await preSaleContract.vestedAmountPerPeriod();
    abortSignal.throwIfAborted();
    const totalSold = await preSaleContract.totalSold();
    abortSignal.throwIfAborted();
    const totalPaid = await preSaleContract.totalPaid();
    abortSignal.throwIfAborted();
    const totalTokens = await tokenContract.preSaleTokens();
    abortSignal.throwIfAborted();
    return new PreSale(chain, preSaleContract, tokenContract, {
      startTime, earlyEndTime, endTime, releaseTime, vestingPeriod, earlyExchangeRate,
      exchangeRate, buyLimit, earlyLimit, successThreshold, availableAtRelease,
      vestedAmountPerPeriod, totalSold, totalPaid, totalTokens
    });
  }

  readonly chain: Chain;
  readonly startTime: bigint;
  readonly earlyEndTime: bigint;
  readonly endTime: bigint;
  readonly releaseTime: bigint;
  readonly vestingPeriod: bigint;
  readonly earlyExchangeRate: bigint;
  readonly exchangeRate: bigint;
  readonly buyLimit: bigint;
  readonly earlyLimit: bigint;
  readonly successThreshold: bigint;
  readonly availableAtRelease: bigint;
  readonly vestedAmountPerPeriod: bigint;
  readonly totalTokens: bigint;

  private totalSold: bigint;
  private totalPaid: bigint;

  private readonly preSaleContract: IOrderbookDEXPreSale;
  private readonly tokenContract: IOrderbookDEXToken;
  private readonly eventTarget: EventTarget;
  private readonly disconnectController: AbortController;

  private updateController: AbortController;

  private constructor(
    chain: Chain, preSaleContract: IOrderbookDEXPreSale, tokenContract: IOrderbookDEXToken,
    {
      startTime, earlyEndTime, endTime, releaseTime, vestingPeriod, earlyExchangeRate,
      exchangeRate, buyLimit, earlyLimit, successThreshold, availableAtRelease,
      vestedAmountPerPeriod, totalSold, totalPaid, totalTokens
    }: {
      startTime: bigint;
      earlyEndTime: bigint;
      endTime: bigint;
      releaseTime: bigint;
      vestingPeriod: bigint;
      earlyExchangeRate: bigint;
      exchangeRate: bigint;
      buyLimit: bigint;
      earlyLimit: bigint;
      successThreshold: bigint;
      availableAtRelease: bigint;
      vestedAmountPerPeriod: bigint;
      totalSold: bigint;
      totalPaid: bigint;
      totalTokens: bigint;
    }
  ) {
    this.chain = chain;
    this.preSaleContract = preSaleContract;
    this.tokenContract = tokenContract;
    this.startTime = startTime;
    this.earlyEndTime = earlyEndTime;
    this.endTime = endTime;
    this.releaseTime = releaseTime;
    this.vestingPeriod = vestingPeriod;
    this.earlyExchangeRate = earlyExchangeRate;
    this.exchangeRate = exchangeRate;
    this.buyLimit = buyLimit;
    this.earlyLimit = earlyLimit;
    this.successThreshold = successThreshold;
    this.availableAtRelease = availableAtRelease;
    this.vestedAmountPerPeriod = vestedAmountPerPeriod;
    this.totalSold = totalSold;
    this.totalPaid = totalPaid;
    this.totalTokens = totalTokens;
    this.eventTarget = new EventTarget();
    this.disconnectController = new AbortController();
    this.disconnectController.signal.addEventListener('abort', () => {
      this.updateController.abort();
      this.eventTarget.dispatchEvent(new PreSaleDisconnectEvent());
    });
    const updateTimeout = setTimeout(() => this.update(), UPDATE_INTERVAL);
    this.updateController = new AbortController();
    this.updateController.signal.addEventListener('abort', () => {
      clearTimeout(updateTimeout);
    });
  }

  getState(): PreSaleState {
    const { totalSold, totalPaid } = this;
    return { totalSold, totalPaid };
  }

  update() {
    void (async () => {
      this.updateController.abort();
      this.updateController = new AbortController();
      const abortSignal = this.updateController.signal;
      try {
        const totalSold = await this.preSaleContract.totalSold();
        abortSignal.throwIfAborted();
        const totalPaid = await this.preSaleContract.totalPaid();
        abortSignal.throwIfAborted();
        if (this.totalSold !== totalSold || this.totalPaid !== totalPaid) {
          this.totalSold = totalSold;
          this.totalPaid = totalPaid;
          this.eventTarget.dispatchEvent(new PreSaleUpdateEvent());
        }
      } catch (error) {
        if (error === abortSignal.reason) return;
        console.error(error);
        const updateTimeout = setTimeout(() => this.update(), UPDATE_INTERVAL);
        abortSignal.addEventListener('abort', () => {
          clearTimeout(updateTimeout);
        });
      }
    })();
  }

  async buy(value: bigint, abortSignal: AbortSignal) {
    await this.preSaleContract.callStatic.buy({ value });
    abortSignal.throwIfAborted();
    try {
      await this.preSaleContract.buy({ value });
      abortSignal.throwIfAborted();
    } catch (error) {
      if (isProviderRpcError(error)) {
        if (error.code === USER_REJECTED_REQUEST) {
          return;
        }
      }
    }
    this.update();
  }

  get connected(): boolean {
    return !this.disconnectController.signal.aborted;
  }

  disconnect() {
    this.disconnectController.abort();
  }

  addEventListener(type: 'disconnect', listener: (event: PreSaleDisconnectEvent) => void, options?: AddEventListenerOptions): void;
  addEventListener(type: 'update', listener: (event: PreSaleUpdateEvent) => void, options?: AddEventListenerOptions): void;
  addEventListener(type: PreSaleEventType, listener: (event: PreSaleEvent) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.addEventListener(type, listener, options);
  }

  removeEventListener(type: 'disconnect', listener: (event: PreSaleDisconnectEvent) => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: 'update', listener: (event: PreSaleUpdateEvent) => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: PreSaleEventType, listener: (event: PreSaleEvent) => void, options?: AddEventListenerOptions): void {
    this.eventTarget.removeEventListener(type, listener, options);
  }
}

export interface PreSaleState {
  readonly totalSold: bigint;
  readonly totalPaid: bigint;
}

export type PreSaleEventType = 'disconnect' | 'update';

export class PreSaleEvent extends Event {
  protected constructor(type: PreSaleEventType) {
    super(type);
  }
}

export class PreSaleDisconnectEvent extends PreSaleEvent {
  constructor() {
    super('disconnect');
  }
}

export class PreSaleUpdateEvent extends PreSaleEvent {
  constructor() {
    super('update');
  }
}

export class InvalidChain extends Error {
  constructor() {
    super('Invalid Chain');
    this.name = 'InvalidChain';
  }
}

const preSaleAddresses = new Map<number, string>();
preSaleAddresses.set(1337, '0xDe09E74d4888Bc4e65F589e8c13Bce9F71DdF4c7');
