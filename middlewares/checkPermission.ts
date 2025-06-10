import { NextFunction, Request, Response } from 'express';
import { Permission } from '../db/entities/Permission';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities';

const usersRepo = AppDataSource.getRepository(User);

export const checkPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      //@ts-ignore
      const userId = jwt.verify(token, process.env.SECRET_JWT_KEY).user.id;
      const user = await usersRepo.findOne({ where: { id: userId } });
      const userPermissions: Permission[] = user?.permissions!;
      if (!userPermissions) {
        res.status(403).send({ error: 'Access denied' });
        return;
      }
      if (!userPermissions.some((userPermission: Permission) => userPermission.name === permission)) {
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

