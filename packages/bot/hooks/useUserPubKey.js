import { useEffect, useState } from 'react';
const COINWEB_USER_PUB_KEY = 'coinwebUserPubKey';
const updaters = new Set();
const updatePubKey = (value) => {
    updaters.forEach((updater) => updater(value));
    if (value) {
        localStorage.setItem(COINWEB_USER_PUB_KEY, value);
    }
    else {
        localStorage.removeItem(COINWEB_USER_PUB_KEY);
    }
};
export const useUserPubKey = () => {
    const [pubKey, setPubKey] = useState(localStorage.getItem(COINWEB_USER_PUB_KEY) ?? null);
    useEffect(() => {
        updaters.add(setPubKey);
        () => updaters.delete(setPubKey);
    }, []);
    return { pubKey, updatePubKey };
};
