import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { username, password } = req.body;
  try {
    const userFromDb = await userRepository.findOne({ where: { username }, relations: { permissions: true } });

    console.log('bod', req.body);
    console.log('urser', userFromDb);

    if (userFromDb && (await bcrypt.compare(password, userFromDb.password))) {
      const secretKey = process.env.SECRET_JWT_KEY;
      const user = {
        id: userFromDb.id,
      };

      const accessToken = jwt.sign({ user }, secretKey as string, { expiresIn: '40m' });
      const refreshToken = jwt.sign({ user }, secretKey as string);

      res
        .setHeader('Access-Control-Allow-Credentials', 'true')
        .setHeader('Access-Control-Expose-Headers', 'Authorization, Set-Cookie')
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        })
        .header('Authorization', `Bearer ${accessToken}`)
        .status(200)
        .send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error: any) {
    res.status(500).send('Error during login: ' + error);
  }
};

