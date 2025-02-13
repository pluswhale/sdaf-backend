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
  res.clearCookie('accessToken', { domain: 'sdafcwap.com', path: '/' });
  res.clearCookie('refreshToken', { domain: 'sdafcwap.com', path: '/' });

  try {
    next();
  } catch (error) {
    return res.status(401).send('Access token Expired.');
  }
};

export { authenticate };

