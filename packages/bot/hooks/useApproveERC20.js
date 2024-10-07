import { erc20Abi } from 'viem';
import { useWriteContract } from 'wagmi';
import useL1TokenContractParams from './useL1TokenContractParams';
import { Currency } from "../constants";
const useApproveERC20 = () => {
    const { isPending, writeContractAsync, ...rest } = useWriteContract();
    const { getContractParams } = useL1TokenContractParams();
    const getErc20Abi = (tokenAddress) => {
        // Either Hardcode the USDT address
        // if ('0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase() === tokenAddress.toLowerCase()) {
        // Or fetch preset USDT address from .env
        if (getContractParams(Currency.USDT_ETH).L1_TOKEN_ADDRESS.toLowerCase() === tokenAddress.toLowerCase()) {
            // ERC20 Abi for USDT is broken, dirty fix here
            return erc20Abi.map((abiPartial) => {
                if (abiPartial.name === 'approve')
                    return { ...abiPartial, outputs: [] };
                return abiPartial;
            });
        }
        return erc20Abi;
    };
    return {
        ...rest,
        isLoading: isPending,
        approve: (tokenAddress, spender, amount) => {
            return writeContractAsync({
                functionName: 'approve',
                abi: getErc20Abi(tokenAddress),
                address: tokenAddress,
                args: [spender, amount],
            });
        },
    };
};
export default useApproveERC20;
