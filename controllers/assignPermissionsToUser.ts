import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { Permission, User } from '../db/entities';

const UserRepository = AppDataSource.getRepository(User);
const PermissionRepository = AppDataSource.getRepository(Permission);

export const assignPermissionsToUser = async (req: Request, res: Response): Promise<any> => {
    const { userId, permissionsIds } = req.body
    try {
        const user = await UserRepository.findOneBy({ id: userId });
        if(!user) {
            return res.status(400).json({ message: 'User not found' })
        }
        const permissions = await PermissionRepository.find();

        const filteredPermissions = permissions.filter(permission => permissionsIds.includes(permission.id));

        user.permissions = filteredPermissions;

        await UserRepository.save(user);

        res.status(200).json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
}