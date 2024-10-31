import makeTransaction, { validateTransaction } from '../controllers/makeTransaction';
import { getAllWallets } from '../controllers/getAllWallets';
import { saveWallet } from '../controllers/saveWallet';
import express from 'express';
import { getBalanceOfAddress, validateGetBalance } from '../controllers/getBalanceOfAddress';

const router = express.Router();

router.post('/save/wallet', saveWallet);
router.get('/wallets', getAllWallets);
router.post('/transaction', validateTransaction, makeTransaction);
router.get('/balance', validateGetBalance, getBalanceOfAddress);

export default router;

