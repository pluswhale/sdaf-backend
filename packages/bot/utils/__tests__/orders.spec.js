export {};
// describe('filterDustOrder', () => {
//   it('should return true for orders where the rounded product of tokenRatioL1ToCweb and remainingCwebAmount is greater than 0', () => {
//     const order = {
//       tokenRatioL1ToCweb: 0.1,
//       remainingCwebAmount: 20n,
//     } as UIMarketOrderAsk;
//
//     expect(filterDustOrder(order)).toBe(true);
//   });
//
//   it('should return false for orders where the rounded product of tokenRatioL1ToCweb and remainingCwebAmount is 0', () => {
//     const order = {
//       tokenRatioL1ToCweb: 0.00001,
//       remainingCwebAmount: 1n,
//     } as UIMarketOrderBid;
//
//     expect(filterDustOrder(order)).toBe(false);
//   });
// });
//
// describe('sortByOrdersRatio', () => {
//   it('should correctly sort orders in ascending order of tokenRatioL1ToCweb', () => {
//     const orders = [
//       { tokenRatioL1ToCweb: 0.2, remainingCwebAmount: 50n },
//       { tokenRatioL1ToCweb: 0.1, remainingCwebAmount: 100n },
//       { tokenRatioL1ToCweb: 0.3, remainingCwebAmount: 20n },
//     ] as UIMarketOrderAsk[];
//
//     const sortedOrders = orders.sort(sortByOrdersRatio('asc'));
//
//     expect(sortedOrders[0].tokenRatioL1ToCweb).toBe(0.1);
//     expect(sortedOrders[1].tokenRatioL1ToCweb).toBe(0.2);
//     expect(sortedOrders[2].tokenRatioL1ToCweb).toBe(0.3);
//   });
//
//   it('should correctly sort orders in descending order of tokenRatioL1ToCweb', () => {
//     const orders = [
//       { tokenRatioL1ToCweb: 0.2, remainingCwebAmount: 50n },
//       { tokenRatioL1ToCweb: 0.1, remainingCwebAmount: 100n },
//       { tokenRatioL1ToCweb: 0.3, remainingCwebAmount: 20n },
//     ] as UIMarketOrderBid[];
//
//     const sortedOrders = orders.sort(sortByOrdersRatio('desc'));
//
//     expect(sortedOrders[0].tokenRatioL1ToCweb).toBe(0.3);
//     expect(sortedOrders[1].tokenRatioL1ToCweb).toBe(0.2);
//     expect(sortedOrders[2].tokenRatioL1ToCweb).toBe(0.1);
//   });
//
//   it('should handle an empty array', () => {
//     const orders: UIMarketOrderAsk[] = [];
//
//     const sortedOrders = orders.sort(sortByOrdersRatio('asc'));
//
//     expect(sortedOrders).toEqual([]);
//   });
// });
