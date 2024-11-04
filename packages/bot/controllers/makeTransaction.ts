import axios from 'axios';
import { backendUrl } from '../config/backendUrl';
import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

export const validateTransaction = [
  check('pub_key').isString().withMessage('Public key must be a string'),

  check('from').isString().withMessage('"From" address must be a string'),

  check('to').isString().withMessage('"To" address must be a string'),

  check('amount').isFloat({ gt: 0 }).withMessage('Amount must be a number greater than 0'),

  check('currencyType').isString().withMessage('Currency type must be a string'),

  check('interval')
    .optional()
    .isInt({ min: 1000 })
    .withMessage('Interval must be an integer greater than or equal to 1000 ms'),
];

export const makeTransaction = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const response = await axios.post(`${backendUrl()}/api/transaction`, req.body);

    if (!response) {
      return res.status(404).json({ message: 'Can`t send transaction' });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error sending transaction:', error);
    res.status(500).json({ error: 'Failed to send transaction' });
  }
};

export default makeTransaction;

