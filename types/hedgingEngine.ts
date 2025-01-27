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
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey: string;
      scriptpubkey_asm: string;
      scriptpubkey_type: string;
      scriptpubkey_address: string;
      value: number;
    };
    scriptsig: string;
    scriptsig_asm: string;
    witness: string[];
    is_coinbase: boolean;
    sequence: number;
    inner_redeemscript_asm: string;
  }>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
  }>;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
};

export type BinanceOrders = 'BTCUSDT' | 'BNBUSDT' | 'USDTBNB' | 'USDTBTC';

export type OrdersWithTxs = {
  symbol: string;
  direction: string;
  transactions: any[];
};

export type HeObjectForSavingInDb =  {
  txHash: string;
  pairSwapDirectionOnSwap?: string;
  l1SwapAmount?: string;
  l2SwapAmount?: string;
  orderTypeOnBinance?: string;
  priceSettledToUser?: string;
  priceHedgedOnBinance?: string;
  marginValue?: string;
  profitFromSwap?: string;
}