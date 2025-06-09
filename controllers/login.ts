import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { username, password } = req.body;
  try {
    const user = await userRepository.findOne({ where: { username }, relations: { permissions: true } });

    console.log('bod', req.body);
    console.log('urser', user);

    if (user && (await bcrypt.compare(password, user.password))) {
      const secretKey = process.env.SECRET_JWT_KEY;
      const userToAuth = {
        ...user,
        permissions: user.permissions.map((permission) => permission.id),
      };

      const accessToken = jwt.sign({ userToAuth }, secretKey as string, { expiresIn: '40m' });
      const refreshToken = jwt.sign({ userToAuth }, secretKey as string, { expiresIn: '50m' });

      res
        .setHeader('Access-Control-Allow-Credentials', 'true')
        .setHeader('Access-Control-Expose-Headers', 'Authorization, Set-Cookie')
        .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', secure: false })
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

