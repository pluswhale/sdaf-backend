import makeTransaction, { validateTransaction } from '../controllers/makeTransaction';
import { createUsers, getAllWallets } from '../controllers';
import { saveWallet } from '../controllers';
import express from 'express';
import { getBalanceOfAddress, validateGetBalance } from '../controllers';
import { loginUser } from '../controllers';
import {
  dropAllAutoTransactions,
  getAllAutoTransactions,
  startAutoTransaction,
  stopAutoTransaction,
} from '../controllers/autoTransactor';

const router = express.Router();

router.post('/save/wallet', saveWallet);
router.get('/wallets', getAllWallets);
router.post('/transaction', validateTransaction, makeTransaction);

router.get('/balance', validateGetBalance, getBalanceOfAddress);
router.post('/login', loginUser);
router.get('/create/users', createUsers);

router.post('/auto-send/start', validateTransaction, startAutoTransaction);
router.post('/auto-send/stop/:walletAddress', stopAutoTransaction);
router.post('/auto-send/transactions', getAllAutoTransactions);
router.post('/auto-send/transactions/drop-all', dropAllAutoTransactions);

export default router;

