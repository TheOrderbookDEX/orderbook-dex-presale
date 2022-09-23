import ganache, { EthereumProvider } from 'ganache';
import levelup from 'levelup';
import memdown from 'memdown';
import { createSigner, hexstring, predictContractAddress } from '@theorderbookdex/abi2ts-lib';
import { OrderbookDEXToken } from '@theorderbookdex/orderbook-dex-token/dist/OrderbookDEXToken';
import { OrderbookDEXTeamTreasury } from '@theorderbookdex/orderbook-dex-token/dist/OrderbookDEXTeamTreasury';
import { OrderbookDEXSeed } from '@theorderbookdex/orderbook-dex-token/dist/OrderbookDEXSeed';
import { OrderbookDEXPreSale } from '@theorderbookdex/orderbook-dex-token/dist/OrderbookDEXPreSale';
import { OrderbookDEXPublicSale } from '@theorderbookdex/orderbook-dex-token/dist/OrderbookDEXPublicSale';

interface Global {
    ethereum?: EthereumProvider;
}

const global = globalThis as Global;

const now = BigInt(Date.now()) / 1000n;

const startTime             =          now +  60n;
const earlyEndTime          =    startTime + 600n;
const endTime               = earlyEndTime + 600n;
const releaseTime           =      endTime + 600n;
const vestingPeriod         =                600n;
const earlyExchangeRate     =    120000000000000000000000n;
const exchangeRate          =     60000000000000000000000n;
const buyLimit              =   1560000000000000000000000n;
const earlyLimit            = 240000000000000000000000000n;
const successThreshold      =       500000000000000000000n;
const availableAtRelease    =          200000000000000000n;
const vestedAmountPerPeriod =          133333333333333334n;

export async function startRPCServer() {
  console.log('Starting server...');
  console.log();

  const server = ganache.server({
    logging: {
      quiet: true,
    },
    database: {
      db: levelup(memdown()),
    },
    wallet: {
      accounts: [],
    },
  });
  global.ethereum = server.provider;

  const signer = await createSigner('0x0000000000000000000000000000000000000000000000000000000000000001');
  await global.ethereum.send('evm_setAccountBalance', [ signer.address, hexstring(1000000000000000000000n) ]);
  const treasury   = await predictContractAddress(signer.address, 0);
  const seed       = await predictContractAddress(signer.address, 1);
  const preSale    = await predictContractAddress(signer.address, 2);
  const publicSale = await predictContractAddress(signer.address, 3);
  const token      = await predictContractAddress(signer.address, 4);
  await signer.sendTransaction(await OrderbookDEXTeamTreasury.populateTransaction.deploy());
  await signer.sendTransaction(await OrderbookDEXSeed.populateTransaction.deploy());
  await signer.sendTransaction(await OrderbookDEXPreSale.populateTransaction.deploy(token, treasury, startTime, endTime, releaseTime, exchangeRate, availableAtRelease, vestingPeriod, vestedAmountPerPeriod, buyLimit, successThreshold, earlyExchangeRate, earlyEndTime, earlyLimit));
  await signer.sendTransaction(await OrderbookDEXPublicSale.populateTransaction.deploy());
  await signer.sendTransaction(await OrderbookDEXToken.populateTransaction.deploy(treasury, seed, preSale, publicSale));

  setInterval(async () => {
    await global.ethereum?.send('evm_mine');
  }, 10000);

  await server.listen(8545);

  console.log('Treasury address:');
  console.log(`    ${treasury}`);
  console.log('Seed address:');
  console.log(`    ${seed}`);
  console.log('Pre-sale address:');
  console.log(`    ${preSale}`);
  console.log('Public sale address:');
  console.log(`    ${publicSale}`);
  console.log('Token address:');
  console.log(`    ${token}`);
  console.log();

  console.log('RPC server listening on http://localhost:8545/');
}
