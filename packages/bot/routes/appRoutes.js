import { getAllWallets } from '../controllers/getAllWallets';
import { saveWallet } from '../controllers/saveWallet';
import express from 'express';
const router = express.Router();
router.post('/save/wallet', saveWallet);
router.get('/wallets', getAllWallets);
export default router;
