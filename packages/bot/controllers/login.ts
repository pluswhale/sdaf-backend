import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

const userRepository = AppDataSource.getRepository(User);

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { username, password } = req.body;
  try {
    const user = await userRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error: any) {
    res.status(500).send('Error during login: ' + error);
  }
};

