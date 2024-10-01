import { extractUser, getQueueAuthenticated, User } from '@coinweb/contract-kit';
export const getUser = (context) => {
    const auth = getQueueAuthenticated(context.tx);
    if (!auth) {
        return {
            auth: 'manual',
            payload: 'manual',
        };
        satisfies;
        User;
    }
    return extractUser(auth);
};
