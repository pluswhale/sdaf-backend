import { DepositRequestData, WithdrawRequestData, CreateOrderRequestData, CancelOrderRequestData } from './types';
export declare const makeDepositUiCommand: ({ contractId, depositAmount }: DepositRequestData) => string;
export declare const makeWithdrawUiCommand: ({ contractId, withdrawAmount }: WithdrawRequestData) => string;
export declare const createOrderUiCommand: ({ contractId, baseRecipient, l1Amount, baseAmount }: CreateOrderRequestData) => string;
export declare const deleteOrderUiCommand: ({ contractId, orderId }: CancelOrderRequestData) => string;
