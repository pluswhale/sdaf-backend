import { NextFunction, Request, Response } from 'express';
import { Permission } from '../db/entities/Permission';
import jwt from 'jsonwebtoken';

export const checkPermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        console.log(token);
        if (token) {
            let userPermissions: Permission[];
            //@ts-ignore
            userPermissions = jwt.verify(token, process.env.SECRET_JWT_KEY).user.permissions;
            if (!userPermissions) {
                res.status(403).send({ error: 'Access denied' });
                return;
            }
            if (!userPermissions.some((userPermission: { id: number, name: string }) => userPermission.name === permission)) {
                res.status(403).send({ error: `Current user is lacking the ${permission} permission` });
                return;
            }
        } else {
            res.status(401).send({ error: 'Unauthorized' });
            return;
        }
        return next();
    };
};