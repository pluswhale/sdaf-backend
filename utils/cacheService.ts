import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export const getCache = (key: string): any | undefined => {
  return cache.get(key);
};

export const setCache = (key: string, value: any, ttl?: number): void => {
  if (ttl) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
};
