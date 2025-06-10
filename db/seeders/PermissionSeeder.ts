import { DataSource } from 'typeorm';
import { Permission } from '../entities/Permission';
import { User } from '../entities/User';

export const permissionSeeder = async (dataSource: DataSource) => {
    const permissionRepository = dataSource.getRepository(Permission);
    const userRepository = dataSource.getRepository(User);

    const permissions = [
        { name: 'Send funds manually from Dashboard', category: 'dashboard' },
        { name: 'Send funds manually from Archive', category: 'dashboard' },
        { name: 'Send funds manually from Test Dashboard', category: 'dashboard' },
        { name: 'Run/stop Rebalancer on Dashboard', category: 'rebalancer' },
        { name: 'Run/stop Rebalancer in Archive', category: 'rebalancer' },
        { name: 'Run/stop Rebalancer on Test Dashboard', category: 'rebalancer' },
        { name: 'Configure AutoSend at Dashboard', category: 'autosender' },
        { name: 'Configure AutoSend at Test', category: 'autosender' },
        { name: 'Configure AutoSend at Archive', category: 'autosender' },
        { name: 'Run/stop Hedger on Production', category: 'hedger' },
        { name: 'Run/stop Test Hedger', category: 'hedger' },
        { name: 'Download csv-file', category: 'other' },
        { name: 'Setup margin', category: 'other' },
        { name: 'Archive/unarchive wallets', category: 'other' },
        { name: 'Edit coins to show at Pairs tab', category: 'other' },
        { name: 'Setup bot order parameters', category: 'other' },
        { name: 'Modify wallets on Test Dasboard', category: 'other' },
        { name: 'View Customer Dashboard', category: 'other' },
    ];

    for (const permissionData of permissions) {
        const existingPermission = await permissionRepository.findOne({
            where: { name: permissionData.name },
        });

        if (!existingPermission) {
            const newPermission = await permissionRepository.save(permissionData);

            const users = await userRepository.find({
                relations: ['permissions'],
            });

            for (const user of users) {
                if (!user.permissions.some(p => p.id === newPermission.id)) {
                    user.permissions.push(newPermission);
                    await userRepository.save(user);
                }
            }
        }
    }

    console.log('Permissions seeding completed.');
};