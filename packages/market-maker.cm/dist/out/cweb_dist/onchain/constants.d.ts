import { ClaimIssuer } from '@coinweb/contract-kit';
export declare const CONSTANTS: {
    ORDER_LIFE_TIME: number;
    REQUEST_LIFE_TIME: number;
    L1_EXECUTE_EVENT_SIGNATURE: string;
    JUMP_CONTRACT_ID: string;
    JUMP_CONTRACT_METHOD: string;
    BLOCK_HEIGHT_INFO_PROVIDER: "L2BlockInfoProvider";
    L1_EVENT_INFO_PROVIDER: ClaimIssuer;
};
export declare const PRIVATE_METHODS: {
    CREATE_ORDER: string;
    CHANGE_ORDER: string;
    CLOSE_ORDER: string;
    CHANGE_CONTRACT_OWNER: string;
    HANDLE_EXECUTION_BLOCK_TRIGGERED: string;
    DEPOSIT: string;
    WITHDRAW: string;
    PREPARE_EXECUTION_REQUEST: string;
    CREATE_EXECUTION_REQUEST: string;
};
