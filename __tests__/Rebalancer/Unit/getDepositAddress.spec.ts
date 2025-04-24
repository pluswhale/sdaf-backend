import { getDepositAddress } from './Func/getDepositAddress';
import { generateCryptoPairsDepAdd } from './Mocks/Mocks';

jest.setTimeout(10000);

describe('getDepositAddress', () => {
  describe('PanchoSPOT', () => {
    const cryptoPairsDepAddPanchoSpot = generateCryptoPairsDepAdd('panchoSpot');
    cryptoPairsDepAddPanchoSpot.forEach((el: any) => {
      it(el.currencyType, async () => {
        const walletData = {
          coinSymbol: el.currencyType,
          account: 'panchoSpot',
        };

        const res = await getDepositAddress(walletData);

        expect(res).toBe(el.address);
      });
    });
  });

  describe('HWAT', () => {
    const cryptoPairsDepAddHwat = generateCryptoPairsDepAdd('hwat');
    cryptoPairsDepAddHwat.forEach((el: any) => {
      it(el.currencyType, async () => {
        const walletData = {
          coinSymbol: el.currencyType,
          account: 'hwat',
        };

        const res = await getDepositAddress(walletData);

        expect(res).toBe(el.address);
      });
    });
  });
});
