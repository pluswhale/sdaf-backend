import axios from 'axios';
import { Request, Response } from 'express';
import { backendUrl } from '../config';

export const getPublicKey = async (req: Request, res: Response): Promise<any> => {
    const { coin }  = req.query;
    try {
        const response = await axios.get(`${backendUrl()}/api/get-public-key/?coin=${coin}`);
        if (!response) {
            return res.status(404).json({ message: 'Can`t get public key' });
        }

        return res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
