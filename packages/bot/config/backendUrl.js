const enviroment = 'test';
export const backendUrl = () => {
    if (process.env.API_ISOLATE_BACKEND_LOCAL) {
        return enviroment === 'test' ? process.env.API_ISOLATE_BACKEND_LOCAL : process.env.API_ISOLATE_BACKEND_PRODUCTION;
    }
};
