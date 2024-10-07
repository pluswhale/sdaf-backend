export declare enum Key {
    STATE = "STATE",
    FUNDS = "FUNDS",
    USER_INDEX = "USER_INDEX",
    DATE_INDEX = "DATE_INDEX",
    BEST_BY_QUOTE_INDEX = "BEST_BY_QUOTE_INDEX",
    ACTIVE_INDEX = "ACTIVE_INDEX",
    CLOSED_INDEX = "CLOSED_INDEX",
    ERROR_INDEX = "ERROR_INDEX",
    UNIQUENESS_CHECK = "UNIQUENESS_CHECK",
    CONTRACT_OWNER = "CONTRACT_OWNER"
}
export declare enum ACTIVITY_STATUS {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLING = "CANCELLING",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED",
    ERROR = "ERROR"
}
export declare enum PAYMENT_STATUS {
    PAYABLE = "PAYABLE",
    NOT_PAYABLE = "NOT_PAYABLE",
    PAID = "PAID"
}
export declare enum PUBLIC_METHODS {
    CREATE_POSITION = "0x01",
    CANCEL_POSITION = "0x02",
    CHANGE_CONTRACT_OWNER = "0x03"
}
export declare const FEE: {
    CREATE_POSITION: bigint;
    CANCEL_POSITION: bigint;
};
export declare enum CallType {
    Accept = 128,
    Transfer = 129
}
export declare const BTC_MAIN_NET: {
    bech32: string;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
};
export declare const BTC_TEST_NET: typeof BTC_MAIN_NET;
export declare const BtcShardNetwork: {
    btc: {
        bech32: string;
        pubKeyHash: number;
        scriptHash: number;
        wif: number;
    };
    tbtc: {
        bech32: string;
        pubKeyHash: number;
        scriptHash: number;
        wif: number;
    };
};
