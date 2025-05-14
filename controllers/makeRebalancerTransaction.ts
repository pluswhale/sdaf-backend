import axios from 'axios';
import { backendUrl } from '../config';
import { Request, Response } from 'express';

export const makeRebalancerTransaction = async (req: Request, res: Response): Promise<any> => {
  try {
    const transactionData = req.body;

    console.log('Sending transaction request with the following data:', transactionData);

    const response = await makeTransaction(transactionData);

    if (!response) {
      return res.status(404).json({ message: 'Failed to send transaction: No response from backend' });
    }

    console.log('Transaction successfully processed:', response.data);

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Error sending transaction:', error.message);

    if (error.response) {
      console.error('Error response from backend:', error.response.data);
      return res.status(error.response.status).json({
        error: 'Failed to send transaction',
        details: error.response.data,
      });
    } else {
      return res.status(500).json({ error: 'Failed to send transaction', details: error.message });
    }
  }
};

export const makeTransaction = async (transactionData: any): Promise<any> => {
  return (await axios.post(`${backendUrl()}/api/transaction`, transactionData)).data?.transactionHash?.hash;
};
