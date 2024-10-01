import { creteNewPositionBtcUiCommand, creteNewPositionEvmUiCommand, cancelPositionUiCommand, toHex } from 'dex-app.cm/src/offchain/index.ts';
import {
  createOrderUiCommand,
  deleteOrderUiCommand,
  makeDepositUiCommand,
  makeWithdrawUiCommand,
} from 'market-maker.cm';


import { Currency, findDepositCurrency, depositAccount, getCurrencyForPair } from './const.ts';
import {convertStringToBigInt} from "../model/swap.ts";
import {CONTRACT_PARAMS} from "../constants/index.ts";
import {eFix} from "./number.ts";

export function contractOwnerFee(OWNER_MIN_FEE: any, OWNER_PERCENTAGE_FEE: any, fromValue?: any) {
  const minFee = BigInt(OWNER_MIN_FEE || 0);

  if (!OWNER_PERCENTAGE_FEE) {
    return minFee;
  }

  const calculatedOwnerPercentageFee =
      (BigInt((Number(fromValue) || 0) * Number(OWNER_PERCENTAGE_FEE)) * BigInt(1e18)) / 100n;

  return calculatedOwnerPercentageFee > minFee ? calculatedOwnerPercentageFee : minFee;
}

export const intToHexString = (d: number | null, padding: number) => {
  let hex = Number(d).toString(16);

  while (hex.length < padding) {
    hex = `0${hex}`;
  }

  return `0x${hex}`;
};

export async function convertInfoToCreateQr(symbol: string, ethDest: string, amount: number, price: number, chainData?: any) {
  const { currency1, currency2 } = getCurrencyForPair(symbol);

  if (currency1 === Currency.CWEB) {
    const contractParam = {
      contractId: currency2 !== 'CWEB' ? CONTRACT_PARAMS[currency2].L2_CONTRACT_ADDRESS_BASE : '',
      baseAmount: intToHexString(Number(convertStringToBigInt(eFix(String(amount)), Currency.CWEB)), 64),
      quoteAmount: intToHexString(Number(convertStringToBigInt(eFix(String(price)), currency2)), 64),
      recipient: ethDest,
      contractOwnerFee: '',
    };

    contractParam.contractOwnerFee = toHex(
        contractOwnerFee(
            currency2 !== 'CWEB' ? CONTRACT_PARAMS[currency2].L2_OWNER_MIN_FEE_BASE : '',
            currency2 !== 'CWEB' ? CONTRACT_PARAMS[currency2].L2_OWNER_PERCENTAGE_FEE_BASE : '',
        ),
    );
    if (currency2 === Currency.BTC) {
      const btcContractParam = {
        ...contractParam,
        chainData,
      };
      return creteNewPositionBtcUiCommand(btcContractParam);
    }

    return creteNewPositionEvmUiCommand(contractParam);
  } else {
    const contractParam = {
      contractId: '',
      baseRecipient: {
        auth: 'EcdsaContract',
        payload: ethDest, // it pubKey
      },
      l1Amount: convertStringToBigInt(eFix(String(amount)), currency1),
      baseAmount:  convertStringToBigInt(eFix(String(price)), Currency.CWEB),
    };

    contractParam.contractId = CONTRACT_PARAMS[currency1].L2_CONTRACT_ADDRESS_MAKER;

    return createOrderUiCommand(contractParam);
  }
}

export function convertInfoToCancelQr(positionId: string, symbol: string) {
  const { currency1, currency2 } = getCurrencyForPair(symbol);

  if (currency1 === Currency.CWEB) {
    return cancelPositionUiCommand({
      contractId: currency2 !== 'CWEB' ? CONTRACT_PARAMS[currency2].L2_CONTRACT_ADDRESS_BASE : '',
      positionId,
    });
  } else {
    return deleteOrderUiCommand({
      contractId: CONTRACT_PARAMS[currency1].L2_CONTRACT_ADDRESS_MAKER,
      orderId: positionId,
    });
  }
}

export function convertInfoToTransfer(fromAccount: string, toAccount: string, amount: bigint) {
  const accountFrom = depositAccount.indexOf(fromAccount);

  console.log(accountFrom, 'accountFrom');
  const accountTo = depositAccount.indexOf(toAccount);

  console.log(accountTo, 'accountTo');
  const currencyFrom = findDepositCurrency(accountFrom);
  const currencyTo = findDepositCurrency(accountTo);

  if (accountFrom !== -1 && accountTo !== -1) {
    throw new Error('not implement');
  }

  if (accountFrom === -1 && accountTo !== -1) {
    const contractId = currencyTo !== 'CWEB' ? CONTRACT_PARAMS[currencyTo].L2_CONTRACT_ADDRESS_MAKER : '';

    return makeDepositUiCommand({
      contractId,
      depositAmount: amount,
    });
  }

  if (accountFrom !== -1 && accountTo === -1) {
    const contractId = currencyFrom !== 'CWEB' ? CONTRACT_PARAMS[currencyFrom].L2_CONTRACT_ADDRESS_MAKER : '';

    return makeWithdrawUiCommand({
      contractId,
      withdrawAmount: amount,
    });
  }
  throw new Error('error not valid fromAccount and/or toAccount');
}
