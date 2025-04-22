import axios from 'axios';

export const getDepositAddress = async (walletData: any) => {
  try {
    return (
      await axios.post('https://sdafcwap.com/app/api/get-deposit-address-binance?accountType=panchoSpot', walletData)
    ).data.DepositAddress;
  } catch (error: any) {
    throw new Error(error);
  }
};
