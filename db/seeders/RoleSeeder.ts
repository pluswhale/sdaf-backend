import { DataSource } from 'typeorm';
import { Role } from '../entities';

export const roleSeeder = async (dataSource: DataSource) => {
    const roleRepository = dataSource.getRepository(Role);

    const roles = [
        { name: 'user' },
        { name: 'superadmin' },
    ];

    for (const role of roles) {
        const existingRole = await roleRepository.findOne({
            where: { name: role.name },
        });
        if (!existingRole) {
            await roleRepository.save(role);
        }
    }

    console.log('roles seeded successfully.');
};

