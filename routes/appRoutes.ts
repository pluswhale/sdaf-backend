import makeTransaction, { validateTransaction } from '../controllers/makeTransaction';
import {
  checkWalletAddressByAmlCrypto,
  createBotOrderController,
  deleteBotOrderController,
  editMarginController,
  editRebalancerWalletsStatus,
  getAllMarginsController,
  getAllWallets,
  getBotOrdersController,
  getOrders,
  getRebalancersWallets,
  loginUser,
  refreshToken,
  saveWallet,
  setUpMarginToAll,
  setUpMinAndMaxWallet,
  updateBotOrderController,
  validateEditMargin,
  validateSetUpMixMaxInWallet,
} from '../controllers';
import express from 'express';
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
import { walletsWithPrices } from '../controllers/walletsWithPrices';
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
import { getWalletBalanceHistory } from '../controllers/getWalletHistory';
import { duplicateWallet } from '../controllers/duplicateWallet';
import { editTestWalletStatus, validateInEditinTestStatusWallet } from '../controllers/editTestWalletStatus';
import {
  createSession,
  getAllSessions,
  getLastActiveSessionByUserId,
  updateActiveSession,
} from '../controllers/sessionTrackerController';
import { getUsers } from '../controllers/getUsers';
import { deleteUser } from '../controllers/deleteUser';
import { getAllPermissions } from '../controllers/getAllPermissions';
import { assignPermissionsToUser } from '../controllers/assignPermissionsToUser';
import { getCurrentUser } from '../controllers/getCurrentUser';
import { editUserComment } from '../controllers/editUserComment';
import { checkWalletAddressByAmlCryptoSimple } from '../controllers/checkWalletAddressByAmlCryptoSimple';
import { checkPermission } from '../middlewares/checkPermission';
import { PermissionsEnum } from '../utils/permissions';

const router = express.Router();

/*//////////////////////////////////////////////////////////////
                                WALLET
   //////////////////////////////////////////////////////////////*/
router.post('/save/wallet', saveWallet);
router.get('/wallets', getAllWallets);
router.post('/wallets-with-prices', walletsWithPrices);
router.get('/wallets/rebalancers', getRebalancersWallets);
router.put('/wallets/rebalancers/set-up/:id', editRebalancerWalletsStatus);
router.get('/wallets/balance/history/:address', getWalletBalanceHistory);
router.put(
  '/wallet/update-minmax/:id',
  validateSetUpMixMaxInWallet,
  authenticate,
  checkPermission(PermissionsEnum.CONTROL_REBALANCER_DASHBOARD),
  setUpMinAndMaxWallet,
);
router.put(
  '/wallet/update-minmax/archive/:id',
  validateSetUpMixMaxInWallet,
  authenticate,
  checkPermission(PermissionsEnum.CONTROL_REBALANCER_ARCHIVE),
  setUpMinAndMaxWallet,
);
router.put(
  '/wallet/update-minmax/test/:id',
  validateSetUpMixMaxInWallet,
  authenticate,
  checkPermission(PermissionsEnum.CONTROL_REBALANCER_TEST_DASHBOARD),
  setUpMinAndMaxWallet,
);
router.patch('/wallet/update-name/:id', validateRenamingWallet, renameWallet);
router.patch('/wallet/update-archive/:id', validateArchivedWallet, archiveWallet);
router.patch(
  '/wallet/update-test/:id',
  validateInEditinTestStatusWallet,
  authenticate,
  checkPermission(PermissionsEnum.MODIFY_TEST_WALLETS),
  editTestWalletStatus,
);
router.post('/duplicate/wallet', duplicateWallet);

/*//////////////////////////////////////////////////////////////
                          TRANSACTION
//////////////////////////////////////////////////////////////*/
router.post(
  '/transaction',
  validateTransaction,
  authenticate,
  checkPermission(PermissionsEnum.MANUAL_SEND_DASHBOARD),
  makeTransaction,
);
router.post(
  '/transaction/test',
  validateTransaction,
  authenticate,
  checkPermission(PermissionsEnum.MANUAL_SEND_TEST_DASHBOARD),
  makeTransaction,
);
router.post(
  '/transaction/archive',
  validateTransaction,
  authenticate,
  checkPermission(PermissionsEnum.MANUAL_SEND_ARCHIVE),
  makeTransaction,
);

/*//////////////////////////////////////////////////////////////
                         AUTHORIZATION
//////////////////////////////////////////////////////////////*/
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.get('/users', getUsers);
router.delete('/user/:id', deleteUser);
router.get('/user/me', authenticate, getCurrentUser);
router.patch('/user/comment', authenticate, editUserComment);
/*//////////////////////////////////////////////////////////////
                          AUTO-SEND
//////////////////////////////////////////////////////////////*/
router.post('/auto-send/start', validateTransaction, authenticate, startAutoTransaction);
router.delete('/auto-send/stop/:walletAddress', authenticate, stopAutoTransaction);
router.get('/auto-send/transactions', authenticate, getAllAutoTransactions);
router.get('/auto-send/transactions/drop-all', authenticate, dropAllAutoTransactions);

/*//////////////////////////////////////////////////////////////
                         QUOTING ENGINE
//////////////////////////////////////////////////////////////*/
router.get('/quoting-engine/margins', getAllMarginsController);
router.patch(
  '/quoting-engine/margins/update-margin-value',
  authenticate,
  checkPermission(PermissionsEnum.SETUP_MARGIN),
  setUpMarginToAll,
);
router.put(
  '/quoting-engine/margins/:id',
  validateEditMargin,
  authenticate,
  checkPermission(PermissionsEnum.SETUP_MARGIN),
  editMarginController,
);
router.get('/quoting-engine/orders', getOrders);

/*//////////////////////////////////////////////////////////////
                  MAKE REBALANCER TRANSACTION
/////////////////////////////////////////////////////////////*/
router.post('/create-transaction', makeRebalancerTransaction);

/*//////////////////////////////////////////////////////////////
                  CEFFU PRIME WALLETS BALANCES
//////////////////////////////////////////////////////////////*/
router.get('/balance-ceffu', getUserBalance);
router.get('/wallet-ceffu', getWalletList);
router.post('/get-deposit-address-ceffu', getDepositAddressCeffu);
router.post('/get-deposit-detail-ceffu', getDepositDetailCeffu);
router.get('/get-withdrawal-history-ceffu', getWithdrawalHistoryCeffu);
router.post('/initiate-withdrawal-ceffu', initiateWithdrawalCeffu);
router.post('/get-withdrawal-details-ceffu', getWithdrawalDetailsCeffu);

/*//////////////////////////////////////////////////////////////
                        COINGEKO PRICES
//////////////////////////////////////////////////////////////*/
router.get('/get-asset-price', getAssetPrice);

/*//////////////////////////////////////////////////////////////
                           BINANCE
//////////////////////////////////////////////////////////////*/
router.get('/balance-binance', getUserBinanceBalance);
router.post('/initiate-withdrawal-binance', initiateWithdrawalBinance);
router.post('/get-withdrawal-details-binance', getWithdrawalDetailsBinance);
router.post('/get-deposit-address-binance', getDepositAddressBinance);
router.post('/get-deposit-detail-binance', getDepositDetailBinance);

/*//////////////////////////////////////////////////////////////
                  TEST RATE LIMIT BLOCKSTREAM
//////////////////////////////////////////////////////////////*/
router.get('/rate-limit', rateLimit);

/*//////////////////////////////////////////////////////////////
                        HEADGING ENGINE
//////////////////////////////////////////////////////////////*/
router.get('/get-confirmations', getTransactionConfirmations);

/*//////////////////////////////////////////////////////////////
                           BOT ORDER
//////////////////////////////////////////////////////////////*/
router.get('/bot-order', getBotOrdersController);
router.put(
  '/bot-order/create',
  authenticate,
  checkPermission(PermissionsEnum.SETUP_BOT_ORDERS),
  createBotOrderController,
);
router.patch(
  '/bot-order/update/:id',
  authenticate,
  checkPermission(PermissionsEnum.SETUP_BOT_ORDERS),
  updateBotOrderController,
);
router.delete(
  '/bot-order/delete/:id',
  authenticate,
  checkPermission(PermissionsEnum.SETUP_BOT_ORDERS),
  deleteBotOrderController,
);

/*//////////////////////////////////////////////////////////////
                               HE
//////////////////////////////////////////////////////////////*/
router.get('/hedgine-engine/history', getHedgineEngineHistoryLog);
router.get('/hedgine-engine/finalise-logs', getFinaliseLog);
router.get('/hedgine-engine/config-options', getHedgerConfigurationOptions);
router.put('/hedgine-engine/config-options', updateHedgerConfigOption);

/*//////////////////////////////////////////////////////////////
                               ACTIVE USER SESSIONS
//////////////////////////////////////////////////////////////*/
router.get('/active-sessions', getAllSessions);
router.get('/active-sessions/:userId', getLastActiveSessionByUserId);
router.post('/active-sessions/create', createSession);
router.patch('/active-sessions/update', updateActiveSession);

/*//////////////////////////////////////////////////////////////
                              PERMISSIONS
//////////////////////////////////////////////////////////////*/
router.get('/permissions', authenticate, getAllPermissions);
router.patch('/permissions/user/assign', assignPermissionsToUser);

/*//////////////////////////////////////////////////////////////
                              AML
//////////////////////////////////////////////////////////////*/
router.post('/aml/check', checkWalletAddressByAmlCryptoSimple);

export default router;

