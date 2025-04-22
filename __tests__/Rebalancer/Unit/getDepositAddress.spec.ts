import { getDepositAddress } from './Func/getDepositAddress';
import { CoinSymbol } from '../../../types/enum';

jest.setTimeout(10000);

describe('getDepositAddress', () => {
  it('should return real WBTC depositAddress ', async () => {
    const walletData = {
      coinSymbol: CoinSymbol.WBTC,
    };

    const res = await getDepositAddress(walletData);

    expect(res).toBe('0x4214310f69c582fc94a819db7f8b2ad5b840c4cc');
  });
});
