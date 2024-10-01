import { getMethodArguments as cKitGetMethodArguments, extractContractArgs, getParameters, extractContractInfo, constructContractIssuer, getContractId, constructContractRef, extractUser, extractRead, getContextSystem, getQueueAuthenticated, } from '@coinweb/contract-kit';
export const getMethodArguments = (context) => cKitGetMethodArguments(context).slice(1);
export const getContractArguments = (context) => extractContractArgs(context.tx);
export const getInstanceParameters = () => getParameters('contract/parameters.json');
export const getCallParameters = (context) => {
    const { authenticated, providedCweb } = extractContractInfo(context.tx);
    if (!providedCweb) {
        throw new Error('Cweb was not provided');
    }
    return {
        availableCweb: providedCweb,
        authInfo: authenticated,
    };
};
export const getContractIssuer = (context) => constructContractIssuer(getContractId(context.tx));
export const getContractRef = (context) => constructContractRef(getContractIssuer(context), []);
export const getUser = (context) => extractUser(getQueueAuthenticated(context.tx));
let contractArguments = null;
export const getReadClaimByIndex = (context) => (index) => {
    if (!contractArguments) {
        contractArguments = extractContractArgs(context.tx);
    }
    if (!contractArguments[index]) {
        return null;
    }
    return extractRead(contractArguments[index])?.[0]?.content || null;
};
export const getTime = () => {
    const { nanos_since_epoch: nanos, secs_since_epoch: secs } = getContextSystem().block_time;
    const time = secs * 1000 + nanos / 1_000_000;
    return time;
};
