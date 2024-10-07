export {};
// describe('convertBigIntToString', () => {
//   it('should convert bigint to string with fixed-point 8 decimals', () => {
//     expect(convertBigIntToString(BigInt('123456789'), Currency.BTC)).toBe('1.23456789');
//     expect(convertBigIntToString(BigInt('100000000'), Currency.BTC)).toBe('1.00000000');
//     expect(convertBigIntToString(BigInt('123456789012345678'), Currency.BTC)).toBe('1234567890.12345678');
//   });
// });
//
// describe('estimatedToReceive', () => {
//   it('should return correct estimated value for BTC to USDT', () => {
//     const result = estimatedToReceive(Currency.BTC, Currency.USDT_ETH, BigInt(1_0000_0000));
//
//     expect(result.estimated).toBe(BigInt(57837_4000_0000));
//     expect(result.networkFeeUsd).toBe('0.21');
//     expect(result.exchangeFeeUsd).toBe('4.50');
//   });
//
//   it('should return correct estimated value for USDT to BTC', () => {
//     const result = estimatedToReceive(Currency.USDT_ETH, Currency.BTC, BigInt(57837_4000_0000));
//
//     expect(result.estimated).toBe(BigInt(1_0000_0000));
//     expect(result.networkFeeUsd).toBe('0.22');
//     expect(result.exchangeFeeUsd).toBe('4.02');
//   });
//
//   it('should return correct estimated value for ETH to USDT', () => {
//     const result = estimatedToReceive(Currency.ETH, Currency.USDT_ETH, BigInt(1_0000_0000));
//
//     expect(result.estimated).toBe(BigInt(3112_6600_0000));
//     expect(result.networkFeeUsd).toBe('0.20');
//     expect(result.exchangeFeeUsd).toBe('4.20');
//   });
//
//   it('should return correct estimated value for USDT to ETH', () => {
//     const result = estimatedToReceive(Currency.USDT_ETH, Currency.ETH, BigInt(31_1266_0000));
//
//     expect(result.estimated).toBe(BigInt(100_0000));
//     expect(result.networkFeeUsd).toBe('4.20');
//     expect(result.exchangeFeeUsd).toBe('4.02');
//   });
//
//   it('should convert via usdt for other pairs', () => {
//     const result = estimatedToReceive(Currency.BNB, Currency.BTC, BigInt(1_0000_0000));
//
//     expect(result.estimated).toBe(BigInt(1));
//     // expect(result.estimated).toBe(BigInt(90_9128));
//     // expect(result.networkFeeUsd).toBe('0.22');
//     // expect(result.exchangeFeeUsd).toBe('4.02');
//   });
// });
//
// describe('convertStringToBigInt', () => {
//   it('should convert string with decimal to bigint with up to 8 decimals', () => {
//     expect(convertStringToBigInt('1.23456789', Currency.BNB)).toBe(BigInt('1234567890000000000'));
//     expect(convertStringToBigInt('1.00000000', Currency.USDT_ETH)).toBe(BigInt('1000000'));
//     expect(convertStringToBigInt('1234567890.12345678', Currency.ETH)).toBe(BigInt('1234567890123456780000000000'));
//   });
//
//   it('should handle strings with less than 8 decimal places', () => {
//     expect(convertStringToBigInt('1.23', Currency.USDT_ETH)).toBe(BigInt('1230000'));
//     expect(convertStringToBigInt('1.2', Currency.ETH)).toBe(BigInt('1200000000000000000'));
//   });
//
//   it('should handle strings with more than 8 decimal places by truncating', () => {
//     expect(convertStringToBigInt('1.234567891234', Currency.ETH)).toBe(BigInt('1234567891234000000'));
//   });
//
//   it('should handle strings without decimal places', () => {
//     expect(convertStringToBigInt('1', Currency.USDT_ETH)).toBe(BigInt('1000000'));
//     expect(convertStringToBigInt('1234567890', Currency.BNB)).toBe(BigInt('1234567890000000000000000000'));
//   });
// });
