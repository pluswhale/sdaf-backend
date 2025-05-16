import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities/User';

const userRepository = AppDataSource.getRepository(User);

export const getUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await userRepository.find({ relations: ['role'] });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
