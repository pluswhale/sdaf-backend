import { AppDataSource } from '../db/AppDataSource';
import { Response } from 'express';
import { User } from '../db/entities';

export const getCurrentUser = async (req: any, res: Response): Promise<any> => {
  if (!req?.user?.id) return res.status(401).json({ message: 'Unauthorized' });

  console.log('req user', req.user);

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user.id }, relations: { roles: true, permissions: true } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err });
  }
};
