import { useCallback, useEffect, useState } from 'react';
import { erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';
const useReadERC20Allowance = (walletAddress) => {
    const [contract, setContract] = useState();
    const constructContractRead = useCallback((erc20TokenContract, spenderContract) => {
        return {
            abi: erc20Abi,
            functionName: 'allowance',
            address: erc20TokenContract,
            args: [walletAddress, spenderContract],
            query: {
                enabled: Boolean(walletAddress),
            },
        };
    }, [walletAddress]);
    useEffect(() => {
        if (contract) {
            setContract((state) => ({ ...state, query: { enabled: Boolean(walletAddress) } }));
        }
    }, [walletAddress]);
    const result = useReadContract(contract);
    return {
        ...result,
        contract,
        setAllowanceContractParams: (erc20TokenContract, spenderContract) => {
            if (!erc20TokenContract || !spenderContract) {
                return;
            }
            setContract(constructContractRead(erc20TokenContract, spenderContract));
        },
    };
};
export default useReadERC20Allowance;
