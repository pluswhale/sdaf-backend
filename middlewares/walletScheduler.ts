import * as cron from 'node-cron';
import axios from 'axios';
import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import { getWalletMapping } from '../utils';
import { CurrencyType } from '../db/entities';
import { fetchUsdPrices } from '../controllers/getUserBalanceCeffu';
import { getCryptoPrice } from '../services/priceService';

dotenv.config();

const limiter = new Bottleneck({
  reservoir: 3,
  reservoirRefreshAmount: 3,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 1,
});

interface Wallet {
  id: string;
  wallet_type: string;
  currency_type: CurrencyType;
  wallet_name: string;
  pub_key: string;
  address: string;
  minBalance: string;
  maxBalance: string;
  price: {
    usd: string | number;
    bnb?: number;
  };
}

async function fetchAllWallets(): Promise<Wallet[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await axios.get(`https://sdafcwap.com/app/api/wallets`, { headers });
  return response.data;
}

async function initiateWithdrawal(wallet: Wallet) {
  const minBalance = parseFloat(wallet.minBalance);
  const maxBalance = parseFloat(wallet.maxBalance);

  if (isNaN(minBalance) || isNaN(maxBalance) || minBalance === 0 || maxBalance === 0) {
    console.log(`Skipping the wallet ${wallet.id}: minBalance and maxBalance incorrect.`);
    return;
  }

  let priceUsd = 0;
  if (wallet.price && typeof wallet.price.usd === 'string') {
    priceUsd = parseFloat(wallet.price.usd);
  } else if (wallet.price && typeof wallet.price.usd === 'number') {
    priceUsd = wallet.price.usd;
  } else {
    console.log(`Skipping the wallet ${wallet.id}: There is no valid field price.usd`);
    return;
  }

  if (priceUsd >= minBalance) {
    console.log(
      `Wallet ${wallet.id}: Current price ${priceUsd} USD >= minBalance ${minBalance}, no replenishment required.`,
    );
    return;
  }

  const amountToWithdraw = maxBalance - priceUsd;
  if (amountToWithdraw <= 0) {
    console.log(`Wallet ${wallet.id}: amountToWithdraw <= 0, no replenishment required.`);
    return;
  }

  const mapping = getWalletMapping(wallet.currency_type);
  if (!mapping) {
    console.error(`Unknown currency type for wallet ${wallet.id}: ${wallet.currency_type}`);
    return;
  }

  const coinIdMap: { [key in CurrencyType]: string } = {
    USDT: 'tether',
    USDT_ERC20: 'tether',
    USDT_BEP20: 'tether',
    USDT_TRC20: 'tether',
    BTC: 'bitcoin',
    BNB: 'binancecoin',
  };

  const coinId = coinIdMap[wallet.currency_type];
  if (!coinId) {
    console.error(`No coinId mapping found for currency type: ${wallet.currency_type}`);
    return;
  }

  const cryptoPrice = await getCryptoPrice(coinId);
  if (!cryptoPrice) {
    console.error(`Failed to fetch crypto price for ${coinId}, skipping wallet ${wallet.id}`);
    return;
  }

  const amountToWithdrawCrypto = amountToWithdraw / cryptoPrice;

  const precisionMap: { [key in CurrencyType]: number } = {
    USDT: 2,
    USDT_ERC20: 2,
    USDT_BEP20: 2,
    USDT_TRC20: 2,
    BTC: 8,
    BNB: 8,
  };

  const precision = precisionMap[wallet.currency_type] || 2;

  const payload = {
    amount: parseFloat(amountToWithdrawCrypto.toFixed(precision)),
    coinSymbol: mapping.coinSymbol,
    network: mapping.network,
    walletId: '276251286620667904',
    withdrawalAddress: wallet.address,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(`https://sdafcwap.com/app/api/wallet/initiate-withdrawal-ceffu`, payload, {
      headers,
    });
    console.log(`Top up your wallet ${wallet.id} initiated:`, response.data);
  } catch (error: any) {
    console.error(`Error when replenishing wallet ${wallet.id}:`, error.response?.data || error.message);
  }
}

async function checkAndInitiateWithdrawals() {
  console.log('Launching wallet check for the need for replenishment...');
  try {
    const wallets = await fetchAllWallets();
    if (!wallets || wallets.length === 0) {
      console.log('No wallets to process.');
      return;
    }

    const filteredWallets = wallets.filter((w: Wallet) => {
      return w.minBalance !== '0' && w.maxBalance !== '0' && w.price && w.price.usd;
    });

    if (filteredWallets.length === 0) {
      console.log('There are no wallets with non-zero minBalance and maxBalance.');
      return;
    }

    const walletsToUpdate = filteredWallets.filter((w: Wallet) => {
      const minBalance = parseFloat(w.minBalance);
      const priceUsd = typeof w.price.usd === 'string' ? parseFloat(w.price.usd) : w.price.usd;
      return priceUsd < minBalance;
    });

    if (walletsToUpdate.length === 0) {
      console.log('No wallets requiring replenishment.');
      return;
    }

    console.log(`Found ${walletsToUpdate.length} wallets requiring replenishment.`);

    for (const wallet of walletsToUpdate) {
      await limiter.schedule(() => initiateWithdrawal(wallet));
    }
  } catch (error) {
    console.error('Error checking wallets:', error);
  }
}

cron.schedule('* * * * *', () => {
  checkAndInitiateWithdrawals();
});

