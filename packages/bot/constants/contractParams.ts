import { NetworkName } from '@coinweb/wallet-lib/enums';

import { ERC20Currency, EvmCurrency } from '../types';

import { Currency } from './enums.ts';
import { ERC20_TOKENS, EVM_TOKENS } from './settings.ts';

type CommonNames =
  | 'NETWORK_NAME'
  | `L2_CONTRACT_ADDRESS_${'BASE' | 'MAKER'}`
  | `L2_OWNER_MIN_FEE_${'BASE' | 'MAKER'}`
  | `L2_OWNER_PERCENTAGE_FEE_${'BASE' | 'MAKER'}`;

type EvmNames =
  | `L1_CONTRACT_ADDRESS_${'BASE' | 'MAKER'}`
  | `L1_CONTRACT_ABI_${'BASE' | 'MAKER'}`
  | `L1_CALL_METHOD_NAME_${'BASE' | 'MAKER'}`;

type ERC20Names = 'L1_TOKEN_ADDRESS';

type HexString = `0x${string}`;

type ParameterPossibleTypes = 'string' | 'number' | 'NetworkName' | 'HexString';

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
} as const satisfies Record<CommonNames, ParameterPossibleTypes>;

const evmParamsMap = {
  //C1
  L1_CONTRACT_ADDRESS_BASE: 'HexString',
  L1_CONTRACT_ABI_BASE: 'string',
  L1_CALL_METHOD_NAME_BASE: 'string',
  //C2

  L1_CONTRACT_ADDRESS_MAKER: 'HexString',
  L1_CONTRACT_ABI_MAKER: 'string',
  L1_CALL_METHOD_NAME_MAKER: 'string',
} as const satisfies Record<EvmNames, ParameterPossibleTypes>;

const ERC20ParamsMap = { L1_TOKEN_ADDRESS: 'HexString' } as const satisfies Record<
  ERC20Names,
  'string' | 'number' | 'HexString'
>;

type CommonParamsMap = typeof commonParamsMap;
type CommonParamName = keyof CommonParamsMap;

type EvmParamsMap = CommonParamsMap & typeof evmParamsMap;
type EvmParamName = keyof EvmParamsMap;

type ERC20ParamsMap = CommonParamsMap & EvmParamsMap & typeof ERC20ParamsMap;
type ERC20ParamName = keyof ERC20ParamsMap;

type ParameterType<PossibleType extends ParameterPossibleTypes> = PossibleType extends 'string'
  ? string
  : PossibleType extends 'HexString'
    ? HexString
    : PossibleType extends 'number'
      ? number
      : NetworkName;

type ContractParams = {
  [C in Currency]: C extends EvmCurrency
    ? {
        [N in EvmParamName]: ParameterType<ERC20ParamsMap[N]>;
      }
    : C extends ERC20Currency
      ? {
          [N in ERC20ParamName]: ParameterType<ERC20ParamsMap[N]>;
        }
      : {
          [N in CommonParamName]: ParameterType<CommonParamsMap[N]>;
        };
};

const extractParam = (currency: Currency, name: unknown) => {
  const paramsMap = (() => {
    switch (true) {
      case (ERC20_TOKENS as Currency[]).includes(currency):
        return { ...commonParamsMap, ...evmParamsMap, ...ERC20ParamsMap };
      case (EVM_TOKENS as Currency[]).includes(currency):
        return { ...commonParamsMap, ...evmParamsMap };

      default:
        return commonParamsMap;
    }
  })();

  const paramName = name as keyof typeof paramsMap;

  console.log('name', name);
  console.log('currency', currency)
  console.log('env param', `VITE_${name}_${currency}`);

  const param = process.env[`VITE_${name}_${currency}`] as NetworkName || '0x0' as NetworkName;

  console.log('param', param)

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

const checkIsCurrency = (value: unknown): value is Currency => (Object.values(Currency) as unknown[]).includes(value);

export const CONTRACT_PARAMS = new Proxy(
  {},
  {
    get(currencyParams: Record<string, unknown>, currency) {
      if (!checkIsCurrency(currency)) {
        throw new Error(`Unknown token ${String(currency)}`);
      }
      if (currency in currencyParams) {
        return currencyParams[currency as keyof typeof currencyParams];
      } else if ((Object.values(Currency) as (string | symbol)[]).includes(currency)) {
        currencyParams[currency] = new Proxy(
          {},
          {
            get(params: Record<string | symbol, unknown>, paramName) {
              if (paramName in params) {
                return params[paramName as keyof typeof params];
              } else {
                params[paramName] = extractParam(currency, paramName);

                return params[paramName];
              }
            },
          },
        );

        return currencyParams[currency];
      }
    },
  },
) as ContractParams;
