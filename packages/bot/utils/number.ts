export const bigIntToDecimals18String = (value: bigint) => {
  const decString = value.toString(10).padStart(19, '0');

  return `${decString.slice(0, -18)}.${decString.slice(-18)}`.replace(/\.?0+$/, '');
};

export const intToHexString = (d: number | null, padding: number) => {
  let hex = Number(d).toString(16);

  while (hex.length < padding) {
    hex = `0${hex}`;
  }

  return `0x${hex}`;
};

export function eFix(number: string | number) {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(number));
}

function getNewRound(number: number, lenNumber: number, decRound: number, percentRound: number) {
  if (lenNumber < decRound) return decRound;
  const newNumber: number = Number(number.toFixed(lenNumber));
  const percent100: number = 100;
  const percent = (newNumber / number) * percent100 - percent100;

  if (Math.abs(percent) <= percentRound) {
    lenNumber = getNewRound(newNumber, lenNumber - 1, decRound, percentRound);
  } else {
    lenNumber += 1;
  }

  return lenNumber;
}

export function round(number: string | number, decRound: number, percentRound: number = 1) {
  if (Number(number) === 0) {
    return '0';
  }

  const fixedNumber = eFix(number);
  const doubleNumber = fixedNumber.split('.');

  if (doubleNumber.length < 2) {
    return fixedNumber;
  }

  const lenNumber = doubleNumber[1].length;
  const roundNumber = getNewRound(Number(fixedNumber), lenNumber, decRound, percentRound);

  if (roundNumber > lenNumber) {
    return eFix(fixedNumber);
  }

  const newNumber = fixedNumber.substr(0, doubleNumber[0].length + roundNumber + 1);

  return eFix(newNumber);
}

export function calculateRatioFromBigInts(amount1: bigint, amount2: bigint) {
  if (amount2 === 0n) {
    return 0;
  }

  return Number(amount1) / Number(amount2);
}

export function calculateAmountFromRatio(amount: bigint, ratio: number): bigint {
  const amountAsNumber = Number(amount);
  const result = amountAsNumber * ratio;
  const roundedResult = Math.round(result); // round to the nearest integer, possible loss of precision

  return BigInt(roundedResult);
}
