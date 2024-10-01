import { useCallback, useState } from 'react';

import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';

import { EvmContractAddress } from '@/types';

type ContractRead = {
  abi: typeof erc20Abi;
  functionName: string;
  address: EvmContractAddress;
  args: [EvmContractAddress];
  query: { enabled: boolean };
};

const useReadERC20Balances = (walletAddress: EvmContractAddress) => {
  const [isAllowanceCheckEnabled, setIsAllowanceCheckEnabled] = useState(false);
  const [contracts, setContracts] = useState<ContractRead[]>([]);

  const constructContractRead = useCallback(
    (erc20TokenContract: EvmContractAddress): ContractRead => {
      return {
        abi: erc20Abi,
        functionName: 'balanceOf',
        address: erc20TokenContract,
        args: [walletAddress],
        query: {
          enabled: isAllowanceCheckEnabled,
        },
      };
    },
    [walletAddress],
  );

  const result = useReadContracts<ContractRead[]>({ contracts });

  return {
    contracts,
    result,
    error: result.error,
    data: result.data,
    isLoading: result.isLoading,
    getBalance: (erc20TokenContract: EvmContractAddress) => {
      if (!erc20TokenContract) {
        return;
      }
      if (!isAllowanceCheckEnabled) {
        setIsAllowanceCheckEnabled(true);
      }
      setContracts(contracts.concat(constructContractRead(erc20TokenContract)));
    },
  };
};

export default useReadERC20Balances;
