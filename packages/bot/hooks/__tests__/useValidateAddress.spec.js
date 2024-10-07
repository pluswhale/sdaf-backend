export {};
// describe('useValidateAddress hook', () => {
//   it('should return true for a valid Bitcoin address', () => {
//     const validateAddress = useValidateAddress();
//
//     bitcoinAddressesMocks.forEach((address) => {
//       expect(validateAddress(address.address, Currency.BTC)).toStrictEqual(true);
//     });
//   });
//
//   it('should return false for a invalid Bitcoin address', () => {
//     const validateAddress = useValidateAddress();
//
//     expect(validateAddress('something', Currency.BTC)).toStrictEqual(false);
//     expect(validateAddress('1DJJoJ4sxwJdwExOsoDg8qXL1FEozDGQEF', Currency.BTC)).toStrictEqual(false);
//     expect(validateAddress('1DJJoJ4sxwJdwExIsoDg8qXL1FEozDGQEF', Currency.BTC)).toStrictEqual(false);
//   });
//
//   it('should return true for a valid Evm address', () => {
//     const validateAddress = useValidateAddress();
//
//     ethAddressesMocks.forEach((address) => {
//       expect(validateAddress(address.address, Currency.ETH, { strict: false })).toStrictEqual(true);
//
//       expect(validateAddress(address.address, Currency.ETH)).toStrictEqual(true);
//       expect(validateAddress(address.address.toLowerCase(), Currency.ETH)).toStrictEqual(true);
//
//       const alteredAddress = '0x'.concat(address.address.toUpperCase().slice(2));
//
//       expect(validateAddress(alteredAddress, Currency.ETH, { strict: false })).toStrictEqual(true);
//     });
//   });
//
//   it('should return false for a invalid Evm address', () => {
//     const validateAddress = useValidateAddress();
//
//     expect(validateAddress('something', Currency.ETH)).toStrictEqual(false);
//
//     ethAddressesMocks.forEach((address) => {
//       // 0x becomes 0X
//       expect(validateAddress(address.address.toUpperCase(), Currency.ETH)).toStrictEqual(false);
//
//       if (address.address.slice(-5) !== '00000') {
//         const alteredAddress = '0x'.concat(address.address.toUpperCase().slice(4)).concat('ab');
//
//         expect(validateAddress(alteredAddress, Currency.ETH, { strict: true })).toStrictEqual(false);
//       }
//     });
//   });
// });
