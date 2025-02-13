import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import { ethers } from 'ethers';

export const getTransactionConfirmations: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org/');

  const txHash = req.query.txHash as string;
  try {
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const block = await provider.getBlock('latest');
    if (!block) {
      res.status(500).json({ error: 'Unable to fetch latest block' });
      return;
    }

    if (tx.blockNumber === null || block.number === null) {
      res.status(500).json({ error: 'Transaction or block number is null' });
      return;
    }

    const confirmations = block.number - tx.blockNumber + 1;
    console.log(`Transaction has ${confirmations} confirmations`);

    res.status(200).json({ confirmations });
    return;
  } catch (error: any) {
    console.error('Error while getting confirmations:', error);
    if (!res.headersSent) {
      console.log('Sending error response');
      res.status(500).json({ error: 'Unable to retrieve confirmations.' });
      return;
    }
    next(error);
  }
};

