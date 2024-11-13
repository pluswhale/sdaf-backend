import { userData } from '../db/entities/userData';
import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities';
import { Request, Response } from 'express';

const userRepository = AppDataSource.getRepository(User);

export const createUsers = async (req: Request, res: Response): Promise<any> => {
  if ((await userRepository.find())?.length) {
    res.status(400).send('Users already been seeded successfully');
  }

  try {
    for (const user of userData) {
      const newUser = userRepository.create(user);
      await userRepository.save(newUser);
    }

    res.status(201).send('Users created successfully');
  } catch (error) {
    res.status(500).send('Error creating users: ' + error);
  }
};

