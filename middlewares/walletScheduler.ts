import dotenv from 'dotenv';
import { getWalletMapping } from '../utils';
import { CurrencyType, PendingReplenishment, PendingWithdrawal, Wallet } from '../db/entities';
import { AppDataSource } from '../db/AppDataSource';
import { getPlatformParams, platformConfig } from './Rebalancer/config';
import { Repository } from 'typeorm';
import { getStatusCodeByPlatform } from '../services/rebalancer/getStatusCodeByPlatform';
import { fetchUsdPrices } from '../controllers/transactions/getAssetPrice';
import { initiateBinanceWithdraw } from '../controllers/binanceApi/initiateWithdrawalBinance';
import { getBinanceDepositAddress } from '../controllers/binanceApi/getDepositAddressBinance';
import { makeTransaction } from '../controllers/makeRebalancerTransaction';
import { takeWallets } from '../controllers';
import { takeWalletsWithPrices } from '../controllers/walletsWithPrices';
import { takeWithdrawalDetailsBinance } from '../controllers/binanceApi/getWithdrawalDetailsBinance';
import { takeDepositDetailBinance } from '../controllers/binanceApi/getDepositDetailBinance';

dotenv.config();
let isRunning: boolean = false;

export const pendingWithdrawalRepository: Repository<PendingWithdrawal> =
  AppDataSource.getRepository(PendingWithdrawal);
export const pendingReplenishmentRepository: Repository<PendingReplenishment> =
  AppDataSource.getRepository(PendingReplenishment);
export const walletRepository: Repository<Wallet> = AppDataSource.getRepository(Wallet);

export interface WalletType {
  id: string;
  wallet_type: string;
  currency_type: CurrencyType;
  wallet_name: string;
  pub_key: string;
  address: string;
  minBalance: string;
  maxBalance: string;
  rebalancingWallet: string;
  rebalancingPlatform: string;
  price: {
    usd: string | number;
    bnb?: number;
  };
}

export const handleSendingWallet = async (wallet: WalletType) => {
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

  const coinIdMap: Partial<Record<CurrencyType, string>> = {
    USDT: 'USDT',
    USDT_ERC20: 'USDT',
    USDT_BEP20: 'USDT',
    USDT_TRC20: 'USDT',
    USDC_ERC20: 'USDC',
    USDC_BEP20: 'USDC',
    BTC: 'BTC',
    BNB: 'BNB',
    ETH: 'ETH',
    TRX: 'TRX',
    WBTC: 'WBTC',
  };

  const coinId = coinIdMap[wallet.currency_type];
  if (!coinId) {
    console.error(`No coinId mapping found for currency type: ${wallet.currency_type}`);
    return;
  }

  const prices = await fetchUsdPrices();

  const cryptoPrice = prices[coinId];

  const amountToWithdrawCrypto = amountToWithdraw / cryptoPrice;

  const precisionMap: Partial<Record<CurrencyType, number>> = {
    USDT: 2,
    USDT_ERC20: 2,
    USDT_BEP20: 2,
    USDT_TRC20: 2,
    USDC_ERC20: 2,
    USDC_BEP20: 2,
    BTC: 8,
    WBTC: 8,
    BNB: 8,
    ETH: 8,
    TRX: 6,
  };

  const precision = precisionMap[wallet.currency_type] || 2;

  const [coinSymbol] = wallet.currency_type.split('_');

  const payload = {
    amount: parseFloat(amountToWithdrawCrypto.toFixed(precision)),
    coinSymbol: coinSymbol,
    network: mapping.network,
    walletId: wallet.rebalancingWallet,
    withdrawalAddress: wallet.address,
  };

  console.log(payload, 'payload');

  try {
    const orderViewId = (await initiateBinanceWithdraw(payload, wallet.rebalancingWallet)).data.id;

    console.log(`Top up your wallet ${wallet.id} initiated:`, orderViewId);

    console.log(`Extracted orderViewId: ${orderViewId}`);
    const pendingWithdrawal = pendingWithdrawalRepository.create({
      walletId: wallet.id,
      orderViewId: orderViewId,
      coinSymbol: wallet.currency_type,
      accountType: wallet.rebalancingWallet,
      platform: wallet.rebalancingPlatform,
      status: 10,
    });
    await pendingWithdrawalRepository.save(pendingWithdrawal);
  } catch (error: any) {
    console.error(`Error when replenishing wallet ${wallet.id}:`, error.response?.data || error.message);

    const statusCode = getStatusCodeByPlatform(wallet.rebalancingPlatform);

    const responseStatusCode = Math.abs(Number(error.response?.data.details.code));

    if (statusCode.includes(responseStatusCode))
      await walletRepository.update(wallet.id, { isRebalancingActive: false });
  }
};

export const handleReceivingWallet = async (wallet: WalletType) => {
  try {
    const mapping = getWalletMapping(wallet.currency_type);
    if (!mapping) {
      console.error(`Unknown currency type for wallet ${wallet.id}: ${wallet.currency_type}`);
      return;
    }

    const params = {
      walletId: wallet.rebalancingWallet,
      coinSymbol: mapping.coinSymbol,
      network: mapping.network,
    };

    const depositAddress = (await getBinanceDepositAddress(params, wallet.rebalancingWallet)).data.address;

    console.log(`Ceffu prime wallet address: ${depositAddress}`);

    try {
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

      if (priceUsd <= maxBalance) {
        console.log(
          `Wallet ${wallet.id}: Current price ${priceUsd} USD >= minBalance ${minBalance}, no replenishment required.`,
        );
        return;
      }

      const amountToWithdraw = priceUsd - minBalance;
      if (amountToWithdraw <= 0) {
        console.log(`Wallet ${wallet.id}: amountToWithdraw <= 0, no replenishment required.`);
        return;
      }

      const coinIdMap: Partial<Record<CurrencyType, string>> = {
        USDT: 'USDT',
        USDT_ERC20: 'USDT',
        USDT_BEP20: 'USDT',
        USDT_TRC20: 'USDT',
        USDC_BEP20: 'USDC',
        USDC_ERC20: 'USDC',
        BTC: 'BTC',
        BNB: 'BNB',
        ETH: 'ETH',
        TRX: 'TRX',
        WBTC: 'WBTC',
      };

      const coinId = coinIdMap[wallet.currency_type];
      if (!coinId) {
        console.error(`No coinId mapping found for currency type: ${wallet.currency_type}`);
        return;
      }

      const prices = await fetchUsdPrices();

      const cryptoPrice = prices[coinId];

      const amountToWithdrawCrypto = amountToWithdraw / cryptoPrice;

      const precisionMap: Partial<Record<CurrencyType, number>> = {
        USDT: 2,
        USDT_ERC20: 2,
        USDT_BEP20: 2,
        USDT_TRC20: 2,
        USDC_BEP20: 2,
        USDC_ERC20: 2,
        BTC: 8,
        WBTC: 8,
        BNB: 8,
        ETH: 8,
        TRX: 6,
      };

      const precision = precisionMap[wallet.currency_type] || 2;

      const payload = {
        pub_key: wallet.pub_key,
        from: wallet.address,
        to: depositAddress,
        amount: parseFloat(amountToWithdrawCrypto.toFixed(precision)),
        currencyType: wallet.currency_type,
      };

      const txHash = await makeTransaction(payload);

      // if (response.status !== 200) {
      //   throw new Error(`Failed with status ${response.status}: ${response.statusText}`);
      // } else {
      //   await walletRepository.update(wallet.id, { isRebalancingActive: true });
      // }

      console.log(`Top up your wallet ${wallet.id} initiated:`, txHash);

      const pendingReplenishment = pendingReplenishmentRepository.create({
        walletId: wallet.id,
        orderViewId: txHash,
        coinSymbol: wallet.currency_type,
        platform: wallet.rebalancingPlatform,
        accountType: wallet.rebalancingWallet,
        status: 10,
      });
      await pendingReplenishmentRepository.save(pendingReplenishment);
    } catch (error: any) {
      console.error(`Error when withdrawal wallet assets:`, error.response?.data || error.message);

      // await walletRepository.update(wallet.id, { isRebalancingActive: false });
    }
  } catch (error: any) {
    console.error(`Error when inquering Ceffu prime wallet address:`, error.response?.data || error.message);

    const statusCode = getStatusCodeByPlatform(wallet.rebalancingPlatform);

    const responseStatusCode = Math.abs(Number(error.response?.data.details.code));

    if (statusCode.includes(responseStatusCode))
      await walletRepository.update(wallet.id, { isRebalancingActive: false });
  }
};

async function checkAndInitiateWithdrawals() {
  console.log('Launching wallet check for the need for replenishment...');
  try {
    const wallets = await takeWallets();
    if (!wallets || wallets.length === 0) {
      console.log('No wallets to process.');
      return;
    }

    const pendingWithdrawals = await pendingWithdrawalRepository.find();
    const walletIdsWithPending = pendingWithdrawals.map((pw) => pw.walletId);

    const pendingReplenishments = await pendingReplenishmentRepository.find();
    const walletIdsWithPendingReplenishments = pendingReplenishments.map((pr) => pr.walletId);

    const filteredWallets = wallets.filter((w: WalletType) => {
      if (walletIdsWithPending.includes(w.id) || walletIdsWithPendingReplenishments.includes(w.id)) return false;

      return w.minBalance !== '0' && w.maxBalance !== '0';
    });

    if (filteredWallets.length === 0) {
      console.log('There are no wallets with non-zero minBalance and maxBalance all have pending withdrawals.');
      return;
    }

    const walletsWithPrices: WalletType[] = await takeWalletsWithPrices(filteredWallets);

    const walletsToUpdate = walletsWithPrices.filter((w: WalletType) => {
      const minBalance = parseFloat(w.minBalance);
      const priceUsd = typeof w?.price?.usd === 'string' ? parseFloat(w?.price?.usd) : w?.price?.usd;
      return priceUsd < minBalance;
    });

    const walletsToWithdraw = walletsWithPrices.filter((w: WalletType) => {
      const maxBalance = parseFloat(w.maxBalance);
      const priceUsd = typeof w?.price?.usd === 'string' ? parseFloat(w?.price?.usd) : w?.price?.usd;
      return priceUsd > maxBalance;
    });

    if (walletsToUpdate.length === 0) {
      console.log('No wallets requiring replenishment.');
    } else {
      console.log(`Found ${walletsToUpdate.length} wallets requiring replenishment.`);
      for (const wallet of walletsToUpdate) {
        if (wallet.wallet_type === 'sending') {
          console.log(`Initiating withdrawal for wallet ${wallet.id} (sending)`);
          await handleSendingWallet(wallet);
        } else {
          console.log(`Skipping wallet ${wallet.id} (not sending)`);
        }
      }
    }

    if (walletsToWithdraw.length === 0) {
      console.log('No wallets requiring withdrawal.');
    } else {
      console.log(`Found ${walletsToWithdraw.length} wallets requiring withdrawal.`);
      for (const wallet of walletsToWithdraw) {
        if (wallet.wallet_type === 'receiving') {
          console.log(`Initiating withdrawal for wallet ${wallet.id} (receiving)`);
          await handleReceivingWallet(wallet);
        } else {
          console.log(`Skipping wallet ${wallet.id} (not receiving)`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking wallets:', error);
  }
}

async function updateWithdrawalStatuses() {
  console.log('Updating pending withdrawal and replenishment statuses...');
  try {
    const pendingWithdrawals = await pendingWithdrawalRepository.find();
    const pendingReplishments = await pendingReplenishmentRepository.find();

    if (pendingWithdrawals.length === 0 && pendingReplishments.length === 0) {
      console.log('No pending withdrawals or replenishments found.');
      return;
    }

    for (const pw of pendingWithdrawals) {
      try {
        const params = getPlatformParams(pw.platform, pw);

        const status = await takeWithdrawalDetailsBinance(params, pw.accountType);

        console.log(status, 'statusNEW');
        // if (response.status !== 200) {
        //   throw new Error(`Failed with status ${response.status}: ${response.statusText}`);
        // } else {
        //   await walletRepository.update(pw.walletId, { isRebalancingActive: true });
        // }

        if (status === platformConfig[pw.platform].statusCode.statusCodeWithdraw) {
          await pendingWithdrawalRepository.remove(pw);
          console.log(`Withdrawal ${pw.orderViewId} confirmed and removed from pending.`);
        } else {
          pw.status = status;
          await pendingWithdrawalRepository.save(pw);
          console.log(`Withdrawal ${pw.orderViewId} updated status to ${status}.`);
        }
      } catch (error) {
        console.error(`Failed to get details for withdrawal ${pw.orderViewId}:`, error);
        //
        // await walletRepository.update(pw.walletId, { isRebalancingActive: false });
      }
    }

    for (const pr of pendingReplishments) {
      try {
        const params = getPlatformParams(pr.platform, pr);

        const status = (await takeDepositDetailBinance(params, pr.accountType)).data[0];

        console.log(status, 'statusNEW');

        // if (response.status !== 200) {
        //   throw new Error(`Failed with status ${response.status}: ${response.statusText}`);
        // } else {
        //   await walletRepository.update(pr.walletId, { isRebalancingActive: true });
        // }

        if (status === platformConfig[pr.platform].statusCode.statusCodeDeposit) {
          await pendingReplenishmentRepository.remove(pr);
          console.log(`Replenishment ${pr.orderViewId} confirmed and removed from pending.`);
        } else {
          pr.status = status;
          await pendingReplenishmentRepository.save(pr);
          console.log(`Replenishment ${pr.orderViewId} updated status to ${status}.`);
        }
      } catch (error) {
        console.error(`Failed to get details for replenishment ${pr.orderViewId}:`, error);

        // await walletRepository.update(pr.walletId, { isRebalancingActive: false });
      }
    }
  } catch (error) {
    console.error('Error updating statuses:', error);
  }
}

setInterval(async () => {
  if (isRunning) {
    console.warn('Previous task is still running. Skipping current run.');
    return;
  }

  isRunning = true;

  try {
    console.log('Starting scheduled tasks: Update Statuses and Check Initiate Withdrawals');

    await updateWithdrawalStatuses();

    await checkAndInitiateWithdrawals();

    console.log('Scheduled tasks completed successfully.');
  } catch (error) {
    console.error('Error during scheduled tasks:', error);
  } finally {
    isRunning = false;
  }
}, 3000);
