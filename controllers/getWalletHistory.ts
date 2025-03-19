import { Request, Response } from 'express';
import axios from 'axios';

const COVALENT_API_KEY = 'your_covalent_api_key'; // Replace with your actual key
const COVALENT_BASE_URL = 'https://api.covalenthq.com/v1';

export const getWalletBalanceHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { address } = req.params;
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Replace `1` with the correct chain ID (1 = Ethereum, 56 = BSC, 137 = Polygon)
    const response = await axios.get(`${COVALENT_BASE_URL}/1/address/${address}/balances_v2/`, {
      params: { key: COVALENT_API_KEY },
    });

    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch wallet balance history' });
  }
};
