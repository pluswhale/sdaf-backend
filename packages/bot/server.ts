import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { JsonRpcProvider } from '@ethersproject/providers';
import sentTxMonitor, { sleep, walletWithMnemonic } from './utils/wallet';
import { getAllMarketClaim, getAllUserPositions, getMarketMakerOrders } from './api';
import { ACTIVITY_STATUS, BtcChainData } from 'dex-app.cm';
import { Currency } from './constants';
import { chandeOrders, chandePositions, sendC2Claim } from './utils/botFunctionCcxt';
import { mnemonicToSeedSync } from 'bip39';
import HDKey from 'hdkey';
import { getBinancePrice, getTestPrices } from './utils/binanceApi';
import { getCwebPriceFromCoinGekko } from './utils/api';
import { get_all_utxos as getAllUtxos, get_failed_txs as getFailedTxs } from '@coinweb/wallet-lib';

dotenv.config();

const app = express();
const LIMIT = 100;
const INTERVAL = 5 * 60 * 1000;
const INTERVAL_PACT = 0.5 * 60 * 1000;
let timer = false;
let functionTimer = false;

let positionsMax = 3;
let startValue = 3;
let endValue = 5;
let percentC1 = 5;
let percentC2 = 5;
let percentDifferentC1 = 70;
let percentDifferentC2 = 70;
let mnemonic = 'priority supply couple broccoli balcony sort flag keep original wrong pottery version';
let ethWallet = '0x4B12DD8C725113122C5E8D1cbfDD0105C4016196';
let ethWalletPrivKey = '12685e9212dcd9426e4b297c6b4cfc5bbc5f8b9c9887e4314a929d859bc498a1';
let btcWalletDerivationPath = "m/49'/1'/0'/0/0";
let btcWalletMnemonic = 'opinion patrol tube angle early nature chaos sorry volume wrong forget once';
let btcWalletAddress = '2N2Qvsoib2diR3doYh2M7daFy6sGU5FBg43';
let collateralConst = 1;
let partialPercent = 80;
let saveTxMonitor: any = undefined;

let tokenPrice = {
    BTC: 0,
    ETH: 0,
    BNB: 0,
    CWEB: 1 / 0.0033072,
    LTC: 0,
    EGLD: 0,
    USDT_ETH: 0,
    USDT_BNB: 0,
};

// PORTED PROVIDERS FROM FRONTEND. may be will be used in future
// const DEVNET_L1A_CHAIN = {
//     id: 1892,
//     name: 'Devnet L1A',
//     rpcUrl: 'https://geth-devblue-l1a.coinhq.store/',
//     nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
// };
//
// const DEVNET_L1B_CHAIN = {
//     id: 1893,
//     name: 'Devnet L1B',
//     rpcUrl: 'https://geth-devblue-l1b.coinhq.store/',
//     nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
// };
//
// export const providers = {
//     L1A: new JsonRpcProvider(DEVNET_L1A_CHAIN.rpcUrl),
//     L1B: new JsonRpcProvider(DEVNET_L1B_CHAIN.rpcUrl),
// };
//
// export async function getL1ABlockNumber() {
//     const blockNumber = await providers.L1A.getBlockNumber();
//     console.log('Current block number on L1A:', blockNumber);
// }
//
//
// export async function getL1BBlockNumber() {
//     const blockNumber = await providers.L1B.getBlockNumber();
//     console.log('Current block number on L1B:', blockNumber);
// }
//
// export async function getBTCUTXOs(address: string) {
//     try {
//         const { data } = await axios.get(`https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`);
//         console.log('UTXOs:', data.txrefs);
//     } catch (error) {
//         console.error('Error fetching UTXOs:', error);
//     }
// }

// Route to start the bot
app.get('/start-bot', async (req, res) => {
    try {
        await startBot();
        res.send('Bot started');
    } catch (error) {
        res.status(500).send('Failed to start bot');
    }
});

// Route to stop the bot
app.get('/stop-bot', (req, res) => {
    stopBot();
    res.send('Bot stopped');
});

async function getTokenPrice(token: Currency | 'CWEB') {
    if (token === 'CWEB') {
        const cwebPrice = await getCwebPriceFromCoinGekko();
        tokenPrice.CWEB = cwebPrice ? 1 / cwebPrice : tokenPrice.CWEB;
        return cwebPrice ? 1 / cwebPrice : tokenPrice.CWEB;
    }
    if (token === Currency.USDT_BNB || token === Currency.USDT_ETH) return 1;
    console.log(token, 'token');
    const quotePair = token + 'USDT';
    const price = await getBinancePrice(quotePair);
    tokenPrice[token] = price ? 1 / price : tokenPrice[token];
    return price ? 1 / price : tokenPrice[token];
}

async function getValuePositions(token: Currency, isC2: boolean) {
    let end = endValue;
    if (startValue >= endValue) end = startValue;
    const moveFromPositions = positionsMax !== 1 ? (end - startValue) / (positionsMax - 1) : 0;
    const price = await getTokenPrice(token);
    const priceCWEB = await getTokenPrice('CWEB');
    const positionMas = [];

    for (let i = 0; i < positionsMax; i++) {
        const usdValue = startValue + moveFromPositions * i;
        const cwebToken = isC2
            ? (priceCWEB * usdValue * (100 + percentC2)) / 100
            : (priceCWEB * usdValue * (100 - percentC1)) / 100;
        const l1Token = price * usdValue;
        positionMas.push({
            id: i + 1,
            cweb: cwebToken,
            l1: l1Token,
            token,
            isC2,
            different: isC2 ? percentDifferentC2 : percentDifferentC1,
            partialPercent,
        });
    }
    return positionMas;
}

async function botWork(wallet: any, txMonitor: any) {

    const utxoAll = await getAllUtxos(txMonitor);
    const failedTxs = await getFailedTxs(txMonitor);
    console.log(utxoAll, 'utxoAll');
    console.log(failedTxs, 'failedTxs');
    const curMas = [
        { token: Currency.BNB, useC1: true, useC2: true },
        { token: Currency.ETH, useC1: true, useC2: true },
        { token: Currency.USDT_ETH, useC1: true, useC2: true },
        { token: Currency.USDT_BNB, useC1: true, useC2: true },
        { token: Currency.BTC, useC1: false, useC2: false },
    ];

    for (let i = 0; i < curMas.length; i++) {
        try {
            console.log(curMas[i], 'currency');
            const currency = curMas[i].token;
            const useC1 = curMas[i].useC1;
            const useC2 = curMas[i].useC2;

            if (useC1) {
                const dataC1 = await getAllUserPositions(currency, wallet.pub_key, { limit: LIMIT, offset: 0 });
                console.log(dataC1, 'dataC1');
                const filterDataC1 = dataC1?.filter(item => item.activityStatus === ACTIVITY_STATUS.ACTIVE);
                const projectionC1 = await getValuePositions(currency, false);
                console.log(filterDataC1, 'filterDataC1');
                console.log(projectionC1, 'projectionC1');
                if (currency === Currency.BTC) {
                    const usedUtxoOrder = dataC1?.filter(item => item.activityStatus === ACTIVITY_STATUS.ERROR && item.error === 'UTXO is already in use');
                    console.log(usedUtxoOrder, 'usedUtxoOrder');
                    const usedUtxoMas: { l1TxId: any, vout: any }[] = [];
                    usedUtxoOrder?.forEach((order: any) => {
                        if (!usedUtxoMas.find(el => el.l1TxId === (order?.chainData as BtcChainData)?.l1TxId && el.vout === (order?.chainData as BtcChainData)?.vout)) {
                            usedUtxoMas.push({
                                l1TxId: (order?.chainData as BtcChainData)?.l1TxId ?? '',
                                vout: (order?.chainData as BtcChainData)?.vout ?? '',
                            });
                        }
                    });
                    console.log(usedUtxoMas, 'usedUtxoMas');
                    const root = getbtcKey();
                    await chandePositions(filterDataC1, projectionC1, wallet, txMonitor, btcWalletAddress, root, usedUtxoMas);
                } else {
                    await chandePositions(filterDataC1, projectionC1, wallet, txMonitor, ethWallet);
                }
            }

            if (useC2) {
                console.log('im here')
                console.log('wallet pubkey', wallet.pub_key);
                const dataC2: any = await getMarketMakerOrders(currency, wallet.pub_key, { limit: LIMIT, offset: 0 });
                console.log(dataC2, 'dataC2');
                //@ts-ignore
                const filterDataC2 = dataC2?.filter(item => item.activityStatus === ACTIVITY_STATUS.ACTIVE);
                const projectionC2 = await getValuePositions(currency, true);
                console.log(filterDataC2, 'filterDataC2');
                console.log(projectionC2, 'projectionC2');
                await chandeOrders(filterDataC2, projectionC2, wallet, collateralConst, txMonitor);
            }
        } catch (e) {
            console.log('error starting bow work: ', e);
        }

    }
    return 'end botWork';
}

async function botWorkPact(wallet: any) {
    const curMas = [
        { token: Currency.BNB, usePact: true },
        { token: Currency.ETH, usePact: true },
        { token: Currency.USDT_ETH, usePact: true },
        { token: Currency.USDT_BNB, usePact: true },
        { token: Currency.BTC, usePact: false },
    ];

    for (let i = 0; i < curMas.length; i++) {

        try {
            console.log(curMas[i], 'currency');
            const currency = curMas[i].token;
            const usePact = curMas[i].usePact;

            if (usePact) {
                const claims = await getAllMarketClaim(currency, wallet.pub_key, { limit: LIMIT, offset: 0 });
                console.log(claims, 'claims');
                claims.forEach(async (claim, index: number) => {
                    console.log(claim, `claims ${index}`);
                    await sendC2Claim(
                        {
                            id: claim.id,
                            base: claim.baseAmount,
                            quote: claim.quoteAmount,
                            status: claim.executionStatus,
                            recipient: claim.quoteWallet,
                        },
                        currency,
                        ethWalletPrivKey
                    );
                });
            }
        } catch (e) {
            console.log('err', e)
        }

    }
}

function getbtcKey() {
    const seed = mnemonicToSeedSync(btcWalletMnemonic);
    const hdWallet = HDKey.fromMasterSeed(seed);
    const root = hdWallet.derive(btcWalletDerivationPath);
    return root;
}


async function intervalBot(wallet: any, txMonitor: any) {
    console.log(functionTimer, 'timer intervalBot');
    if (functionTimer){
        console.log(new Date(Date.now()).toISOString(), 'start date botWork intervalBot');
        const result = await botWork(wallet, txMonitor);
        console.log(result, 'result intervalBot');
        await sleep(INTERVAL);
        console.log(new Date(Date.now()).toISOString(), 'start date new botWork intervalBot');
        await intervalBot(wallet, txMonitor);
    } else {
        console.log(new Date(Date.now()).toISOString(), 'end date intervalBot');
    }
}

function stopBot() {
    functionTimer = false;
    timer = false;
    console.log(new Date(Date.now()).toISOString(), 'Stopping the bot');
}

async function startBot() {
    let newTxMonitor = saveTxMonitor;
    if (!saveTxMonitor)
    {
        const txMonitor = await sentTxMonitor();
        saveTxMonitor = txMonitor
        newTxMonitor = txMonitor;
    }

    const wallet = await walletWithMnemonic(mnemonic);
    console.log('newTxMonitor', newTxMonitor);
    console.log('wallet', wallet);
    timer = true;
    functionTimer = true;
    if (wallet && newTxMonitor) {
        intervalBot(wallet, newTxMonitor);
    } else  {
        throw new Error('no wallet and tx monitor');
    }

    // pact task executed every INTERVAL_PACT
    setInterval(() => {
        console.log('Executing botWorkPact...');
        botWorkPact(wallet);
    }, INTERVAL_PACT);
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


// process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection at:', promise, 'reason:', reason); });
