import { AppDataSource } from '../db/AppDataSource';
import { FinaliseObjectForSavingInDb, HeObjectForSavingInDb } from '../types/hedgingEngine';
import { FinaliseLog, HedgineEngineLog } from '../db/entities';

const heLogsRepository = AppDataSource.getRepository(HedgineEngineLog);
const finaliseLogRepository = AppDataSource.getRepository(FinaliseLog);

export const getHedgineEngineHistoryLogByTxId = async (txHash: string): Promise<HedgineEngineLog | null> => {
  return await heLogsRepository.findOne({ where: { txHash } });
};

export const getFinaliseLogByTxId = async (txHash: string): Promise<FinaliseLog | null> => {
  return await finaliseLogRepository.findOne({ where: { txHash } });
};

export const createHedgineEngineLogWithOrderIdFromBinance = async ({
  txHash,
  fromCoin,
  toCoin,
  l1SwapAmount,
  l2SwapAmount,
  direction,
  targetWalletAddress,
  priceSettledToUser,
  profitFromSwap,
  priceHedgedOnBinance,
  amountSettledToUser,
  amountHedged,
  margin,
  isBuyBacked,
}: HeObjectForSavingInDb): Promise<HedgineEngineLog | null> => {
  if (!txHash) {
    return null;
  }

  const heCurrentHistoryLog = new HedgineEngineLog();

  heCurrentHistoryLog.txHash = txHash;
  heCurrentHistoryLog.fromCoin = fromCoin || null;
  heCurrentHistoryLog.toCoin = toCoin || null;
  heCurrentHistoryLog.l1SwapAmount = l1SwapAmount || null;
  heCurrentHistoryLog.l2SwapAmount = l2SwapAmount || null;
  heCurrentHistoryLog.direction = direction || null;
  heCurrentHistoryLog.targetWalletAddress = targetWalletAddress as string;
  heCurrentHistoryLog.priceHedgedOnBinance = priceHedgedOnBinance || null;
  heCurrentHistoryLog.priceSettledToUser = priceSettledToUser || null;
  heCurrentHistoryLog.amountSettledToUser = amountSettledToUser || null;
  heCurrentHistoryLog.amountHedged = amountHedged || null;
  heCurrentHistoryLog.margin = margin;
  heCurrentHistoryLog.profitFromSwap = profitFromSwap || null;
  heCurrentHistoryLog.isBuyBacked = isBuyBacked;

  return await heLogsRepository.save(heCurrentHistoryLog);
};

export const createFinaliseLog = async ({
  txHash,
  currency,
  l1SwapAmount,
}: FinaliseObjectForSavingInDb): Promise<FinaliseLog | null> => {
  if (!txHash) {
    return null;
  }

  try {
    const finaliseCurrentHistoryLog = new FinaliseLog();

    finaliseCurrentHistoryLog.txHash = txHash;
    finaliseCurrentHistoryLog.l1SwapAmount = l1SwapAmount || null;
    finaliseCurrentHistoryLog.currency = currency || null;

    return await finaliseLogRepository.save(finaliseCurrentHistoryLog);
  } catch (e) {
    console.log('Error creating final log', e);

    return  null;
  }


};

// export const editHedgineEngineHistoryLog = async (
//   txHash: string,
//   values: {
//     pairSwapDirectionOnSwap?: string;
//     l1SwapAmount?: string;
//     l2SwapAmount?: string;
//     orderTypeOnBinance?: string;
//     priceSettledToUser?: string;
//     priceHedgedOnBinance?: string;
//     marginValue?: string;
//     profitFromSwap?: string;
//   },
// ): Promise<HedgineEngineLog | null> => {
//   const heCurrentHistoryLog = await getHedgineEngineHistoryLogByTxId(txHash);

//   if (values && heCurrentHistoryLog) {
//     if (values.pairSwapDirectionOnSwap) {
//       heCurrentHistoryLog.pairSwapDirectionOnSwap = values.pairSwapDirectionOnSwap;
//     }

//     if (values.l1SwapAmount) {
//       heCurrentHistoryLog.l1SwapAmount = values.l1SwapAmount;
//     }

//     if (values.l2SwapAmount) {
//       heCurrentHistoryLog.l2SwapAmount = values.l2SwapAmount;
//     }

//     if (values.orderTypeOnBinance) {
//       heCurrentHistoryLog.orderTypeOnBinance = values.orderTypeOnBinance;
//     }

//     if (values.priceHedgedOnBinance) {
//       heCurrentHistoryLog.priceHedgedOnBinance = values.priceHedgedOnBinance;
//     }

//     if (values.priceHedgedOnBinance) {
//       heCurrentHistoryLog.priceHedgedOnBinance = values.priceHedgedOnBinance;
//     }

//     if (values.priceSettledToUser) {
//       heCurrentHistoryLog.priceSettledToUser = values.priceSettledToUser;
//     }

//     if (values.marginValue) {
//       heCurrentHistoryLog.marginValue = values.marginValue;
//     }

//     if (values.profitFromSwap) {
//       heCurrentHistoryLog.profitFromSwap = values.profitFromSwap;
//     }

//     heCurrentHistoryLog.fullfil = true;

//     await heLogsRepository.save(heCurrentHistoryLog);
//   }

//   return heCurrentHistoryLog;
// };
