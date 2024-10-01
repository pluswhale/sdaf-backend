import { type Dispatch, useEffect, useState } from 'react';

import { type PubKey } from '@coinweb/wallet-lib';

const COINWEB_USER_PUB_KEY = 'coinwebUserPubKey';

const updaters: Set<Dispatch<React.SetStateAction<string | null>>> = new Set();

const updatePubKey = (value: string | null) => {
  updaters.forEach((updater) => updater(value));

  if (value) {
    localStorage.setItem(COINWEB_USER_PUB_KEY, value);
  } else {
    localStorage.removeItem(COINWEB_USER_PUB_KEY);
  }
};

export const useUserPubKey = () => {
  const [pubKey, setPubKey] = useState<PubKey | null>(localStorage.getItem(COINWEB_USER_PUB_KEY) ?? null);

  useEffect(() => {
    updaters.add(setPubKey);

    () => updaters.delete(setPubKey);
  }, []);

  return { pubKey, updatePubKey };
};
