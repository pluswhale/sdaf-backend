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
    const { walletAddress, txId } = req.body;

    if (!walletAddress || !txId) {
      throw new Error('walletAddress or txId is missing.');
    }

    const newWallet = new HedgingEngine();
    newWallet.walletAddress = walletAddress;
    newWallet.transactionHash = txId;
    newWallet.confirmations = 0;

    await hedgingEngineRepo.save(newWallet);

    console.log(`New hedging wallet added: ${walletAddress}, txId: ${txId}`);

    res.status(200).json({ message: 'Wallet created successfully', walletAddress, txId, confirmations: 0 });
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

