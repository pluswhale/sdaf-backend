import { check, validationResult } from 'express-validator';
import { checkBalanceBTCToUSDT, checkBalanceUSDT } from '../services';
export var Currency;
(function (Currency) {
    Currency["BTC"] = "BTC";
    Currency["USDT_BEP20"] = "USDT_BEP20";
    Currency["USDT_ERC20"] = "USDT_ERC20";
})(Currency || (Currency = {}));
export const validateGetBalance = [
    check('address').isString().withMessage('Address key must be a string'),
    check('currency').isString().withMessage('"Currency" must be a string'),
];
export const getBalanceOfAddress = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { address, currency } = req.query;
    switch (currency) {
        case Currency.BTC: {
            const balance = await checkBalanceBTCToUSDT(address);
            return res.status(200).json({ data: balance });
        }
        case Currency.USDT_BEP20: {
            const balance = await checkBalanceUSDT(address);
            return res.status(200).json({ data: balance });
        }
        default: {
            console.error('Error fetching balance');
            res.status(500).json({ error: 'Failed to fetch balance' });
        }
    }
};
