import { Permission } from "../db/entities";

export const groupPermissionsByCategory = (
    permissions: Permission[]
): Array<{ category: string; permissions: Permission[] }> => {
    const categoryMap = new Map<string, Permission[]>();

    permissions.forEach((permission) => {
        if (!categoryMap.has(permission.category)) {
            categoryMap.set(permission.category, []);
        }
        categoryMap.get(permission.category)!.push(permission);
    });

    return Array.from(categoryMap.entries()).map(([category, permissions]) => ({
        category,
        permissions,
    }));
};