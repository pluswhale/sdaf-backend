import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface JwtPayloadWithUser extends JwtPayload {
  user: any;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: string;
  }
}

const authenticate = (req: any, res: any, next: NextFunction) => {
  const authorizationHeader = req.headers['authorization'];
  const accessToken = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.split(' ')[1] : null;
  const refreshToken = req.cookies?.refreshToken;
  console.log('refresh token', refreshToken);

  const secretKey = process.env.SECRET_JWT_KEY;

  if (!accessToken) {
    return res.status(401).send('Access Denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(accessToken as string, secretKey as string) as JwtPayloadWithUser;
    req.user = decoded.user;
    next();
  } catch (error) {
    if (!refreshToken) {
      return res.status(401).send('Access Denied. No refresh token provided.');
    }

    try {
      const decoded = jwt.verify(refreshToken, secretKey as string) as JwtPayloadWithUser;
      const newAccessToken = jwt.sign({ user: decoded.user }, secretKey as string, { expiresIn: '30s' });

      res
        .setHeader('Access-Control-Allow-Credentials', 'true')
        .setHeader('Access-Control-Expose-Headers', 'Authorization, Set-Cookie')
        .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', secure: false })
        .header('Authorization', `Bearer ${newAccessToken}`);
      req.user = decoded.user;
      next();
    } catch (error) {
      return res.status(400).send('Invalid Token.');
    }
  }
};

export { authenticate };

