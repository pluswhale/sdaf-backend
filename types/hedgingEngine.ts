import { Direction } from './enum';

export type UsdtTransaction = {
  blockNumber: string;
  blockHash: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  methodId: string;
  functionName: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  txreceipt_status: string;
  gasUsed: string;
  confirmations: string;
  isError: string;
}

export type BtcTransaction = {
  txid: string,
  version: number,
  locktime: number,
  vin: [ [Object] ],
  vout: [ [Object], [Object] ],
  size: number,
  weight: number,
  fee: number,
  status: { confirmed: boolean }
}

export type BinanceOrders = 'BTCUSDT' | 'BNBUSDT' | 'USDTBNB' | 'USDTBTC';

export type OrdersWithTxs = {
  symbol: string;
  direction: string;
  transactions: any[];
};

export type HeObjectForSavingInDb =  {
  pairSwapDirectionOnSwap?: string;
  l1SwapAmount?: string;
  l2SwapAmount?: string;
  orderTypeOnBinance?: string;
  priceSettledToUser?: string;
  priceHedgedOnBinance?: string;
  marginValue?: string;
  profitFromSwap?: string;
}