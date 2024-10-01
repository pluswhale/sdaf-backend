export default [
  {
    type: 'P2PKH (Legacy)',
    scriptType: 'Pay to Public Key Hash',
    encoding: 'Base58Check',
    prefix: '1',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Valid P2PKH address
  },
  {
    type: 'P2SH (Script)',
    scriptType: 'Pay to Script Hash',
    encoding: 'Base58Check',
    prefix: '3',
    address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', // Valid P2SH address
  },
  {
    type: 'P2WPKH (SegWit)',
    scriptType: 'Pay to Witness Public Key Hash',
    encoding: 'Bech32',
    prefix: 'bc1q',
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', // Valid P2WPKH address (without zeroes)
  },
  {
    type: 'P2WSH (SegWit)',
    scriptType: 'Pay to Witness Script Hash',
    encoding: 'Bech32',
    prefix: 'bc1q',
    address: 'bc1q02kv5g3c424ngvmln3xd3t54lv377yeq85aeyt2tpfj386mdgursv29h8x', // Valid P2WSH address (without zeroes)
  },
  {
    type: 'P2TR (Taproot)',
    scriptType: 'Pay to Taproot',
    encoding: 'Bech32m',
    prefix: 'bc1p',
    address: 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297',
  },
];
