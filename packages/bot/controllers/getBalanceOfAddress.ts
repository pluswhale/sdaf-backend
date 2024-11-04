import { check, validationResult } from 'express-validator';
import { checkBalanceBNBToUSDT, checkBalanceBTCToUSDT, checkBalanceUSDT } from '../services/getBalance';
import { Request, Response } from 'express';

export enum Currency {
  BTC = 'BTC',
  USDT_BEP20 = 'USDT_BEP20',
  USDT_ERC20 = 'USDT_ERC20',
}

export const validateGetBalance = [
  check('address').isString().withMessage('Address key must be a string'),

  check('currency').isString().withMessage('"Currency" must be a string'),
];

export const getBalanceOfAddress = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address, currency } = req.query;

  switch (currency) {
    case Currency.BTC: {
      const balance = await checkBalanceBTCToUSDT(address as string);

      return res.status(200).json({ data: balance });
    }

    case Currency.USDT_BEP20: {
      const balance = await checkBalanceUSDT(address as string);

      return res.status(200).json({ data: balance });
    }

    default: {
      console.error('Error fetching balance');
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  }
};

