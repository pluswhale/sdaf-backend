import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { Permission } from '../db/entities';
import { groupPermissionsByCategory } from '../services/groupPermissions';

const permissionRepository = AppDataSource.getRepository(Permission);

export const getAllPermissions = async (req: Request, res: Response): Promise<any> => {
    try {
        const permissions = await permissionRepository.find();
        const groupedPermissionsByCategories = groupPermissionsByCategory(permissions);

        res.status(200).json(groupedPermissionsByCategories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
