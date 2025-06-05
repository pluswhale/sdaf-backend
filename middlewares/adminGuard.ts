import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const adminGuard = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        console.log(token);
        if (token) {
            let userRole: 'user' | 'superadmin';
            //@ts-ignore
            userRole = jwt.verify(token, process.env.SECRET_JWT_KEY).user.roles?.[0]?.name;
            if (!userRole) {
                res.status(403).send({ error: 'Access denied' });
                return;
            }
            if (userRole !== 'superadmin') {
                res.status(403).send({ error: `Current user is not super admin` });
                return;
            }
        } else {
            res.status(401).send({ error: 'Unauthorized' });
            return;
        }
        return next();
    };
};