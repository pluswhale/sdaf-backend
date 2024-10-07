export var Key;
(function (Key) {
    Key["STATE"] = "STATE";
    Key["FUNDS"] = "FUNDS";
    Key["USER_INDEX"] = "USER_INDEX";
    Key["DATE_INDEX"] = "DATE_INDEX";
    Key["BEST_BY_QUOTE_INDEX"] = "BEST_BY_QUOTE_INDEX";
    Key["ACTIVE_INDEX"] = "ACTIVE_INDEX";
    Key["CLOSED_INDEX"] = "CLOSED_INDEX";
    Key["ERROR_INDEX"] = "ERROR_INDEX";
    Key["UNIQUENESS_CHECK"] = "UNIQUENESS_CHECK";
    Key["CONTRACT_OWNER"] = "CONTRACT_OWNER";
})(Key || (Key = {}));
export var ACTIVITY_STATUS;
(function (ACTIVITY_STATUS) {
    ACTIVITY_STATUS["ACTIVE"] = "ACTIVE";
    ACTIVITY_STATUS["COMPLETED"] = "COMPLETED";
    ACTIVITY_STATUS["CANCELLING"] = "CANCELLING";
    ACTIVITY_STATUS["CANCELLED"] = "CANCELLED";
    ACTIVITY_STATUS["EXPIRED"] = "EXPIRED";
    ACTIVITY_STATUS["ERROR"] = "ERROR";
})(ACTIVITY_STATUS || (ACTIVITY_STATUS = {}));
export var PAYMENT_STATUS;
(function (PAYMENT_STATUS) {
    PAYMENT_STATUS["PAYABLE"] = "PAYABLE";
    PAYMENT_STATUS["NOT_PAYABLE"] = "NOT_PAYABLE";
    PAYMENT_STATUS["PAID"] = "PAID";
})(PAYMENT_STATUS || (PAYMENT_STATUS = {}));
export var PUBLIC_METHODS;
(function (PUBLIC_METHODS) {
    PUBLIC_METHODS["CREATE_POSITION"] = "0x01";
    PUBLIC_METHODS["CANCEL_POSITION"] = "0x02";
    PUBLIC_METHODS["CHANGE_CONTRACT_OWNER"] = "0x03";
})(PUBLIC_METHODS || (PUBLIC_METHODS = {}));
export const FEE = {
    CREATE_POSITION: 2000000n,
    CANCEL_POSITION: 1000000n,
};
export var CallType;
(function (CallType) {
    CallType[CallType["Accept"] = 128] = "Accept";
    CallType[CallType["Transfer"] = 129] = "Transfer";
})(CallType || (CallType = {}));
export const BTC_MAIN_NET = {
    bech32: 'bc',
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
};
export const BTC_TEST_NET = {
    bech32: 'tb',
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
};
export const BtcShardNetwork = {
    btc: BTC_MAIN_NET,
    tbtc: BTC_TEST_NET,
};
