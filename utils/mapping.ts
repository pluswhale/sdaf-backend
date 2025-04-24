import { CurrencyType } from '../db/entities/Wallet';
import { CoinSymbol, Network } from '../types/enum';

interface WalletMapping {
  network: Network;
  coinSymbol: CoinSymbol;
}

export function getWalletMapping(currencyType: CurrencyType): WalletMapping | null {
  switch (currencyType) {
    case CurrencyType.USDT:
      return { network: Network.USDT_BEP20, coinSymbol: CoinSymbol.USDT };
    case CurrencyType.USDT_ERC20:
      return { network: Network.USDT_ERC20, coinSymbol: CoinSymbol.USDT_ERC20 };
    case CurrencyType.USDT_BEP20:
      return { network: Network.USDT_BEP20, coinSymbol: CoinSymbol.USDT_BEP20 };
    case CurrencyType.USDT_TRC20:
      return { network: Network.USDT_TRC20, coinSymbol: CoinSymbol.USDT_TRC20 };
    case CurrencyType.USDC_ERC20:
      return { network: Network.ETH, coinSymbol: CoinSymbol.USDC_ERC20 };
    case CurrencyType.USDC_BEP20:
      return { network: Network.BNB, coinSymbol: CoinSymbol.USDC_BEP20 };
    case CurrencyType.BTC:
      return { network: Network.BTC, coinSymbol: CoinSymbol.BTC };
    case CurrencyType.BNB:
      return { network: Network.BNB, coinSymbol: CoinSymbol.BNB };
    case CurrencyType.ETH:
      return { network: Network.ETH, coinSymbol: CoinSymbol.ETH };
    case CurrencyType.TRX:
      return { network: Network.TRX, coinSymbol: CoinSymbol.TRX };
    case CurrencyType.WBTC:
      return { network: Network.WBTC, coinSymbol: CoinSymbol.WBTC };
    default:
      console.error(`Unknown type wallet: ${currencyType}`);
      return null;
  }
}
