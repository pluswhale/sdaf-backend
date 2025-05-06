import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { Wallet } from '../db/entities';
import { check, validationResult } from 'express-validator';

export const validateInEditinTestStatusWallet = [
    check('isTest').isBoolean().withMessage('isTest field value must be a boolean'),
    check('type').isString().withMessage('type field value must be a string'),
];

const walletRepository = AppDataSource.getRepository(Wallet);

export const editTestWalletStatus = async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { isTest, type } = req.body;

    try {
        const wallet = await walletRepository.findOne({ where: { id } });

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        wallet.isTest = isTest;
        wallet.wallet_type = type;
        await walletRepository.update(id, { isTest, wallet_type: type });

        const updatedWallet = await walletRepository.findOne({ where: { id } });

        return res.json({ message: 'Wallet isTest field updated successfully!', wallet: updatedWallet });
    } catch (error) {
        console.error('Error updating wallet isTest field:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

