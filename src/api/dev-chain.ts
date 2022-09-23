import { getAccounts, getBalance, hexstring } from '@theorderbookdex/abi2ts-lib';

export async function getDevChainFunds(abortSignal: AbortSignal) {
  const [address] = await getAccounts();
  abortSignal.throwIfAborted();

  const balance = await getBalance(address);
  abortSignal.throwIfAborted();

  if (!balance) {
    await fetch('http://localhost:8545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'evm_setAccountBalance',
        params: [ address, hexstring(1000000000000000000000000n) ],
      }),
    });
    abortSignal.throwIfAborted();
  }
}
