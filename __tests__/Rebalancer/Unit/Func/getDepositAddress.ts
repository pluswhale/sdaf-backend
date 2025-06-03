import { getWalletMapping } from '../../../../utils';
import { CurrencyType } from '../../../../db/entities';
import axios from 'axios';

interface walletDataType {
  coinSymbol: CurrencyType;
  account: string;
}

export const getDepositAddress = async (walletData: walletDataType) => {
  try {
    const mapping = getWalletMapping(walletData.coinSymbol);

    if (!mapping) {
      return null;
    }

    const params = {
      coinSymbol: mapping.coinSymbol,
    };

    return (
      await axios.post(
        `https://sdafcwap.com/app/api/get-deposit-address-binance?accountType=${walletData.account}`,
        params,
      )
    ).data.DepositAddress;
  } catch (error: any) {
    throw new Error(error);
  }
};
