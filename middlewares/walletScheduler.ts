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
import { sleep } from '../utils/sleep';
import { withTimeout } from '../utils/withTimeout';

dotenv.config();

let isRunning: boolean = false;
const SCHEDULER_INTERVAL_MS = 4000;

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
  path: string;
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

  console.log('--- handleSendingWallet ---');
  console.log(`Wallet ID: ${wallet.id}`);
  console.log(`Currency: ${wallet.currency_type}`);
  console.log(`Wallet type: ${wallet.wallet_type}`);
  console.log(`MinBalance: ${wallet.minBalance}, MaxBalance: ${wallet.maxBalance}`);
  console.log('Price object:', wallet.price);

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

  const prices = await fetchUsdPrices();

  const cryptoPrice = prices[wallet.currency_type.split('_')[0]];

  const amountToWithdrawCrypto = amountToWithdraw / cryptoPrice;

  const precisionMap: Partial<Record<CurrencyType, number>> = {
    BTC: 8,
    LTC: 8,
    DOGE: 8,
    WBTC: 8,
    BNB: 8,
    POL: 8,
    ETH: 8,
    TRX: 6,
  };

  const precision = precisionMap[wallet.currency_type] || 2;

  const payload = {
    amount: parseFloat(amountToWithdrawCrypto.toFixed(precision)),
    coinSymbol: wallet.currency_type.split('_')[0],
    network: mapping.network,
    walletId: wallet.rebalancingWallet,
    withdrawalAddress: wallet.address,
  };

  try {
    const orderViewId = (await initiateBinanceWithdraw(payload, wallet.rebalancingWallet))?.data?.id;

    console.log('orderViewId', orderViewId);

    const pendingWithdrawal = pendingWithdrawalRepository.create({
      walletId: wallet.id,
      orderViewId: orderViewId,
      coinSymbol: wallet.currency_type.split('_')[0],
      accountType: wallet.rebalancingWallet,
      platform: wallet.rebalancingPlatform,
      status: 10,
    });
    await pendingWithdrawalRepository.save(pendingWithdrawal);
  } catch (error: any) {
    console.error(`Error when replenishing wallet ${wallet.id}:`, error.response?.data || error.message);

    const statusCode = getStatusCodeByPlatform(wallet.rebalancingPlatform);

    const responseStatusCode = Math.abs(Number(error.response?.data?.details?.code));

    if (statusCode.includes(responseStatusCode))
      await walletRepository.update(wallet.id, { isRebalancingActive: false });
  }
};

export const handleReceivingWallet = async (wallet: WalletType) => {
  try {
    console.log('--- handleReceivingWallet ---');
    console.log(`Wallet ID: ${wallet.id}`);
    console.log(`Currency: ${wallet.currency_type}`);
    console.log(`Wallet type: ${wallet.wallet_type}`);
    console.log(`MinBalance: ${wallet.minBalance}, MaxBalance: ${wallet.maxBalance}`);
    console.log('Price object:', wallet.price);

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

    const depositAddress = (await getBinanceDepositAddress(params, wallet.rebalancingWallet))?.data?.address;

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

      const prices = await fetchUsdPrices();

      const cryptoPrice = prices[wallet.currency_type.split('_')[0]];

      const amountToWithdrawCrypto = amountToWithdraw / cryptoPrice;

      const precisionMap: Partial<Record<CurrencyType, number>> = {
        BTC: 8,
        LTC: 8,
        DOGE: 8,
        WBTC: 8,
        BNB: 8,
        POL: 8,
        ETH: 8,
        TRX: 6,
      };

      const precision = precisionMap[wallet.currency_type] || 2;

      console.log('wallet path', wallet.path);

      const payload = {
        pub_key: wallet.pub_key,
        from: wallet.address,
        path: wallet.path,
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
        coinSymbol: wallet.currency_type.split('_')[0],
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

    const responseStatusCode = Math.abs(Number(error.response?.data?.details?.code));

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

      return w.minBalance !== '0' && w.maxBalance !== '0' && w.currency_type !== 'DOGE';
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
          console.log(
            `Initiating withdrawal for wallet ${wallet.id} ${wallet.currency_type} ${wallet.wallet_name} (sending)`,
          );
          await handleSendingWallet(wallet);
        } else {
          console.log(`Skipping wallet ${wallet.id} ${wallet.currency_type} ${wallet.wallet_name} (not sending)`);
        }
        // console.log(
        //   `Wallet ${wallet.id} ${wallet.currency_type} ${wallet.wallet_name}  requires replenishment (price < minBalance).`,
        // );
        // await handleSendingWallet(wallet); // or handleReceivingWallet depending on your workflow
      }
    }

    if (walletsToWithdraw.length === 0) {
      console.log('No wallets requiring withdrawal.');
    } else {
      console.log(`Found ${walletsToWithdraw.length} wallets requiring withdrawal.`);
      for (const wallet of walletsToWithdraw) {
        if (wallet.wallet_type === 'receiving') {
          console.log(
            `Initiating withdrawal for wallet ${wallet.id} ${wallet.currency_type} ${wallet.wallet_name} (receiving)`,
          );
          await handleReceivingWallet(wallet);
        } else {
          console.log(`Skipping wallet ${wallet.id} ${wallet.currency_type} ${wallet.wallet_name} (not receiving)`);
        }
        // console.log(
        //   `Wallet ${wallet.id} ${wallet.currency_type} ${wallet.wallet_name}  requires withdrawal (price > maxBalance).`,
        // );
        // await handleReceivingWallet(wallet); // or handleSendingWallet depending on your workflow
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

        const status = (await takeWithdrawalDetailsBinance(params, pw.accountType)).data?.[0]?.status;

        // if (response.status !== 200) {
        //   throw new Error(`Failed with status ${response.status}: ${response.statusText}`);
        // } else {
        //   await walletRepository.update(pw.walletId, { isRebalancingActive: true });
        // }

        if (status === platformConfig[pw.platform].statusCode.statusCodeWithdraw || status === 3) {
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

        const status = (await takeDepositDetailBinance(params, pr.accountType)).data?.[0]?.status;

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

async function schedulerLoop() {
  while (true) {
    if (isRunning) {
      console.warn('Scheduler still running, skipping iteration');
      await sleep(SCHEDULER_INTERVAL_MS);
      continue;
    }

    isRunning = true;

    try {
      console.log('Scheduler tick started');

      await withTimeout(updateWithdrawalStatuses(), 30_000);
      await withTimeout(checkAndInitiateWithdrawals(), 30_000);

      console.log('Scheduler tick finished');
    } catch (err) {
      console.error('Scheduler error:', err);
    } finally {
      isRunning = false;
    }

    await sleep(SCHEDULER_INTERVAL_MS);
  }
}

schedulerLoop().catch(console.error);
