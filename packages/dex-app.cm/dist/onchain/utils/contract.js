import { getContextGenesis, getContextSystem, getParameters } from '@coinweb/contract-kit';
const { l2_shard_mining_time: miningTime } = getContextGenesis();
export const getExpectedBlockHeight = (futureDate) => {
    const { block_height: currentHeight } = getContextSystem();
    const now = getTime();
    const miningPeriod = miningTime.secs * 1000 + miningTime.nanos / 1_000_000;
    if (now >= futureDate) {
        return currentHeight;
    }
    return currentHeight + Math.trunc((futureDate - now) / miningPeriod);
};
export function getInstanceParameters(l1Type) {
    const parameters = getParameters('contract/parameters.json');
    if (l1Type && parameters.l1_type !== l1Type) {
        throw new Error('Internal error: Cannot get instance parameters');
    }
    return parameters;
}
export const getTime = () => {
    const { nanos_since_epoch: nanos, secs_since_epoch: secs } = getContextSystem().block_time;
    const time = secs * 1000 + nanos / 1_000_000;
    return time;
};
