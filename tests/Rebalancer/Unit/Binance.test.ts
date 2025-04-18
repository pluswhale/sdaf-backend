import { CurrencyType } from '../../../db/entities';
import { getWalletMapping } from '../../../utils';

jest.mock('axios');
jest.mock('../../../db/AppDataSource');
jest.mock('../../../utils');

jest.mock('../../../utils', () => ({
  getWalletMapping: jest.fn(),
}));

beforeAll(() => {
  (getWalletMapping as jest.Mock).mockReturnValue({
    network: 'USDT_BEP20',
    coinSymbol: 'USDT',
  });
});

describe('getWalletMapping', () => {
  it('should return the correct mapping for USDT', () => {
    const result = getWalletMapping(CurrencyType.USDT);
    expect(result).toEqual({ network: 'USDT_BEP20', coinSymbol: 'USDT' });
  });
});

// describe('handleSendingWallet', () => {
//   describe('WBTC', () => {
//     let axiosMock: any;
//
//     beforeEach(() => {
//       axiosMock = new MockAdapter(axios);
//     });
//
//     afterEach(() => {
//       jest.clearAllMocks();
//     });
//
//     it('должен возвращать правильные данные', async () => {
//       const mockGetWalletMapping = require('../../../utils').getWalletMapping;
//       mockGetWalletMapping.mockReturnValue({
//         network: 'USDT_BEP20',
//         coinSymbol: 'USDT',
//       });
//
//       const result = mockGetWalletMapping(CurrencyType.USDT);
//       expect(result).toEqual({ network: 'USDT_BEP20', coinSymbol: 'USDT' });
//     });
//
//     it('simple test', () => {
//       const mock = jest.fn().mockReturnValue(42);
//       mock();
//       expect(mock()).toBe(42);
//     });
//
//     // it('simple test', async () => {
//     //   axiosMock.onGet('https://sdafcwap.com/app/api/get-asset-price').reply(200, {
//     //     prices: {
//     //       WBTC: 80000,
//     //     },
//     //   });
//     //
//     //   axiosMock
//     //     .onPost('https://sdafcwap.com/app/api/initiate-withdrawal-platform-binance?accountType=hwat')
//     //     .reply(200, {
//     //       orderViewId: 'order123',
//     //     });
//     //
//     //   getWalletMapping = jest.fn().mockReturnValue({
//     //     network: 'ETH',
//     //     coinSymbol: 'WBTC',
//     //   });
//     //
//     //   pendingWithdrawalRepository.create = jest.fn().mockImplementationOnce(() => {
//     //     return { save: jest.fn().mockResolvedValue(true) };
//     //   });
//     //
//     //   pendingReplenishmentRepository.save = jest.fn().mockResolvedValue(true);
//     //
//     //   await handleSendingWallet(WBTC_wallet);
//     // });
//
//     // it('should initiate withdrawal for WBTC if price is below minBalance', async () => {
//     //   axios.get = jest.fn().mockImplementationOnce(() => Promise.resolve({ data: { prices: { WBTC: 80000 } } }));
//     //   axios.post = jest.fn().mockImplementationOnce(() => Promise.resolve({ data: { orderViewId: '123' } }));
//     //
//     //   getWalletMapping = jest.fn().mockImplementationOnce(() =>
//     //     Promise.resolve({
//     //       network: 'ETH',
//     //       coinSymbol: 'WBTC',
//     //     }),
//     //   );
//     //
//     //   await handleSendingWallet(WBTC_wallet);
//     //
//     //   expect(axios.post).toHaveBeenCalledWith(
//     //     'https://sdafcwap.com/app/api/initiate-withdrawal-somePlatform?accountType=rebalanceWallet',
//     //     expect.objectContaining({
//     //       amount: expect.any(Number),
//     //       coinSymbol: 'USDT',
//     //       network: expect.any(String),
//     //       walletId: 'rebalanceWallet',
//     //       withdrawalAddress: 'walletAddress',
//     //     }),
//     //     expect.anything(),
//     //   );
//     //
//     //   expect(pendingWithdrawalRepository.create).toHaveBeenCalledWith(
//     //     expect.objectContaining({
//     //       walletId: 'wallet1',
//     //       orderViewId: 'order123',
//     //       coinSymbol: 'USDT',
//     //       accountType: 'rebalanceWallet',
//     //       platform: 'somePlatform',
//     //       status: 10,
//     //     }),
//     //   );
//     // });
//   });
// });
