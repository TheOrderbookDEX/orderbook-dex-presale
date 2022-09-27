import { IOrderbookDEXPreSale } from '@theorderbookdex/orderbook-dex-token/dist/interfaces/IOrderbookDEXPreSale';
import { IOrderbookDEXToken } from '@theorderbookdex/orderbook-dex-token/dist/interfaces/IOrderbookDEXToken';
import { ConnectedWallet } from './Wallet';
import { createAbortableWrapper } from './createAbortableWrapper';
import { UpdateTimer } from './UpdateTimer';
import { PreSaleStateWatcher } from './PreSaleStateWatcher';
import { PreSaleAccountWatcher } from './PreSaleAccountWatcher';
import { TransactionSender } from './TransactionSender';

interface PreSaleImplementationProps {
  readonly preSaleContract: IOrderbookDEXPreSale;
  readonly tokenContract: IOrderbookDEXToken;
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
}

export class PreSale {
  protected readonly preSaleContract: IOrderbookDEXPreSale;

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

  constructor({
    preSaleContract, startTime, earlyEndTime, endTime, releaseTime, vestingPeriod, earlyExchangeRate,
    exchangeRate, buyLimit, earlyLimit, successThreshold, availableAtRelease, vestedAmountPerPeriod, totalTokens
  }: PreSaleImplementationProps) {
    this.preSaleContract = preSaleContract;
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
    this.totalTokens = totalTokens;
  }

  createStateWatcher(updateTimer: UpdateTimer): PreSaleStateWatcher {
    return new PreSaleStateWatcher(updateTimer, this.preSaleContract);
  }

  createAccountWatcher(updateTimer: UpdateTimer, wallet: ConnectedWallet): PreSaleAccountWatcher {
    return new PreSaleAccountWatcher(updateTimer, this.preSaleContract, wallet);
  }

  buy(wallet: ConnectedWallet, value: bigint): TransactionSender {
    return new TransactionSender(async (abortSignal: AbortSignal) => {
      const abortable = createAbortableWrapper(abortSignal);
      await abortable(this.preSaleContract.callStatic.buy({ value }));
      return await abortable(this.preSaleContract.buy({ value }));
    });
  }
}
