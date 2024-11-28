import makeTransaction, { validateTransaction } from '../controllers/makeTransaction';
import {
  editMarginController,
  getAllMarginsController,
  getAllWallets,
  getOrders,
  refreshToken,
  setUpMinAndMaxWallet,
  validateEditMargin,
  validateSetUpMixMaxInWallet,
} from '../controllers';
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
import { authenticate } from '../middlewares';
import { getWalletList } from '../controllers/getWalletList';
import { getUserBalance } from '../controllers/getUserBalanceCeffu';
import { getWithdrawalHistoryCeffu } from '../controllers/getWithdrawalHistoryCeffu';
import { initiateWithdrawalCeffu } from '../controllers/initiateWithdrawalCeffu';
import { getWithdrawalDetailsCeffu } from '../controllers/getWithdrawalDetailsCeffu';

const router = express.Router();

router.post('/save/wallet', authenticate, saveWallet);
router.get('/wallets', authenticate, getAllWallets);
router.post('/transaction', validateTransaction, authenticate, makeTransaction);
router.get('/balance', validateGetBalance, getBalanceOfAddress);
router.put('/wallet/update-minmax/:id', validateSetUpMixMaxInWallet, setUpMinAndMaxWallet);

router.post('/login', loginUser);
router.post('/refresh', refreshToken);

//auto-send
router.post('/auto-send/start', validateTransaction, authenticate, startAutoTransaction);
router.delete('/auto-send/stop/:walletAddress', authenticate, stopAutoTransaction);
router.get('/auto-send/transactions', authenticate, getAllAutoTransactions);
router.get('/auto-send/transactions/drop-all', authenticate, dropAllAutoTransactions);

//quoting engine
router.get('/quoting-engine/margins', getAllMarginsController);
router.put('/quoting-engine/margins/:id', validateEditMargin, editMarginController);
router.get('/quoting-engine/orders', getOrders);

// CEFFU Prime Wallets Balances
router.get('/balance-ceffu', authenticate, getUserBalance);
router.get('/wallet-ceffu', authenticate, getWalletList);
router.get('/get-withdrawal-history-ceffu', authenticate, getWithdrawalHistoryCeffu);
router.post('/initiate-withdrawal-ceffu', authenticate, initiateWithdrawalCeffu);
router.get('/get-withdrawal-details-ceffu', authenticate, getWithdrawalDetailsCeffu);

export default router;

