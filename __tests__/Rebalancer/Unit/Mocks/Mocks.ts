import { CurrencyType } from '../../../../db/entities';
import { CoinSymbol, Network } from '../../../../types/enum';

const getAddressMapping = (account: 'panchoSpot' | 'hwat') => {
  return account === 'panchoSpot' ? AddressesPanchoSpot : AddressesHwat;
};

export const AddressesPanchoSpot: { [key: string]: string } = {
  BTC: '1LuYJMNUbwJAasupgHPbDknyRrd4KfMb55',
  LTC: 'LVA8tyVLSZVGk8X73xKpY2i9Kq7myzqJuD',
  WBTC: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc',
  ETH: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc',
  BNB: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc',
  TRX: 'TRheGt1kov7ddMwXzph3VwZZiWX8LYRYS8',
  USD1_BEP20: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc',
  USD1_ERC20: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc',
  USDT_ERC20: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc',
  USDT_BEP20: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc',
  USDT_TRC20: 'TRheGt1kov7ddMwXzph3VwZZiWX8LYRYS8',
  USDC_BEP20: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc',
  USDC_ERC20: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc',
} as const;

export const AddressesHwat: { [key: string]: string } = {
  BTC: '1k2Y8527cuRAVxSidrr2kJtHhGXwnrc9d',
  LTC: 'LVaAeX8yMJMmMaDQFbMjF22n6Aduj3mKtk',
  WBTC: '0xe0fcf473042e5522b4c0d63ab32d38c625eda868',
  ETH: '0xe0fcf473042e5522b4c0d63ab32d38c625eda868',
  BNB: '0xe0fcf473042e5522b4c0d63ab32d38c625eda868',
  TRX: 'TFwZBr5K97CkmHpGMEUrkEiANL6ayhxvpV',
  USD1_BEP20: '0xe0fcf473042e5522b4c0d63ab32d38c625eda868',
  USD1_ERC20: '0xe0fcf473042e5522b4c0d63ab32d38c625eda868',
  USDT_ERC20: '0xe0fcf473042e5522b4c0d63ab32d38c625eda868',
  USDT_BEP20: '0xe0fcf473042e5522b4c0d63ab32d38c625eda868',
  USDT_TRC20: 'TFwZBr5K97CkmHpGMEUrkEiANL6ayhxvpV',
  USDC_BEP20: '0xe0fcf473042e5522b4c0d63ab32d38c625eda868',
  USDC_ERC20: '0xe0fcf473042e5522b4c0d63ab32d38c625eda868',
} as const;

export const cryptoPairs = Object.values(CurrencyType)
  .filter((currencyType) => !currencyType.endsWith('_T') && !currencyType.endsWith('_CT'))
  .map((currencyType) => {
    const network = Network[currencyType as keyof typeof Network] || null;
    const coinSymbol = CoinSymbol[currencyType as keyof typeof CoinSymbol] || null;

    return {
      currencyType,
      network,
      coinSymbol,
      symbolPrice: currencyType.split('_')[0],
    };
  });

export const generateCryptoPairsDepAdd = (account: 'panchoSpot' | 'hwat') => {
  const addressMapping = getAddressMapping(account);

  return Object.values(CurrencyType)
    .filter((currencyType) => !currencyType.endsWith('_T') && !currencyType.endsWith('_CT') && currencyType !== 'USDT')
    .map((currencyType) => {
      const address = addressMapping[currencyType as keyof typeof addressMapping] || null;
      return {
        currencyType,
        address,
      };
    });
};
