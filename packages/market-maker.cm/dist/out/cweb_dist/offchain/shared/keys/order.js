import { Key } from '../constants.js';
export const createOrderStateFirstPart = () => [Key.ORDER_STATE];
export const createOrderCollateralFirstPart = () => [Key.ORDER_COLLATERAL];
export const createOrderDateIndexFirstPart = () => [Key.ORDER_DATE_INDEX];
export const createBestOrderIndexFirstPart = () => [Key.ORDER_BEST_INDEX];
export const createActiveOrderIndexFirstPart = () => [Key.ORDER_ACTIVE_INDEX];
export const createBestActiveOrderIndexFirstPart = () => [Key.ORDER_BEST_INDEX, Key.ORDER_ACTIVE_INDEX];
export const createOrderByOwnerIndexFirstPart = (user) => [Key.ORDER_OWNER_INDEX, user];
export const createBestOrderByOwnerIndexFirstPart = (user) => [Key.ORDER_BEST_INDEX, Key.ORDER_OWNER_INDEX, user];
export const createOrderClosedIndexFirstPart = () => [Key.ORDER_CLOSED_INDEX];
export const createPendingOrderByOwnerIndexFirstPart = (user) => [
    Key.ORDER_PENDING_INDEX,
    Key.ORDER_OWNER_INDEX,
    user,
];
export const createOrderStateKey = (id) => ({
    first_part: createOrderStateFirstPart(),
    second_part: [id],
});
export const createOrderCollateralKey = (id) => ({
    first_part: createOrderCollateralFirstPart(),
    second_part: [id],
});
export const createOrderDateIndexKey = (timestamp, id) => ({
    first_part: createOrderDateIndexFirstPart(),
    second_part: [Number.MAX_SAFE_INTEGER - timestamp, id],
});
export const createBestOrderIndexKey = (rate, id) => ({
    first_part: createBestOrderIndexFirstPart(),
    second_part: [rate.toString(16), id],
});
export const createActiveOrderIndexKey = (timestamp, id) => ({
    first_part: createActiveOrderIndexFirstPart(),
    second_part: [Number.MAX_SAFE_INTEGER - timestamp, id],
});
export const createBestActiveOrderIndexKey = (rate, id) => ({
    first_part: createBestActiveOrderIndexFirstPart(),
    second_part: [rate.toString(16), id],
});
export const createOrderByOwnerIndexKey = (user, timestamp, id) => ({
    first_part: createOrderByOwnerIndexFirstPart(user),
    second_part: [Number.MAX_SAFE_INTEGER - timestamp, id],
});
export const createPendingOrderByOwnerIndexKey = (user, timestamp, id) => ({
    first_part: createPendingOrderByOwnerIndexFirstPart(user),
    second_part: [Number.MAX_SAFE_INTEGER - timestamp, id],
});
export const createBestOrderByOwnerIndexKey = (rate, user, id) => ({
    first_part: createBestOrderByOwnerIndexFirstPart(user),
    second_part: [rate.toString(16), id],
});
export const createClosedOrderIndexKey = (id) => ({
    first_part: createOrderClosedIndexFirstPart(),
    second_part: [id],
});
