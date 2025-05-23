import { DataSource } from 'typeorm';
import { Permission } from '../entities';

export const permissionSeeder = async (dataSource: DataSource) => {
    const permissionRepository = dataSource.getRepository(Permission);

    const permissions = [
        { name: 'Send funds manually from Dashboard' },
        { name: 'Send funds manually from Archive' },
        { name: 'Send funds manually from Test Dashboard' },
        { name: 'Run/stop Rebalancer on Dashboard' },
        { name: 'Run/stop Rebalancer in Archive' },
        { name: 'Run/stop Rebalancer on Test Dashboard' },
        { name: 'Run/stop Hedger on Production' },
        { name: 'Run/stop Test Hedger' },
        { name: 'Download csv-file' },
        { name: 'Setup margin' },
        { name: 'Archive/unarchive wallets' },
        { name: 'Edit coins to show at Pairs tab' },
        { name: 'Setup bot order parameters' },
        { name: 'Modify wallets on Test Dasboard' },
    ];

    for (const permission of permissions) {
        const existingPermission = await permissionRepository.findOne({
            where: { name: permission.name },
        });
        if (!existingPermission) {
            await permissionRepository.save(permission);
        }
    }

    console.log('Permissions seeded successfully.');
};

