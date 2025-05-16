import { AppDataSource } from '../db/AppDataSource';
import { Response } from 'express';
import { User } from '../db/entities';

export const getCurrentUser = async (req: any, res: Response): Promise<any> => {
  if (!req?.user?.id) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.userId } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err });
  }
};
