import { Key } from './constants';
/* FirstPart */
export const createPositionStateFirstPart = () => [Key.STATE];
export const createPositionFundsFirstPart = () => [Key.FUNDS];
export const createDateIndexFirstPart = () => [Key.DATE_INDEX];
export const createBestByQuoteIndexFirstPart = () => [Key.BEST_BY_QUOTE_INDEX];
export const createActivePositionIndexFirstPart = () => [Key.ACTIVE_INDEX];
export const createBestByQuoteActiveIndexFirstPart = () => [Key.BEST_BY_QUOTE_INDEX, Key.ACTIVE_INDEX];
export const createUserIndexFirstPart = (user) => [Key.USER_INDEX, user];
export const createClosedIndexFirstPart = () => [Key.CLOSED_INDEX];
export const createOwnerFirstPart = () => [Key.CONTRACT_OWNER];
export const createUniquenessFirstPart = () => [Key.UNIQUENESS_CHECK];
export const createErrorByDateFirstPart = () => [Key.ERROR_INDEX, Key.DATE_INDEX];
/* Key */
export const createPositionStateKey = (positionId) => ({
    first_part: createPositionStateFirstPart(),
    second_part: [positionId],
});
export const createPositionFundsKey = (positionId) => ({
    first_part: createPositionFundsFirstPart(),
    second_part: [positionId],
});
export const createDateIndexKey = (timestamp, positionId) => ({
    first_part: createDateIndexFirstPart(),
    second_part: [Number.MAX_SAFE_INTEGER - timestamp, positionId],
});
export const createBestByQuoteIndexKey = (rate, positionId) => ({
    first_part: createBestByQuoteIndexFirstPart(),
    second_part: [rate.toString(16), positionId],
});
export const createActivePositionIndexKey = (timestamp, positionId) => ({
    first_part: createActivePositionIndexFirstPart(),
    second_part: [Number.MAX_SAFE_INTEGER - timestamp, positionId],
});
export const createBestByQuoteActiveIndexKey = (rate, positionId) => ({
    first_part: createBestByQuoteActiveIndexFirstPart(),
    second_part: [rate.toString(16), positionId],
});
export const createUserIndexKey = (user, timestamp, positionId) => ({
    first_part: createUserIndexFirstPart(user),
    second_part: [Number.MAX_SAFE_INTEGER - timestamp, positionId],
});
export const createClosedIndexKey = (positionId) => ({
    first_part: createClosedIndexFirstPart(),
    second_part: [positionId],
});
export const createOwnerKey = () => ({
    first_part: createOwnerFirstPart(),
    second_part: [],
});
export const createUniquenessKey = (data) => ({
    first_part: createUniquenessFirstPart(),
    second_part: data,
});
export const createBtcUtxoUniquenessKey = (data) => ({
    first_part: createUniquenessFirstPart(),
    second_part: [data.l1TxId, data.vout],
});
export const createErrorByDateKey = (timestamp, positionId) => ({
    first_part: createErrorByDateFirstPart(),
    second_part: [timestamp, positionId],
});
