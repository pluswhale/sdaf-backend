import { getBitcoinBalance } from '../../../../utils';
import { checkBalanceTRX } from '../balanceTRX';
import { getEVMBalance } from '../EVMBalance';
import { getLTCBalance } from '../../../../utils/LTC/getLTCBalance';

export const SUPPORTED_CURRENCIES: { [key: string]: Function } = {
  BNB: getEVMBalance,
  ETH: getEVMBalance,
  POL: getEVMBalance,
  TRX: checkBalanceTRX,
  BTC: getBitcoinBalance,
  LTC: getLTCBalance,
  USD1_BEP20: getEVMBalance,
  USD1_ERC20: getEVMBalance,
  USDT_BEP20: getEVMBalance,
  USDT_ERC20: getEVMBalance,
  USDT_TRC20: checkBalanceTRX,
  WBTC: getEVMBalance,
  USDC_ERC20: getEVMBalance,
  USDC_BEP20: getEVMBalance,
};

export const TOKEN_CONTRACTS: { [key: string]: string } = {
  USD1_BEP20: '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d',
  USD1_ERC20: '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d',
  USDT_BEP20: '0x55d398326f99059fF775485246999027B3197955',
  USDT_ERC20: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  USDT_TRC20: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  USDC_ERC20: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDC_BEP20: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
};
