import { sendCwebInterface } from '@coinweb/contract-kit';
export const { constructSendCweb } = sendCwebInterface();
export const constructConditional = ((condition, ops, altOps = []) => {
    if (!condition) {
        if (Array.isArray(altOps)) {
            return altOps;
        }
        return [altOps];
    }
    if (Array.isArray(ops)) {
        return ops;
    }
    return [ops];
});
