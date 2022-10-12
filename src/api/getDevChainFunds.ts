import { getAccounts, getBalance, hexstring } from '@frugal-wizard/abi2ts-lib';
import { createAbortableWrapper } from './createAbortableWrapper';

export async function getDevChainFunds(abortSignal: AbortSignal) {
  const abortable = createAbortableWrapper(abortSignal);

  const [address] = await abortable(getAccounts());
  const balance = await abortable(getBalance(address));

  if (!balance) {
    await abortable(fetch('http://localhost:8545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'evm_setAccountBalance',
        params: [ address, hexstring(1000000000000000000000000n) ],
      }),
    }));
  }
}
