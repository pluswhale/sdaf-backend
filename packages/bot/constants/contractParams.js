import { NetworkName } from '@coinweb/wallet-lib/enums';
import { Currency } from './enums';
import { ERC20_TOKENS, EVM_TOKENS } from './settings';
const commonParamsMap = {
    NETWORK_NAME: 'NetworkName',
    //C1
    L2_CONTRACT_ADDRESS_BASE: 'HexString',
    L2_OWNER_MIN_FEE_BASE: 'HexString',
    L2_OWNER_PERCENTAGE_FEE_BASE: 'number',
    //C2
    L2_CONTRACT_ADDRESS_MAKER: 'HexString',
    L2_OWNER_MIN_FEE_MAKER: 'HexString',
    L2_OWNER_PERCENTAGE_FEE_MAKER: 'number',
};
const evmParamsMap = {
    //C1
    L1_CONTRACT_ADDRESS_BASE: 'HexString',
    L1_CONTRACT_ABI_BASE: 'string',
    L1_CALL_METHOD_NAME_BASE: 'string',
    //C2
    L1_CONTRACT_ADDRESS_MAKER: 'HexString',
    L1_CONTRACT_ABI_MAKER: 'string',
    L1_CALL_METHOD_NAME_MAKER: 'string',
};
const ERC20ParamsMap = { L1_TOKEN_ADDRESS: 'HexString' };
const extractParam = (currency, name) => {
    console.log('currency', currency);
    console.log('name', name);
    const paramsMap = (() => {
        switch (true) {
            case ERC20_TOKENS.includes(currency):
                return { ...commonParamsMap, ...evmParamsMap, ...ERC20ParamsMap };
            case EVM_TOKENS.includes(currency):
                return { ...commonParamsMap, ...evmParamsMap };
            default:
                return commonParamsMap;
        }
    })();
    const paramName = name;
    const param = process.env[`${name}_${currency}`];
    if (paramsMap[paramName] === 'number' && !isNaN(Number(param))) {
        return Number(param);
    }
    if (paramsMap[paramName] === 'NetworkName' && Object.values(NetworkName).includes(param)) {
        return param;
    }
    if (paramsMap[paramName] === 'HexString' && typeof param === 'string' && param.slice(0, 2).toLowerCase() === '0x') {
        return param;
    }
    if (typeof param === paramsMap[paramName]) {
        return param;
    }
};
const checkIsCurrency = (value) => Object.values(Currency).includes(value);
export const CONTRACT_PARAMS = new Proxy({}, {
    get(currencyParams, currency) {
        if (!checkIsCurrency(currency)) {
            throw new Error(`Unknown token ${String(currency)}`);
        }
        if (currency in currencyParams) {
            console.log('currency in params', currency);
            return currencyParams[currency];
        }
        else if (Object.values(Currency).includes(currency)) {
            console.log('currency', currency);
            currencyParams[currency] = new Proxy({}, {
                get(params, paramName) {
                    if (paramName in params) {
                        return params[paramName];
                    }
                    else {
                        params[paramName] = extractParam(currency, paramName);
                        return params[paramName];
                    }
                },
            });
            return currencyParams[currency];
        }
    },
});
