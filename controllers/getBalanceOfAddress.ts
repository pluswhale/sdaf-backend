import { check, matchedData, validationResult } from 'express-validator';
import { checkBalanceBTCToUSDT, checkBalanceUSDT } from '../services';
import { Request, Response } from 'express';

export enum Currency {
  BTC = 'BTC',
  USDT_BEP20 = 'USDT_BEP20',
  USDT_ERC20 = 'USDT_ERC20',
}

export const validateGetBalance = [
  check('address').isString().withMessage('Address key must be a string'),

  check('currency').isString().withMessage('"Currency" must be a string'),

  check('isMainnet').isBoolean().withMessage('"isMainnet" must be a boolean').toBoolean(),
];

export const getBalanceOfAddress = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address, currency, isMainnet } = matchedData(req, { locations: ['query'] }) as {
    address: string;
    currency: Currency;
    isMainnet?: boolean;
  };

  switch (currency) {
    case Currency.BTC: {
      const balance = await checkBalanceBTCToUSDT(address as string, isMainnet as boolean);

      return res.status(200).json({ data: balance });
    }

    case Currency.USDT_BEP20: {
      const balance = await checkBalanceUSDT(address as string, isMainnet as boolean);

      return res.status(200).json({ data: balance });
    }

    default: {
      console.error('Error fetching balance');
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  }
};

