import { getBitcoinBalance } from '../../../../utils';
import { checkBalanceTRX } from '../balanceTRX';
import { getEVMBalance } from '../EVMBalance';

export const SUPPORTED_CURRENCIES: { [key: string]: Function } = {
  BNB: getEVMBalance,
  ETH: getEVMBalance,
  TRX: getEVMBalance,
  BTC: getBitcoinBalance,
  USDT_BEP20: getEVMBalance,
  USDT_ERC20: checkBalanceTRX,
  USDT_TRC20: checkBalanceTRX,
};

export const TOKEN_CONTRACTS: { [key: string]: string } = {
  USDT_BEP20: '0x55d398326f99059fF775485246999027B3197955',
  USDT_ERC20: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDT_TRC20: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
};
