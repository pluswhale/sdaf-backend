export const USDT_ABI = [
  {
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const TOKEN_TRC20_ABI = [
  {
    outputs: [{ type: 'uint256' }],
    constant: true,
    inputs: [{ name: 'who', type: 'address' }],
    name: 'balanceOf',
    stateMutability: 'View',
    type: 'Function',
  },
  {
    outputs: [{ type: 'bool' }],
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    stateMutability: 'Nonpayable',
    type: 'Function',
  },
];
