import { Currency } from '../constants';
import {formatNumberWithPrecision} from "../utils";

type EstimatedResult = {
  estimated: bigint;
  networkFeeUsd: string;
  exchangeFeeUsd: string;
};

type BigIntHexString = string;

const conversionRates: {
  [key: string]: { rateMult: number; rateDiv: number; networkFeeUsd: string; exchangeFeeUsd: string };
} = {
  'BTC-USDT_ETH': { rateMult: 578374, rateDiv: 10, networkFeeUsd: '0.21', exchangeFeeUsd: '4.50' },
  'BNB-USDT_ETH': { rateMult: 525816, rateDiv: 1000, networkFeeUsd: '1.20', exchangeFeeUsd: '3.00' },
  'ETH-USDT_ETH': { rateMult: 311266, rateDiv: 100, networkFeeUsd: '0.20', exchangeFeeUsd: '4.20' },
  'USDT_ETH-BTC': { rateMult: 10, rateDiv: 578374, networkFeeUsd: '0.22', exchangeFeeUsd: '4.02' },
  'USDT_ETH-BNB': { rateMult: 1000, rateDiv: 525816, networkFeeUsd: '2.20', exchangeFeeUsd: '4.30' },
  'USDT_ETH-ETH': { rateMult: 100, rateDiv: 311266, networkFeeUsd: '4.20', exchangeFeeUsd: '4.02' },
  'USDT_ETH-USDT_ETH': { rateMult: 1, rateDiv: 1, networkFeeUsd: '1.20', exchangeFeeUsd: '4.03' },
  'BTC-USDT_BNB': { rateMult: 578374, rateDiv: 10, networkFeeUsd: '0.21', exchangeFeeUsd: '4.50' },
  'BNB-USDT_BNB': { rateMult: 525816, rateDiv: 1000, networkFeeUsd: '1.20', exchangeFeeUsd: '3.00' },
  'ETH-USDT_BNB': { rateMult: 311266, rateDiv: 100, networkFeeUsd: '0.20', exchangeFeeUsd: '4.20' },
  'USDT_BNB-BTC': { rateMult: 10, rateDiv: 578374, networkFeeUsd: '0.22', exchangeFeeUsd: '4.02' },
  'USDT_BNB-BNB': { rateMult: 1000, rateDiv: 525816, networkFeeUsd: '2.20', exchangeFeeUsd: '4.30' },
  'USDT_BNB-ETH': { rateMult: 100, rateDiv: 311266, networkFeeUsd: '4.20', exchangeFeeUsd: '4.02' },
  'USDT_BNB-USDT_BNB': { rateMult: 1, rateDiv: 1, networkFeeUsd: '1.20', exchangeFeeUsd: '4.03' },
  'USDT_ETH-USDT_BNB': { rateMult: 1, rateDiv: 1, networkFeeUsd: '1.20', exchangeFeeUsd: '4.03' },
  'USDT_BNB-USDT_ETH': { rateMult: 1, rateDiv: 1, networkFeeUsd: '1.20', exchangeFeeUsd: '4.03' },
  'ETH-ETH': { rateMult: 1, rateDiv: 1, networkFeeUsd: '2.20', exchangeFeeUsd: '4.02' },
  'BNB-BNB': { rateMult: 1, rateDiv: 1, networkFeeUsd: '1.20', exchangeFeeUsd: '4.01' },
};

export function decimalsForCurrency(currency: Currency): number {
  switch (currency) {
    case Currency.BTC:
      return 8;
    case Currency.USDT_ETH:
      return 6;
    case Currency.USDT_BNB:
      return 18;
    case Currency.ETH:
      return 18;
    case Currency.BNB:
      return 18;
    case Currency.CWEB:
      return 18;
    default:
      return 18;
  }
}

export function convertStringToBigInt(value: string, currency: Currency): bigint {
  const decimals = decimalsForCurrency(currency);
  const [integerPart, decimalPart = ''] = value.split('.');
  const decimalPartPadded = (decimalPart + '0'.repeat(decimals)).slice(0, decimals); // Ensure correct decimal places

  return BigInt(integerPart + decimalPartPadded);
}

export function convertBigIntToString(value: bigint | BigIntHexString, currency: Currency, roundedTo?: number): string {
  const decimals = decimalsForCurrency(currency);
  const integerPart = BigInt(value) / BigInt(10 ** decimals);
  const decimalPart = BigInt(value) % BigInt(10 ** decimals);

  if (roundedTo !== undefined && roundedTo >= 0) {
    const roundingFactor = BigInt(10 ** (decimals - roundedTo));
    const roundedDecimalPart = (decimalPart + roundingFactor / 2n) / roundingFactor;

    return `${integerPart}.${roundedDecimalPart.toString().padStart(roundedTo, '0')}`;
  }

  return `${integerPart}.${decimalPart.toString().padStart(decimals, '0')}`;
}

export const humanReadableStringFromTokenBigInt = (amount: bigint, token: Currency, precision = 10) => {
  return formatNumberWithPrecision(Number(convertBigIntToString(amount, token)), precision);
};

export function estimatedToReceive(
    inputCurrency: Currency,
    outputCurrency: Currency,
    inputValue: bigint,
): EstimatedResult {
  const key = `${inputCurrency}-${outputCurrency}`;
  const conversion = conversionRates[key];

  // Hardcode this because obscure how it works
  if (!(key in conversionRates)) {
    return {
      estimated: 1n,
      networkFeeUsd: '0.1',
      exchangeFeeUsd: '0.1',
    };
  }

  if (!conversion) {
    if (inputCurrency !== Currency.USDT_ETH && outputCurrency !== Currency.USDT_ETH) {
      const toUsdt = estimatedToReceive(inputCurrency, Currency.USDT_ETH, inputValue);

      return estimatedToReceive(Currency.USDT_ETH, outputCurrency, toUsdt.estimated);
    } else {
      if (inputCurrency !== Currency.USDT_BNB && outputCurrency !== Currency.USDT_BNB) {
        const toUsdt = estimatedToReceive(inputCurrency, Currency.USDT_BNB, inputValue);

        return estimatedToReceive(Currency.USDT_BNB, outputCurrency, toUsdt.estimated);
      } else throw new Error(`Unsupported currency pair ${inputCurrency}-${outputCurrency}`);
    }
  }

  return {
    estimated: (inputValue * BigInt(conversion.rateMult)) / BigInt(conversion.rateDiv),
    networkFeeUsd: conversion.networkFeeUsd,
    exchangeFeeUsd: conversion.exchangeFeeUsd,
  };
}

export function formatCurrencyNumber(amount: bigint, decimals: number): string {
  const scaledValue = amount / BigInt(10 ** decimals);
  let value;
  let suffix = '';

  if (scaledValue >= BigInt(1_000_000)) {
    value = (Number(scaledValue) / 1_000_000).toFixed(1);
    suffix = 'M';
  } else if (scaledValue >= BigInt(1_000)) {
    value = (Number(scaledValue) / 1_000).toFixed(1);
    suffix = 'k';
  } else {
    value = Number(scaledValue) >= 1 ? Number(scaledValue).toFixed(2) : Number(scaledValue).toString();
  }

  return `${value}${suffix}`;
}

export function formatCurrency(currency: Currency, amount: bigint, withCurrency: boolean = true): string {
  const decimals = decimalsForCurrency(currency);
  const formattedValue = formatCurrencyNumber(amount, decimals);

  if (withCurrency) {
    return `${formattedValue} ${currency}`;
  }

  return formattedValue;
}

export function convertToUsd(currency: Currency, amount: bigint): string {
  const estimatedResult = estimatedToReceive(currency, Currency.USDT_ETH, amount);
  const estimatedAmount = estimatedResult.estimated;

  const decimals = decimalsForCurrency(Currency.USDT_ETH);

  return formatCurrencyNumber(estimatedAmount, decimals);
}
