export const filterDustOrder = (order) => {
    return Math.round(order.tokenRatioL1ToCweb * Number(order.remainingCwebAmount)) > 0;
};
export const sortByOrdersRatio = (direction = 'asc') => (a, b) => {
    if (direction === 'asc') {
        return a.tokenRatioL1ToCweb - b.tokenRatioL1ToCweb;
    }
    return b.tokenRatioL1ToCweb - a.tokenRatioL1ToCweb;
};
