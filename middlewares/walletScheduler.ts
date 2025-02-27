import axios from 'axios';
import dotenv from 'dotenv';
import { getWalletMapping } from '../utils';
import { CurrencyType, PendingReplenishment, Wallet } from '../db/entities';
import { AppDataSource } from '../db/AppDataSource';
import { PendingWithdrawal } from '../db/entities/PendingWithdrawal';
import { Not } from 'typeorm';
import { getPlatformParams, platformConfig, StatusCodeType } from './Rebalancer/config';

dotenv.config();

let isRunning = false;

const pendingWithdrawalRepository = AppDataSource.getRepository(PendingWithdrawal);
const pendingReplenishmentRepository = AppDataSource.getRepository(PendingReplenishment);
const walletRepository = AppDataSource.getRepository(Wallet);

interface WalletType {
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

async function fetchAllWallets(): Promise<WalletType[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await axios.get(`https://sdafcwap.com/app/api/wallets`, { headers });
  return response.data;
}

async function handleSendingWallet(wallet: WalletType) {
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
    BTC: 'BTC',
    BNB: 'BNB',
    ETH: 'ETH',
  };

  const coinId = coinIdMap[wallet.currency_type];
  if (!coinId) {
    console.error(`No coinId mapping found for currency type: ${wallet.currency_type}`);
    return;
  }

  const response = await axios.get(`https://sdafcwap.com/app/api/get-asset-price`);

  const { prices } = response.data;

  const cryptoPrice = prices[coinId];

  const amountToWithdrawCrypto = amountToWithdraw / cryptoPrice;

  const precisionMap: Partial<Record<CurrencyType, number>> = {
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
    walletId: wallet.rebalancingWallet,
    withdrawalAddress: wallet.address,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  console.log(payload);

  try {
    const response = await axios.post(
      `https://sdafcwap.com/app/api/initiate-withdrawal-${wallet.rebalancingPlatform}?accountType=${wallet.rebalancingWallet}`,
      payload,
      { headers },
    );

    if (response.status !== 200) {
      throw new Error(`Failed with status ${response.status}: ${response.statusText}`);
    } else {
      await walletRepository.update(wallet.id, { isRebalancingActive: true });
    }

    console.log(`Top up your wallet ${wallet.id} initiated:`, response.data);

    const orderViewId = response.data.orderViewId;
    console.log(`Extracted orderViewId: ${orderViewId}`);
    const pendingWithdrawal = pendingWithdrawalRepository.create({
      walletId: wallet.id,
      orderViewId: orderViewId,
      coinSymbol: mapping.coinSymbol,
      accountType: wallet.rebalancingWallet,
      platform: wallet.rebalancingPlatform,
      status: 10,
    });
    await pendingWithdrawalRepository.save(pendingWithdrawal);
  } catch (error: any) {
    console.error(`Error when replenishing wallet ${wallet.id}:`, error.response?.data || error.message);

    await walletRepository.update(wallet.id, { isRebalancingActive: false });
  }
}

async function handleReceivingWallet(wallet: WalletType) {
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

    console.log(params, 'PARAMS');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const response = await axios.post(
      `https://sdafcwap.com/app/api/get-deposit-address-${wallet.rebalancingPlatform}?accountType=${wallet.rebalancingWallet}`,
      params,
      { headers },
    );

    if (response.status !== 200) {
      throw new Error(`Failed with status ${response.status}: ${response.statusText}`);
    } else {
      await walletRepository.update(wallet.id, { isRebalancingActive: true });
    }

    const depositAddress = response.data?.DepositAddress;
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
        BTC: 'BTC',
        BNB: 'BNB',
        ETH: 'ETH',
      };

      const coinId = coinIdMap[wallet.currency_type];
      if (!coinId) {
        console.error(`No coinId mapping found for currency type: ${wallet.currency_type}`);
        return;
      }

      const responsePrice = await axios.get(`https://sdafcwap.com/app/api/get-asset-price`);

      const { prices } = responsePrice.data;

      const cryptoPrice = prices[coinId];

      const amountToWithdrawCrypto = amountToWithdraw / cryptoPrice;

      const precisionMap: Partial<Record<CurrencyType, number>> = {
        USDT: 2,
        USDT_ERC20: 2,
        USDT_BEP20: 2,
        USDT_TRC20: 2,
        BTC: 8,
        BNB: 8,
      };

      const precision = precisionMap[wallet.currency_type] || 2;

      const payload = {
        pub_key: wallet.pub_key,
        from: wallet.address,
        to: depositAddress,
        amount: parseFloat(amountToWithdrawCrypto.toFixed(precision)),
        currencyType: mapping.coinSymbol,
      };

      const response = await axios.post(`https://sdafcwap.com/app/api/create-transaction`, payload, {
        headers,
      });

      if (response.status !== 200) {
        throw new Error(`Failed with status ${response.status}: ${response.statusText}`);
      } else {
        await walletRepository.update(wallet.id, { isRebalancingActive: true });
      }

      const txHash = response.data.transactionHash.hash;
      console.log(`Top up your wallet ${wallet.id} initiated:`, txHash);

      const pendingReplenishment = pendingReplenishmentRepository.create({
        walletId: wallet.id,
        orderViewId: txHash,
        coinSymbol: mapping.coinSymbol,
        platform: wallet.rebalancingPlatform,
        accountType: wallet.rebalancingWallet,
        status: 10,
      });
      await pendingReplenishmentRepository.save(pendingReplenishment);
    } catch (error: any) {
      console.error(`Error when withdrawal wallet assets:`, error.response?.data || error.message);

      await walletRepository.update(wallet.id, { isRebalancingActive: false });
    }
  } catch (error: any) {
    console.error(`Error when inquering Ceffu prime wallet address:`, error.response?.data || error.message);

    await walletRepository.update(wallet.id, { isRebalancingActive: false });
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

    const pendingWithdrawals = await pendingWithdrawalRepository.find();
    const walletIdsWithPending = pendingWithdrawals.map((pw) => pw.walletId);

    const pendingReplenishments = await pendingReplenishmentRepository.find();
    const walletIdsWithPendingReplenishments = pendingReplenishments.map((pr) => pr.walletId);

    const filteredWallets = wallets.filter((w: WalletType) => {
      if (walletIdsWithPending.includes(w.id) || walletIdsWithPendingReplenishments.includes(w.id)) return false;

      return w.minBalance !== '0' && w.maxBalance !== '0' && w.price && w.price.usd;
    });

    if (filteredWallets.length === 0) {
      console.log('There are no wallets with non-zero minBalance and maxBalance all have pending withdrawals.');
      return;
    }

    const walletsToUpdate = filteredWallets.filter((w: WalletType) => {
      const minBalance = parseFloat(w.minBalance);
      const priceUsd = typeof w.price.usd === 'string' ? parseFloat(w.price.usd) : w.price.usd;
      return priceUsd < minBalance;
    });

    const walletsToWithdraw = filteredWallets.filter((w: WalletType) => {
      const maxBalance = parseFloat(w.maxBalance);
      const priceUsd = typeof w.price.usd === 'string' ? parseFloat(w.price.usd) : w.price.usd;
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
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        const response = await axios.post(
          `https://sdafcwap.com/app/api/get-withdrawal-details-${pw.platform}?accountType=${pw.accountType}`,
          {
            headers,
            params: { ...params },
          },
        );

        if (response.status !== 200) {
          throw new Error(`Failed with status ${response.status}: ${response.statusText}`);
        } else {
          await walletRepository.update(pw.walletId, { isRebalancingActive: true });
        }

        console.log('API Response:', JSON.stringify(response.data, null, 2));

        const status = response.data.withdrawalDetails[0]?.status;

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

        await walletRepository.update(pw.walletId, { isRebalancingActive: false });
      }
    }

    for (const pr of pendingReplishments) {
      try {
        const params = getPlatformParams(pr.platform, pr);
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        const response = await axios.post(
          `https://sdafcwap.com/app/api/get-deposit-detail-${pr.platform}?accountType=${pr.accountType}`,
          {
            headers,
            params: { ...params },
          },
        );

        if (response.status !== 200) {
          throw new Error(`Failed with status ${response.status}: ${response.statusText}`);
        } else {
          await walletRepository.update(pr.walletId, { isRebalancingActive: true });
        }

        console.log('API Response (Replishment):', JSON.stringify(response.data, null, 2));

        const status = response.data.depositDetails[0]?.status;

        if (status === platformConfig[pr.platform].statusCode.statusCodeDeposit) {
          await pendingReplenishmentRepository.remove(pr);
          console.log(`Replishment ${pr.orderViewId} confirmed and removed from pending.`);
        } else {
          pr.status = status;
          await pendingReplenishmentRepository.save(pr);
          console.log(`Replishment ${pr.orderViewId} updated status to ${status}.`);
        }
      } catch (error) {
        console.error(`Failed to get details for replenishment ${pr.orderViewId}:`, error);

        await walletRepository.update(pr.walletId, { isRebalancingActive: false });
      }
    }
  } catch (error) {
    console.error('Error updating statuses:', error);
  }
}

setInterval(() => {
  if (isRunning) {
    console.warn('Previous task is still running. Skipping current run.');
    return;
  }

  isRunning = true;
  (async () => {
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
  })();
}, 6000);

