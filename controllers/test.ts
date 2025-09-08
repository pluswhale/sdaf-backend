import axios from 'axios';
import { Request, Response } from 'express';
import { backendUrl } from '../config';

export const getTest = async (req: Request, res: Response): Promise<any> => {
    const { path, coin }  = req.body;
    try {
        const response = await axios.post(`${backendUrl()}/api/get-secrets`, { path, coin });
        if (!response) {
            return res.status(404).json({ message: 'Can`t get secrets' });
        }

        return res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
