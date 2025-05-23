import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities/User';

const userRepository = AppDataSource.getRepository(User);

export const editUserComment = async (req: Request, res: Response): Promise<any> => {

    const { userId, comment } = req.body;

    try {
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.comment = comment;
        await userRepository.save(user);

        res.status(200).json({ message: 'Comment update successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
