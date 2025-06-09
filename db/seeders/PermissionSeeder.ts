import { DataSource } from 'typeorm';
import { Permission } from '../entities/Permission';
import { User } from '../entities/User';

export const permissionSeeder = async (dataSource: DataSource) => {
    const permissionRepository = dataSource.getRepository(Permission);
    const userRepository = dataSource.getRepository(User);

    const permissions = [
        { name: 'Send funds manually from Dashboard', category: 'funds' },
        { name: 'Send funds manually from Archive', category: 'funds' },
        { name: 'Send funds manually from Test Dashboard', category: 'funds' },
        { name: 'Run/stop Rebalancer on Dashboard', category: 'rebalancer' },
        { name: 'Run/stop Rebalancer in Archive', category: 'rebalancer' },
        { name: 'Run/stop Rebalancer on Test Dashboard', category: 'rebalancer' },
        { name: 'Run/stop Hedger on Production', category: 'hedger' },
        { name: 'Run/stop Test Hedger', category: 'hedger' },
        { name: 'Configure AutoSend at Dashboard', category: 'autosend' },
        { name: 'Configure AutoSend at Test', category: 'autosend' },
        { name: 'Configure AutoSend at Archive', category: 'autosend' },
        { name: 'Download csv-file', category: 'another' },
        { name: 'Setup margin', category: 'another' },
        { name: 'Archive/unarchive wallets', category: 'another' },
        { name: 'Edit coins to show at Pairs tab', category: 'another' },
        { name: 'Setup bot order parameters', category: 'another' },
        { name: 'Modify wallets on Test Dasboard', category: 'another' },
        { name: 'View Customer Dashboard', category: 'another' },
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