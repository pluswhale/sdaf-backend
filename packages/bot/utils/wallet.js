/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { create_wallet as createWallet, from_hex_string as fromHexString, compose_ui_commands as composeUiCommand, create_tx_monitor as createTxMonitor, add_txs as addTxs, get_txs as getTxs, embed, sign, get_all_utxos as getAllUtxos, } from '@coinweb/wallet-lib';
import { mnemonicToHDKey } from './cwbBlockchain';
export const walletWithMnemonic = async (mnemonic, urlAddress) => {
    const address = urlAddress ? `${urlAddress}/wallet` : process.env.API_URL;
    //@ts-ignore
    const wsAddress = address.replace(/^https:/, 'wss:');
    const hdkey = mnemonicToHDKey(mnemonic);
    //enableLogging({ gql: true });
    const wallet = await createWallet({
        //@ts-ignore
        address,
        ws_address: wsAddress,
        pub_key: hdkey.publicKey.toString('hex'),
        shard: null,
        max_retry_time_secs: null,
        enable_retries: null,
        sign_callback: (msg) => {
            return sign(fromHexString(hdkey.privateKey.toString('hex')), msg);
        },
    });
    return wallet;
};
export async function sentComposeTokenCommand(wallet, jsonTokenCommand, networkWrite, txMonitor) {
    if (!wallet || !jsonTokenCommand)
        throw new Error('wallet or command not found');
    if (!networkWrite)
        networkWrite = null;
    const utxoAllStart = await getAllUtxos(txMonitor);
    console.log(utxoAllStart, 'utxoAllStart sentComposeTokenCommand');
    const l2TransactionData = await composeUiCommand(wallet, [jsonTokenCommand], networkWrite);
    const newTxs = await addTxs(txMonitor, l2TransactionData?.l2_transaction);
    const utxoAllEnd = await getAllUtxos(txMonitor);
    console.log(utxoAllEnd, 'utxoAllEnd sentComposeTokenCommand');
    return { l2TransactionData, newTxs };
}
export async function sentEmbed(wallet, l2Transaction) {
    try {
        if (!wallet || !l2Transaction)
            throw new Error('wallet or l2Transaction not found');
        const uuid = await embed(wallet, l2Transaction);
        console.log(uuid, 'uuid');
        return uuid;
    }
    catch (error) {
        console.log(error, 'error');
        throw error;
    }
}
export default async function sentTxMonitor() {
    try {
        const pendingTxs = [];
        const utxos = [];
        const txMonitor = createTxMonitor(pendingTxs, utxos);
        return txMonitor;
    }
    catch (error) {
        console.error(error);
        // eslint-disable-next-line no-console
        console.log(error, 'error');
        return '';
    }
}
export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function getInfoL2Txs(createTxMonitor, inputId) {
    const getNewTxs = await getTxs(createTxMonitor, inputId);
    return getNewTxs;
}
const ITER_CONST = 60;
export async function timerStatus(txMonitor, newTxs, iter = 0) {
    if (iter > ITER_CONST)
        return 'TimeOut';
    iter += 1;
    const getNewTxs = await getInfoL2Txs(txMonitor, newTxs[0].input_id);
    console.log(iter, 'iter');
    console.log(getNewTxs, 'getNewTxs');
    if ((getNewTxs.length > 0 && getNewTxs[0]) &&
        (getNewTxs[0].status === 'L2Confirmed' || getNewTxs[0].status === 'L2Unknown' || getNewTxs[0].status === 'Error')) {
        console.log('success iter', iter);
        return getNewTxs[0].status;
    }
    await sleep(1000);
    return await timerStatus(txMonitor, newTxs, iter);
}
