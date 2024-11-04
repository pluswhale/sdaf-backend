import makeTransaction, { validateTransaction } from '../controllers/makeTransaction';
import { createUsers, getAllWallets } from '../controllers';
import { saveWallet } from '../controllers';
import express from 'express';
import { getBalanceOfAddress, validateGetBalance } from '../controllers';
import { loginUser } from '../controllers';

const router = express.Router();

router.post('/save/wallet', saveWallet);
router.get('/wallets', getAllWallets);
router.post('/transaction', validateTransaction, makeTransaction);
router.get('/balance', validateGetBalance, getBalanceOfAddress);
router.post('/login', loginUser);
router.get('/create/users', createUsers);

export default router;

