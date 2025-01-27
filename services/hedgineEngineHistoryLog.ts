import { HedgineEngineLog } from '../db/entities/HedgineEngineLog';
import { AppDataSource } from '../db/AppDataSource';

const heLogsRepository = AppDataSource.getRepository(HedgineEngineLog);

export const getHedgineEngineHistoryLogByTxId = async (txHash: string): Promise<HedgineEngineLog | null> => {
  return await heLogsRepository.findOne({ where: { txHash } });
};

export const createHedgineEngineLogWithOrderIdFromBinance = async (
  values: {
    txHash: string;
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


  if (!values.txHash) {
    return null;
  }


  const heCurrentHistoryLog = new HedgineEngineLog();


  heCurrentHistoryLog.txHash = values.txHash;

  

  if (values) {
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

  }

    heCurrentHistoryLog.fullfil = true;

    return await heLogsRepository.save(heCurrentHistoryLog);;
};

export const editHedgineEngineHistoryLog = async (
  txHash: string,
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
  const heCurrentHistoryLog = await getHedgineEngineHistoryLogByTxId(txHash);

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

