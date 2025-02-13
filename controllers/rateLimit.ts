import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { sleep } from '../utils/sleep';
dotenv.config();

export const rateLimit = async (req: Request, res: Response): Promise<void> => {
  try {
    const walletAddress = req.query.walletAddress as string;

    const response = await axios.get(`https://blockstream.info/api/address/${walletAddress}`);

    await sleep(500);
    const funded = response?.data?.chain_stats?.funded_txo_sum;
    const spent = response?.data.chain_stats?.spent_txo_sum;

    const balance = (funded - spent) / 1e8; // Convert from satoshis to BTC

    res.status(200).json({
      balance: balance,
    });
  } catch (error: any) {
    console.error('Unexpected Error:', error.message);
    res.status(500).json({
      error: 'An unexpected error occurred',
      details: error.message,
    });
  }
};
