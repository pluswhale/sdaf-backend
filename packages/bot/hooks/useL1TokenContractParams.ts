import { useState } from 'react';
import {CONTRACT_PARAMS, Currency} from "../constants";


const useL1TokenContractParams = () => {
  const [contractParams] = useState(CONTRACT_PARAMS);

  return {
    contractParams,
    getContractParams: <TCurrency extends Currency>(currency: TCurrency) => contractParams[currency],
  };
};

export default useL1TokenContractParams;
