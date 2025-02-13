import { Request, Response } from 'express';
import { fetchPrivateKey } from './fetchPrivateKey';
import { sendUSDT } from './sendUSDT';

export interface TransactionRequestDTO {
  senderAddress: string;
  recipientAddress: string;
  amount: number;
  privateKey: string;
  fee: number; // fee in Gwei for BNB or Gas for Bitcoin
  currency?: 'BTC' | 'USD';
}

export const createTransaction = async (req: Request, res: Response): Promise<any> => {
  const { pub_key, from, to, amount, currencyType } = req.body;

  if (!pub_key || !from || !to || !amount || !currencyType) {
    res.status(400).json({ message: 'Please fill required fields: PUB_KEY, FROM, TO, AMOUNT, CURRENCY TYPE' });
    return;
  }

  try {
    const privateKeyData = await fetchPrivateKey(pub_key);

    if (!privateKeyData || !privateKeyData.privateKey) {
      res.status(404).json({ message: 'Private key not found' });
      return;
    }

    const transaction: TransactionRequestDTO = {
      senderAddress: from,
      recipientAddress: to,
      fee: 0.00000001,
      amount: amount,
      currency: currencyType,
      privateKey: privateKeyData?.privateKey,
    };

    let response;
    if (currencyType === 'USDT') {
      response = await sendUSDT(transaction.privateKey, transaction.recipientAddress, transaction.amount);
    } else {
      // Можно добавить код для других типов валют, например BTC
      // response = await sendBTC(transaction.privateKey, transaction.recipientAddress, transaction.amount);
    }

    if (!response) {
      return res.status(400).json({ message: 'Transaction was unsuccessful' });
    }

    return res.status(200).json({ message: 'Transaction sent successfully', txId: response });
  } catch (error: any) {
    console.error('Error scheduling transaction:', error);
    res.status(500).json({ message: 'Failed to schedule transaction', error: error.message });
  }
};

