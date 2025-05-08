import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface JwtPayloadWithUser extends JwtPayload {
  user: any;
}

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  const refreshToken = req.cookies['refreshToken'];
  if (!refreshToken) {
    return res.status(401).send('Access Denied. No refresh token provided.');
  }

  const secretKey = process.env.SECRET_JWT_KEY;

  try {
    const decoded = jwt.verify(refreshToken, secretKey as string) as unknown as JwtPayloadWithUser;
    const accessToken = jwt.sign({ user: decoded.user }, secretKey as string, { expiresIn: '40m' });

    res
      .setHeader('Access-Control-Allow-Credentials', 'true')
      .setHeader('Access-Control-Expose-Headers', 'Authorization, Set-Cookie')
      .header('Authorization', accessToken)
      .send(decoded.user);
  } catch (error) {
    return res.status(400).send('Invalid refresh token.');
  }
};
