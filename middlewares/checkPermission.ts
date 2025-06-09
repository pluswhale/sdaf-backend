import { NextFunction, Request, Response } from 'express';
import { Permission } from '../db/entities/Permission';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db/AppDataSource';

const permissionsRepo = AppDataSource.getRepository(Permission);

export const checkPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let requiredPermission: Permission | null;
    try {
      requiredPermission = await permissionsRepo.findOne({ where: { name: permission } });
    } catch (error) {
      console.error('Error retreiving required permission from the database', error);
    }

    if (token) {
      let userPermissions: number[];
      //@ts-ignore
      userPermissions = jwt.verify(token, process.env.SECRET_JWT_KEY).user.permissions;
      if (!userPermissions) {
        res.status(403).send({ error: 'Access denied' });
        return;
      }
      if (!userPermissions.some((userPermission: number) => userPermission === requiredPermission?.id)) {
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
