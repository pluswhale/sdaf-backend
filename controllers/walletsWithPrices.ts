import {
  checkBalanceBNBToUSD,
  checkBalanceBTCToUSDT,
  checkBalanceETHToUSD,
  checkBalanceTRXToUSD,
  checkBalanceUSDTToUSD,
} from '../services';
import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities';
import { Request, Response } from 'express';
import { Currency } from './getBalanceOfAddress';

const walletRepository = AppDataSource.getRepository(Wallet);

type WalletProcessor = (wallet: Wallet, isMainnet: boolean) => Promise<any>;

const processBTC: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceBTCToUSDT(wallet.address, isMainnet);
  return { ...wallet, price };
};

const processUSDT_BEP20: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceUSDTToUSD(wallet.address, isMainnet, Currency.USDT_BEP20);
  return { ...wallet, price };
};

const processUSDT_ERC20: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceUSDTToUSD(wallet.address, isMainnet, Currency.USDT_ERC20);
  return { ...wallet, price };
};

const processUSDT_TRC20: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceUSDTToUSD(wallet.address, isMainnet, Currency.USDT_TRC20);
  return { ...wallet, price };
};

const processBNB: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceBNBToUSD(wallet.address, isMainnet);
  return { ...wallet, price };
};

const processTRX: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceTRXToUSD(wallet.address, isMainnet);
  return { ...wallet, price };
};

const processETH: WalletProcessor = async (wallet, isMainnet) => {
  const price = await checkBalanceETHToUSD(wallet.address, isMainnet);
  return { ...wallet, price };
};

const processDefault: WalletProcessor = async (wallet) => {
  return wallet;
};

export const walletProcessors: { [key: string]: WalletProcessor } = {
  BTC: processBTC,
  USDT_BEP20: processUSDT_BEP20,
  USDT_TRC20: processUSDT_TRC20,
  USDT_ERC20: processUSDT_ERC20,
  BNB: processBNB,
  ETH: processETH,
  TRX: processTRX,
};

export const walletsWithPrices = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ message: 'No wallets provided' });
    }

    const walletsWithPrices = [];

    for (const wallet of req.body) {
      const processor = walletProcessors[wallet.currency_type] || processDefault;

      walletsWithPrices.push(await processor(wallet, true));
    }

    res.status(200).json(walletsWithPrices);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
};
