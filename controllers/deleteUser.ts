import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities/User';

const userRepository = AppDataSource.getRepository(User);

export const deleteUser = async (req: Request, res: Response): Promise<any> => {

    const { id } = req.params;

    try {
        const userToDelete = await userRepository.findOne({ where: { id } });

    if (!userToDelete) {
        return res.status(404).json({ message: 'User ID is incorrect' });
    }

    await userRepository.remove(userToDelete);

    res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
