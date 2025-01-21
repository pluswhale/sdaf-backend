import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../db/AppDataSource';
import { HedgingEngine } from '../db/entities/HedgingEngine';
dotenv.config();

const hedgingEngineRepo = AppDataSource.getRepository(HedgingEngine);

export const createHeadgingWallet: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { walletAddress, txId, fromCoin, toCoin, amount } = req.body;

    if (!walletAddress || !txId || !fromCoin || !toCoin || !amount) {
      throw new Error('Required parameters missing.');
    }

    const newWallet = new HedgingEngine();
    newWallet.walletAddress = walletAddress;
    newWallet.transactionHash = txId;
    newWallet.confirmations = 0;
    newWallet.fromCoin = fromCoin;
    newWallet.toCoin = toCoin;
    newWallet.amount = amount;

    await hedgingEngineRepo.save(newWallet);

    console.log(
      `New hedging wallet added: ${walletAddress}, txId: ${txId}, from ${fromCoin} to ${toCoin}, amount: ${amount}`,
    );

    res
      .status(200)
      .json({
        message: 'Wallet created successfully',
        walletAddress,
        txId,
        confirmations: 0,
        fromCoin,
        toCoin,
        amount,
      });
  } catch (error: any) {
    console.error('Error while creating hedging wallet:', error);
    if (!res.headersSent) {
      console.log('Sending error response');
      res.status(500).json({ error: 'Unable to create hedging wallet.' });
      return;
    }
    next(error);
  }
};

