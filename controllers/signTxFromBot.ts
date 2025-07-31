import axios from 'axios';
import { Request, Response } from 'express';
import { backendUrl } from '../config';

export const signTxFromBot = async (req: Request, res: Response): Promise<any> => {
    try {
        const response = await axios.post(`${backendUrl()}/api/sign/bot-tx`, req.body);
        if (!response) {
            return res.status(404).json({ message: 'Can`t sign bot tx' });
        }

        return res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
