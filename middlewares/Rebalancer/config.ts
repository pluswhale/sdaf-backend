export type StatusCodeType = {
  statusCodeWithdraw: number;
  statusCodeDeposit: number;
};

export const platformConfig = [
  {
    platform: 'binance',
    statusCode: {
      statusCodeWithdraw: 6,
      statusCodeDeposit: 1,
    },
  },
  {
    platform: 'ceffu',
    statusCode: {
      statusCodeWithdraw: 40,
      statusCodeDeposit: 40,
    },
  },
];

type Pw = {
  coinSymbol?: string;
  txId?: string;
  accountType?: string;
  orderViewId?: string;
};

export const getPlatformParams = (platform: string, pw: Pw): Record<string, string> => {
  switch (platform) {
    case 'binance':
      return {
        coinSymbol: pw.coinSymbol || '',
        txId: pw.orderViewId || '',
        accountType: pw.accountType || '',
      };
    case 'ceffu':
      return {
        orderViewId: pw.orderViewId || '',
      };
    default:
      return {};
  }
};

