import { getDepositAddress } from './Func/getDepositAddress';
import { CurrencyType } from '../../../db/entities';

jest.setTimeout(10000);

describe('getDepositAddress', () => {
  describe('PanchoSPOT', () => {
    it('should return real WBTC depositAddress ', async () => {
      const walletData = {
        coinSymbol: CurrencyType.WBTC,
        account: 'panchoSpot',
      };

      const res = await getDepositAddress(walletData);

      expect(res).toBe('0x4214310f69c582fc94a819db7f8b2ad5b840c4cc');
    });
  });

  describe('HWAT', () => {
    it('should return real WBTC depositAddress ', async () => {
      const walletData = {
        coinSymbol: CurrencyType.WBTC,
        account: 'hwat',
      };

      const res = await getDepositAddress(walletData);

      expect(res).toBe('0xe0fcf473042e5522b4c0d63ab32d38c625eda868');
    });
  });
});
