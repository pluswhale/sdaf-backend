import { HedgineEngineLog } from '../db/entities/HedgineEngineLog';
import { AppDataSource } from '../db/AppDataSource';
import { getMarginByPrice } from '../db/repos/marginRepo';
import { HeObjectForSavingInDb } from '../types/hedgingEngine';

const heLogsRepository = AppDataSource.getRepository(HedgineEngineLog);

export const getHedgineEngineHistoryLogByTxId = async (txHash: string): Promise<HedgineEngineLog | null> => {
  return await heLogsRepository.findOne({ where: { txHash } });
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
  margin }: HeObjectForSavingInDb
): Promise<HedgineEngineLog | null> => {


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
  heCurrentHistoryLog.fulfilled = true;

  return await heLogsRepository.save(heCurrentHistoryLog);;
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

