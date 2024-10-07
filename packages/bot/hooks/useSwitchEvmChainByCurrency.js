import { useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import useChainByCurrency from './useChainByCurrency';
const useSwitchEvmChainByCurrency = () => {
    const account = useAccount();
    const { isPending, switchChainAsync } = useSwitchChain();
    const { findChainByCurrency } = useChainByCurrency();
    const switchChainByCurrency = useCallback((currency) => {
        const { isEvm, chainData } = findChainByCurrency(currency);
        if (account.isConnected) {
            if (isEvm && account.chainId !== chainData.id) {
                return switchChainAsync({ chainId: chainData.id }).then(() => {
                    // void toast.success(`Switched to ${chainData!.name}`);
                });
            }
        }
    }, [account]);
    return { isLoading: isPending, switchChainByCurrency };
};
export default useSwitchEvmChainByCurrency;
