import * as mappingModule from '../../../utils/mapping';
import {
  handleReceivingWallet,
  handleSendingWallet,
  pendingReplenishmentRepository,
  pendingWithdrawalRepository,
  walletRepository,
  WalletType,
} from '../../../middlewares/walletScheduler';
import { CurrencyType } from '../../../db/entities';
import { cryptoPairs } from './Mocks/Mocks';
import { fetchUsdPrices } from '../../../controllers/transactions/getAssetPrice';
import { initiateBinanceWithdraw } from '../../../controllers/binanceApi/initiateWithdrawalBinance';
import { getBinanceDepositAddress } from '../../../controllers/binanceApi/getDepositAddressBinance';
import { makeTransaction } from '../../../controllers/makeRebalancerTransaction';

jest.mock('../../../utils/mapping');
jest.mock('../../../controllers/binanceApi/getDepositAddressBinance');
jest.mock('../../../controllers/makeRebalancerTransaction');
jest.mock('../../../controllers/binanceApi/initiateWithdrawalBinance');
jest.mock('../../../controllers/transactions/getAssetPrice');
jest.mock('../../../middlewares/walletScheduler', () => {
  const originalModule = jest.requireActual('../../../middlewares/walletScheduler');

  const mockPendingWithdrawalRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockPendingReplenishmentRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockWalletRepo = {
    update: jest.fn(),
  };

  originalModule.pendingWithdrawalRepository = mockPendingWithdrawalRepo;
  originalModule.pendingReplenishmentRepository = mockPendingReplenishmentRepo;
  originalModule.walletRepository = mockWalletRepo;
  return originalModule;
});

function makeWallet(overrides?: Partial<WalletType>): WalletType {
  const defaults: WalletType = {
    id: '1',
    wallet_type: 'sending',
    wallet_name: 'a',
    minBalance: '10',
    maxBalance: '100',
    price: { usd: '5' },
    currency_type: CurrencyType.WBTC,
    rebalancingWallet: 'hwat',
    rebalancingPlatform: 'binance',
    pub_key: '1234',
    path: '',
    address: '0x9671f6e0f9932145464713ae877ce8f4795f6158',
  };

  return {
    ...defaults,
    ...(overrides || {}),
  };
}

describe('Rebalancer', () => {
  const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  const spyError = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  describe('handleSendingWallet', () => {
    cryptoPairs.forEach((el: any) => {
      describe(el.currencyType, () => {
        beforeEach(() => {
          jest.clearAllMocks();
        });

        it('should skip if minBalance or maxBalance invalid', async () => {
          const w = makeWallet({ minBalance: '0', maxBalance: '0', currency_type: el.currencyType });
          await handleSendingWallet(w);
          expect(spyLog).toHaveBeenCalledWith(`Skipping the wallet ${w.id}: minBalance and maxBalance incorrect.`);
          expect(fetchUsdPrices).not.toHaveBeenCalled();
        });

        it('should skip if no valid price.usd', async () => {
          const w = makeWallet({ price: {} as any, currency_type: el.currencyType });
          await handleSendingWallet(w);
          expect(spyLog).toHaveBeenCalledWith(`Skipping the wallet ${w.id}: There is no valid field price.usd`);
          expect(fetchUsdPrices).not.toHaveBeenCalled();
        });

        it('should skip if priceUsd >= minBalance', async () => {
          const w = makeWallet({ price: { usd: '20' }, currency_type: el.currencyType });
          await handleSendingWallet(w);
          expect(spyLog).toHaveBeenCalledWith(
            `Wallet ${w.id}: Current price 20 USD >= minBalance 10, no replenishment required.`,
          );
          expect(fetchUsdPrices).not.toHaveBeenCalled();
        });

        it('should call axios.post and save pendingWithdrawal on successful flow', async () => {
          (mappingModule.getWalletMapping as jest.Mock).mockReturnValue({
            network: el.network,
            coinSymbol: el.coinSymbol,
          });
          (fetchUsdPrices as jest.Mock).mockReturnValue({
            [el.symbolPrice]: el.currencyType.startsWith('USD') ? 1 : 80000,
          });
          (initiateBinanceWithdraw as jest.Mock).mockReturnValue({ data: { id: '123' } });
          (pendingWithdrawalRepository.create as jest.Mock).mockImplementation((o) => o);

          const w = makeWallet({
            minBalance: '50',
            maxBalance: '150',
            price: { usd: '10' },
            currency_type: el.currencyType,
          });
          await handleSendingWallet(w);

          expect(fetchUsdPrices).toHaveBeenCalled();

          // amountToWithdraw = 150 - 10 = 140;
          // cryptoPrice = 1 → 140 / 1 = 140; precision for WBTC = 2 → 140.00
          const expectedPayload = {
            amount: el.currencyType.startsWith('USD') ? 140 : 0.00175,
            coinSymbol: el.symbolPrice,
            network: el.network,
            walletId: 'hwat',
            withdrawalAddress: w.address,
          };
          expect(initiateBinanceWithdraw).toHaveBeenCalledWith(expectedPayload, w.rebalancingWallet);

          expect(pendingWithdrawalRepository.create).toHaveBeenCalledWith({
            walletId: w.id,
            orderViewId: '123',
            coinSymbol: w.currency_type.split('_')[0],
            accountType: 'hwat',
            platform: 'binance',
            status: 10,
          });
          expect(pendingWithdrawalRepository.save).toHaveBeenCalled();
        });

        it('should disable rebalancing on known error code from platform', async () => {
          (mappingModule.getWalletMapping as jest.Mock).mockReturnValue({
            network: el.network,
            coinSymbol: el.coinSymbol,
          });
          (fetchUsdPrices as jest.Mock).mockResolvedValue({ data: { prices: { [el.currencyType]: 1 } } });
          const fakeError = {
            response: { data: { details: { code: -4035 } } },
            message: 'bad',
          };
          (initiateBinanceWithdraw as jest.Mock).mockRejectedValue(fakeError);

          const w = makeWallet({
            minBalance: '20',
            maxBalance: '100',
            price: { usd: '5' },
            currency_type: el.currencyType,
          });
          await handleSendingWallet(w);

          expect(walletRepository.update).toHaveBeenCalledWith(w.id, {
            isRebalancingActive: false,
          });
        });
      });
    });
  });

  describe('handleReceivingWallet', () => {
    cryptoPairs.forEach((el: any) => {
      describe(el.currencyType, () => {
        beforeEach(() => {
          jest.clearAllMocks();
        });

        it('should take gepositAddress, create a transaction and save pendingReplenishment on successful flow', async () => {
          const w = makeWallet({
            rebalancingWallet: 'panchoSpot',
            minBalance: '50',
            maxBalance: '150',
            price: { usd: '200' },
            currency_type: el.currencyType,
          });

          const depositAddressPayload = {
            walletId: w.rebalancingWallet,
            coinSymbol: el.coinSymbol,
            network: el.network,
          };

          const expectedPayload = {
            pub_key: w.pub_key,
            from: w.address,
            to: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc',
            amount: el.currencyType.startsWith('USD') ? 150 : 0.001875,
            currencyType: w.currency_type,
          };

          (mappingModule.getWalletMapping as jest.Mock).mockReturnValue({
            network: el.network,
            coinSymbol: el.coinSymbol,
          });

          (getBinanceDepositAddress as jest.Mock).mockReturnValue({
            data: { address: '0x4214310f69c582fc94a819db7f8b2ad5b840c4cc' },
          });

          (makeTransaction as jest.Mock).mockReturnValue('1111');

          (fetchUsdPrices as jest.Mock).mockReturnValue({
            [el.symbolPrice]: el.currencyType.startsWith('USD') ? 1 : 80000,
          });

          (pendingReplenishmentRepository.create as jest.Mock).mockImplementation((o) => o);

          await handleReceivingWallet(w);

          expect(getBinanceDepositAddress).toHaveBeenCalledWith(depositAddressPayload, w.rebalancingWallet);
          expect(makeTransaction).toHaveBeenCalledWith(expectedPayload);

          expect(fetchUsdPrices).toHaveBeenCalled();

          expect(pendingReplenishmentRepository.create).toHaveBeenCalledWith({
            walletId: w.id,
            orderViewId: '1111',
            coinSymbol: w.currency_type.split('_')[0],
            accountType: 'panchoSpot',
            platform: 'binance',
            status: 10,
          });
          expect(pendingReplenishmentRepository.save).toHaveBeenCalled();
          jest.resetAllMocks();
        });
      });
    });
  });
});
