import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities/User';
import { Permission, Role } from '../db/entities';

const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);
const permissionRepository = AppDataSource.getRepository(Permission);

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { fullName, username, password, role, permissionIds } = req.body;

    try {
        const existingUser = await userRepository.findOne({ where: { username } });

        if (existingUser) {
            res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
        }   else {
            const newUser = userRepository.create({
                fullName,
                username,
                password,
            });

            const fullRole = await roleRepository.findOne({ where: { name: role } });
            if (fullRole) {
                newUser.roles = fullRole;
            }

            await userRepository.save(newUser);

            res.status(201).json({ message: 'Пользователь успешно создан' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при создании пользователя' });
    }
};
