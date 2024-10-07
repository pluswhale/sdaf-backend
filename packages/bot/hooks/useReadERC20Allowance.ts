import { useCallback, useEffect, useState } from 'react';

import { erc20Abi } from 'viem';
import { useReadContract, type UseReadContractParameters } from 'wagmi';
import {EvmContractAddress} from "../types";


const useReadERC20Allowance = (walletAddress: EvmContractAddress) => {
  const [contract, setContract] = useState<UseReadContractParameters>();

  const constructContractRead = useCallback(
    (erc20TokenContract: EvmContractAddress, spenderContract: EvmContractAddress): UseReadContractParameters => {
      return {
        abi: erc20Abi,
        functionName: 'allowance',
        address: erc20TokenContract,
        args: [walletAddress, spenderContract],
        query: {
          enabled: Boolean(walletAddress),
        },
      };
    },
    [walletAddress],
  );

  useEffect(() => {
    if (contract) {
      setContract((state) => ({ ...state, query: { enabled: Boolean(walletAddress) } }));
    }
  }, [walletAddress]);

  const result = useReadContract(contract);

  return {
    ...result,
    contract,
    setAllowanceContractParams: (erc20TokenContract: EvmContractAddress, spenderContract: EvmContractAddress) => {
      if (!erc20TokenContract || !spenderContract) {
        return;
      }
      setContract(constructContractRead(erc20TokenContract, spenderContract));
    },
  };
};

export default useReadERC20Allowance;
