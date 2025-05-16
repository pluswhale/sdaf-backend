import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { User } from '../db/entities/User';
import { Role } from '../db/entities';

const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { fullName, username, password, roleId } = req.body;

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

            if (roleId) {
                const role = await roleRepository.findOne({ where: { id: roleId } });
                if (role) {
                    newUser.role = role;
                }
            }

            await userRepository.save(newUser);

            res.status(201).json({ message: 'Пользователь успешно создан' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при создании пользователя' });
    }
};
