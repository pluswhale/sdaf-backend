import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { Permission } from '../db/entities';

const permissionRepository = AppDataSource.getRepository(Permission);

export const getAllPermissions = async (req: Request, res: Response): Promise<any> => {
    try {
        const permissions = await permissionRepository.find();
        res.status(200).json(permissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
