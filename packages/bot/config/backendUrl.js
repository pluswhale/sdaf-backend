import dotenv from 'dotenv';
dotenv.config();
const enviroment = 'testnet';
export const backendUrl = () => {
    if (enviroment) {
        return enviroment === 'testnet'
            ? process.env.API_ISOLATE_BACKEND_LOCAL
            : process.env.API_ISOLATE_BACKEND_PRODUCTION;
    }
};
