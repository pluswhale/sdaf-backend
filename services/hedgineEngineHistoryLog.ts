import { HedgineEngineLog } from '../db/entities/HedgineEngineLog';
import { AppDataSource } from '../db/AppDataSource';

const heLogsRepository = AppDataSource.getRepository(HedgineEngineLog);

export const getHedgineEngineHistoryLogByTxId = async (txHash: string): Promise<HedgineEngineLog | null> => {
  return await heLogsRepository.findOne({ where: { txHash } });
};

export const createHedgineEngineLogWithOrderIdFromBinance = async (
  txHash: string,
): Promise<HedgineEngineLog | null> => {
  if (!txHash) {
    return null;
  }
  const heLog = new HedgineEngineLog();

  heLog.txHash = txHash;

  await heLogsRepository.save(heLog);

  return heLog;
};

export const editHedgineEngineHistoryLog = async (
  orderIdFromBinance: string,
  values: {
    pairSwapDirectionOnSwap?: string;
    l1SwapAmount?: string;
    l2SwapAmount?: string;
    orderTypeOnBinance?: string;
    priceSettledToUser?: string;
    priceHedgedOnBinance?: string;
    marginValue?: string;
    profitFromSwap?: string;
  },
): Promise<HedgineEngineLog | null> => {
  const heCurrentHistoryLog = await getHedgineEngineHistoryLogByTxId(orderIdFromBinance);

  if (values && heCurrentHistoryLog) {
    if (values.pairSwapDirectionOnSwap) {
      heCurrentHistoryLog.pairSwapDirectionOnSwap = values.pairSwapDirectionOnSwap;
    }

    if (values.l1SwapAmount) {
      heCurrentHistoryLog.l1SwapAmount = values.l1SwapAmount;
    }

    if (values.l2SwapAmount) {
      heCurrentHistoryLog.l2SwapAmount = values.l2SwapAmount;
    }

    if (values.orderTypeOnBinance) {
      heCurrentHistoryLog.orderTypeOnBinance = values.orderTypeOnBinance;
    }

    if (values.priceHedgedOnBinance) {
      heCurrentHistoryLog.priceHedgedOnBinance = values.priceHedgedOnBinance;
    }

    if (values.priceHedgedOnBinance) {
      heCurrentHistoryLog.priceHedgedOnBinance = values.priceHedgedOnBinance;
    }

    if (values.priceSettledToUser) {
      heCurrentHistoryLog.priceSettledToUser = values.priceSettledToUser;
    }

    if (values.marginValue) {
      heCurrentHistoryLog.marginValue = values.marginValue;
    }

    if (values.profitFromSwap) {
      heCurrentHistoryLog.profitFromSwap = values.profitFromSwap;
    }

    heCurrentHistoryLog.fullfil = true;

    await heLogsRepository.save(heCurrentHistoryLog);
  }

  return heCurrentHistoryLog;
};

