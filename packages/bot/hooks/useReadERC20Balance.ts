import { useCallback, useEffect, useState } from 'react';

import { erc20Abi } from 'viem';
import { useReadContract, type UseReadContractParameters } from 'wagmi';

import { EvmContractAddress } from '@/types';

const useReadERC20Balance = (walletAddress: EvmContractAddress) => {
  const [contract, setContract] = useState<UseReadContractParameters>();

  const constructContractRead = useCallback(
    (erc20TokenContract: EvmContractAddress): UseReadContractParameters => {
      return {
        abi: erc20Abi,
        functionName: 'balanceOf',
        address: erc20TokenContract,
        args: [walletAddress],
        query: {
          enabled: Boolean(walletAddress),
        },
      };
    },
    [walletAddress],
  );

  useEffect(() => {
    if (contract?.address) {
      setContract(constructContractRead(contract.address));
    }
  }, [walletAddress]);

  const result = useReadContract(contract);

  return {
    ...result,
    contract,
    getBalance: (erc20TokenContract: EvmContractAddress) => {
      if (erc20TokenContract) {
        setContract(constructContractRead(erc20TokenContract));
      }
    },
  };
};

export default useReadERC20Balance;
