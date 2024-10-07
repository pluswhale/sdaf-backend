import { useCallback, useState } from 'react';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
const useReadERC20Balances = (walletAddress) => {
    const [isAllowanceCheckEnabled, setIsAllowanceCheckEnabled] = useState(false);
    const [contracts, setContracts] = useState([]);
    const constructContractRead = useCallback((erc20TokenContract) => {
        return {
            abi: erc20Abi,
            functionName: 'balanceOf',
            address: erc20TokenContract,
            args: [walletAddress],
            query: {
                enabled: isAllowanceCheckEnabled,
            },
        };
    }, [walletAddress]);
    const result = useReadContracts({ contracts });
    return {
        contracts,
        result,
        error: result.error,
        data: result.data,
        isLoading: result.isLoading,
        getBalance: (erc20TokenContract) => {
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
