import { useState } from 'react';
import { CONTRACT_PARAMS } from "../constants";
const useL1TokenContractParams = () => {
    const [contractParams] = useState(CONTRACT_PARAMS);
    return {
        contractParams,
        getContractParams: (currency) => contractParams[currency],
    };
};
export default useL1TokenContractParams;
