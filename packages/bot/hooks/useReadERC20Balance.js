import { useCallback, useEffect, useState } from 'react';
import { erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';
const useReadERC20Balance = (walletAddress) => {
    const [contract, setContract] = useState();
    const constructContractRead = useCallback((erc20TokenContract) => {
        return {
            abi: erc20Abi,
            functionName: 'balanceOf',
            address: erc20TokenContract,
            args: [walletAddress],
            query: {
                enabled: Boolean(walletAddress),
            },
        };
    }, [walletAddress]);
    useEffect(() => {
        if (contract?.address) {
            setContract(constructContractRead(contract.address));
        }
    }, [walletAddress]);
    const result = useReadContract(contract);
    return {
        ...result,
        contract,
        getBalance: (erc20TokenContract) => {
            if (erc20TokenContract) {
                setContract(constructContractRead(erc20TokenContract));
            }
        },
    };
};
export default useReadERC20Balance;
