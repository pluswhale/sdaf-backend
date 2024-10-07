export const bigIntToDecimals18String = (value) => {
    const decString = value.toString(10).padStart(19, '0');
    return `${decString.slice(0, -18)}.${decString.slice(-18)}`.replace(/\.?0+$/, '');
};
export const intToHexString = (d, padding) => {
    let hex = Number(d).toString(16);
    while (hex.length < padding) {
        hex = `0${hex}`;
    }
    return `0x${hex}`;
};
export function eFix(number) {
    const formattedValue = String(number).toLowerCase();
    const valueHasExponentIndex = formattedValue.indexOf('e');
    if (valueHasExponentIndex !== -1) {
        const enNumber = new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(number));
        return enNumber.toString();
    }
    else {
        return number.toString();
    }
}
function getNewRound(number, lenNumber, decRound, percentRound) {
    if (lenNumber < decRound)
        return decRound;
    const newNumber = Number(number.toFixed(lenNumber));
    const percent100 = 100;
    const percent = (newNumber / number) * percent100 - percent100;
    if (Math.abs(percent) <= percentRound) {
        lenNumber = getNewRound(newNumber, lenNumber - 1, decRound, percentRound);
    }
    else {
        lenNumber += 1;
    }
    return lenNumber;
}
export function formatNumberWithPrecision(number, decRound, percentRound = 1) {
    const numericValue = Number(number);
    if (numericValue === 0) {
        return '0';
    }
    const fixedNumber = numericValue.toFixed(decRound); // round to decRound
    const trimmedNumber = parseFloat(fixedNumber).toString(); // trailing zeroes are removed
    const doubleNumber = trimmedNumber.split('.');
    if (doubleNumber.length < 2) {
        return trimmedNumber;
    }
    const lenNumber = doubleNumber[1].length;
    const roundNumber = getNewRound(numericValue, lenNumber, decRound, percentRound);
    if (roundNumber > lenNumber) {
        return parseFloat(trimmedNumber).toString();
    }
    const newNumber = trimmedNumber.substr(0, doubleNumber[0].length + roundNumber + 1);
    return parseFloat(newNumber).toString();
}
export function calculateRatioFromBigInts(amount1, amount2) {
    if (amount2 === 0n) {
        return 0;
    }
    return Number(amount1) / Number(amount2);
}
export function calculateAmountFromRatio(amount, ratio) {
    const amountAsNumber = Number(amount);
    const result = amountAsNumber * ratio;
    const roundedResult = Math.round(result); // round to the nearest integer, possible loss of precision
    return BigInt(roundedResult);
}
