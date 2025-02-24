import makeTransaction, { validateTransaction } from '../controllers/makeTransaction';
import {
  editMarginController,
  getAllMarginsController,
  getAllWallets,
  getOrders,
  refreshToken,
  setUpMinAndMaxWallet,
  updateBotOrderController,
  validateEditMargin,
  validateSetUpMixMaxInWallet,
  getBotOrdersController,
  deleteBotOrderController,
  createBotOrderController,
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
import { getAllWalletsWithoutPrice } from '../controllers/getAllWalletsWithoutPrice';
import { getDepositAddressCeffu } from '../controllers/getDepositAddressCeffu';
import { getDepositDetailCeffu } from '../controllers/getDepositDetailCeffu';
import { makeRebalancerTransaction } from '../controllers/makeRebalancerTransaction';
import { renameWallet, validateRenamingWallet } from '../controllers/renameWallet';
import { getAssetPrice } from '../controllers/transactions/getAssetPrice';

import { getTransactionConfirmations } from '../controllers/getTransactionConfirmations';

import { getHedgineEngineHistoryLog } from '../controllers/getHedgineEngineHistoryLog';
import { getUserBinanceBalance } from '../controllers/binanceApi/getUserBinanceBalance';
import { getFinaliseLog } from '../controllers/getFinaliseLog';
import { rateLimit } from '../controllers/rateLimit';
import { getHedgerConfigurationOptions } from '../controllers/getHedgerConfigurationOptions';
import { updateHedgerConfigOption } from '../controllers/updateHedgerConfigOption';
import { archiveWallet, validateArchivedWallet } from '../controllers/archiveWallet';
import { initiateWithdrawalBinance } from '../controllers/binanceApi/initiateWithdrawalBinance';
import { getDepositAddressBinance } from '../controllers/binanceApi/getDepositAddressBinance';
import { getDepositDetailBinance } from '../controllers/binanceApi/getDepositDetailBinance';
import { getWithdrawalDetailsBinance } from '../controllers/binanceApi/getWithdrawalDetailsBinance';

const router = express.Router();

router.post('/save/wallet', authenticate, saveWallet);
router.get('/wallets', getAllWallets);
router.get('/wallets-without-price', authenticate, getAllWalletsWithoutPrice);
router.post('/transaction', validateTransaction, authenticate, makeTransaction);
router.get('/balance', validateGetBalance, getBalanceOfAddress);
router.put('/wallet/update-minmax/:id', validateSetUpMixMaxInWallet, setUpMinAndMaxWallet);
router.patch('/wallet/update-name/:id', validateRenamingWallet, renameWallet);
router.patch('/wallet/update-archive/:id', validateArchivedWallet, archiveWallet);

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

// Make Rebalancer Transaction
router.post('/create-transaction', makeRebalancerTransaction);

// CEFFU Prime Wallets Balances
router.get('/balance-ceffu', getUserBalance);
router.get('/wallet-ceffu', getWalletList);
router.post('/get-deposit-address-ceffu', getDepositAddressCeffu);
router.post('/get-deposit-detail-ceffu', getDepositDetailCeffu);
router.get('/get-withdrawal-history-ceffu', getWithdrawalHistoryCeffu);
router.post('/initiate-withdrawal-ceffu', initiateWithdrawalCeffu);
router.post('/get-withdrawal-details-ceffu', getWithdrawalDetailsCeffu);

// CoinGeko prices
router.get('/get-asset-price', getAssetPrice);

//Binance
router.get('/balance-binance', getUserBinanceBalance);
router.post('/initiate-withdrawal-binance', initiateWithdrawalBinance);
router.post('/get-withdrawal-details-binance', getWithdrawalDetailsBinance);
router.post('/get-deposit-address-binance', getDepositAddressBinance);
router.post('/get-deposit-detail-binance', getDepositDetailBinance);

// Test Rate Limit Blockstream
router.get('/rate-limit', rateLimit);

// Headging Engine
router.get('/get-confirmations', getTransactionConfirmations);

//Bot Order
router.get('/bot-order', getBotOrdersController);
router.put('/bot-order/create', createBotOrderController);
router.patch('/bot-order/update/:id', updateBotOrderController);
router.delete('/bot-order/delete/:id', deleteBotOrderController);

//HE
router.get('/hedgine-engine/history', getHedgineEngineHistoryLog);
router.get('/hedgine-engine/finalise-logs', getFinaliseLog);
router.get('/hedgine-engine/config-options', getHedgerConfigurationOptions);
router.put('/hedgine-engine/config-options', updateHedgerConfigOption);

export default router;

