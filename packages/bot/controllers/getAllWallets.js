// wallet.controller.ts
import { checkBalanceBNBToUSDT } from '../services/getBalance';
import AppDataSource from '../db/AppDataSource';
import { Wallet } from '../db/entities/Wallet';
export const getAllWallets = async (req, res) => {
    try {
        const walletRepository = AppDataSource()?.getRepository(Wallet);
        const wallets = await walletRepository?.find();
        const walletsWithPrice = wallets?.map(async (wallet) => {
            if (wallet.currency_type === 'BTC') {
                //TODO: Get price for BTC
            }
            else if (wallet.currency_type === 'USDT_BEP20') {
                const price = checkBalanceBNBToUSDT(wallet.address);
                return { ...wallet, price };
            }
            else {
                return wallet;
            }
        });
        res.status(200).json(walletsWithPrice);
    }
    catch (error) {
        console.error('Error fetching wallets:', error);
        res.status(500).json({ error: 'Failed to fetch wallets' });
    }
};
