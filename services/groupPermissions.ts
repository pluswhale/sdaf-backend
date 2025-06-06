import { Permission } from "../db/entities";

export const groupPermissionsByCategory = (permissions: Permission[]): Record<string, Permission[]> => {
    return permissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
            acc[permission.category] = [];
        }
        
        acc[permission.category].push(permission);
        
        return acc;
    }, {} as Record<string, Permission[]>);
}