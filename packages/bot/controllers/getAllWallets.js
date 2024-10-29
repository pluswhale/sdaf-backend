// wallet.controller.ts
import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities/Wallet';
export const getAllWallets = async (req, res) => {
    try {
        const walletRepository = AppDataSource.getRepository(Wallet);
        const wallets = await walletRepository.find();
        res.status(200).json(wallets);
    }
    catch (error) {
        console.error('Error fetching wallets:', error);
        res.status(500).json({ error: 'Failed to fetch wallets' });
    }
};
