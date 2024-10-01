// import express from 'express';
// import { walletWithMnemonic } from './utils/wallet.ts';
// import { getAllMarketClaim, getAllUserPositions, getMarketMakerOrders } from './api/index.ts';
// import { Currency } from './constants/index.ts';
// import { chandeOrders, chandePositions, sendC2Claim } from './utils/botFunctionCcxt.ts';
// import { getBinancePrice, getTestPrices } from './utils/binanceApi.js';
// import { getCwebPriceFromCoinGekko } from './utils/api.ts';
// import {ACTIVITY_STATUS} from "dex-app.cm/src/offchain/index.ts";
// import * as fs from 'fs/promises';
// import path from 'path';
// import { fileURLToPath, pathToFileURL } from 'url';
// import dotenv from 'dotenv';
//
// dotenv.config();
//
// const LIMIT = 100;
// const INTERVAL = 60000; // 1 minute
//
//
// // Bot settings
// let positionsMax = 3;
// let startValue = 0.01;
// let endValue = 1;
// let percentC1 = 1;
// let percentC2 = 2;
// let percentDifferentC1 = 10;
// let percentDifferentC2 = 20;
// let mnemonic = 'priority supply couple broccoli balcony sort flag keep original wrong pottery version';
// let ethWallet = '0x4B12DD8C725113122C5E8D1cbfDD0105C4016196';
// let ethWalletPrivKey = '12685e9212dcd9426e4b297c6b4cfc5bbc5f8b9c9887e4314a929d859bc498a1';
// let collateralConst = 1;
// let partialPercent = 80;
// let cwebPrice = null;
//
// // Function to get token price (simplified for now)
// function getTokenPrice(token: any) {
//     if (token === 'CWEB') return 100;
//     return 1; // Default price for all other tokens
// }
//
// // Function to calculate position values
// function getValuePositions(token: any, isC2: any) {
//     let end = endValue;
//     if (startValue >= endValue) {
//         end = startValue;
//     }
//     const moveFromPositions = positionsMax !== 1 ? (end + startValue) / (positionsMax - 1) : 0;
//     const price = getTokenPrice(token);
//     const priceCWEB = getTokenPrice('CWEB');
//     const positionMas = [];
//     for (let i = 0; i < positionsMax; i += 1) {
//         const usdValue = startValue + moveFromPositions * i;
//         const cwebToken = isC2
//             ? (priceCWEB * usdValue * (100 + percentC2)) / 100
//             : (priceCWEB * usdValue * (100 - percentC1)) / 100;
//         const l1Token = price * usdValue;
//         positionMas.push({
//             id: i + 1,
//             cweb: cwebToken,
//             l1: l1Token,
//             token,
//             isC2,
//             different: isC2 ? percentDifferentC2 : percentDifferentC1,
//             partialPercent,
//         });
//     }
//     return positionMas;
// }
//
// // Bot logic
// async function botWork() {
//     const wallet = await walletWithMnemonic(mnemonic);
//     const curMas = [Currency.BNB, Currency.ETH, Currency.USDT_ETH, Currency.USDT_BNB];
//     for (let i = 0; i < curMas.length; i += 1) {
//         const currency = curMas[0];
//
//         const dataC1 = await getAllUserPositions(currency, wallet.pub_key, {
//             limit: LIMIT,
//             offset: 0,
//         });
//         const filterDataC1 = dataC1?.filter((item) => item.activityStatus === ACTIVITY_STATUS.ACTIVE);
//         const projectionC1 = getValuePositions(currency, false);
//         await chandePositions(filterDataC1, projectionC1, wallet, ethWallet);
//
//         const dataC2 = await getMarketMakerOrders(currency, wallet.pub_key, {
//             limit: LIMIT,
//             offset: 0,
//         });
//         // @ts-ignore
//         const filterDataC2 = dataC2?.filter((item) => item.activityStatus === ACTIVITY_STATUS.ACTIVE);
//         const projectionC2 = getValuePositions(currency, true);
//         await chandeOrders(filterDataC2, projectionC2, wallet, collateralConst, txMonitor);
//
//         const claims = await getAllMarketClaim(currency, wallet.pub_key, {
//             limit: LIMIT,
//             offset: 0,
//         });
//         for (let j = 0; j < claims.length; j += 1) {
//             await sendC2Claim(
//                 {
//                     id: claims[j].id,
//                     base: claims[j].baseAmount,
//                     quote: claims[j].quoteAmount,
//                     status: claims[j].executionStatus,
//                     recipient: claims[j].quoteWallet,
//                 },
//                 currency,
//                 ethWalletPrivKey,
//             );
//         }
//     }
// }
//
// // Fetch CWEB price from CoinGecko
// async function fetchCwebPrice() {
//     const price = await getCwebPriceFromCoinGekko();
//     if (price) {
//         cwebPrice = price;
//         console.log(`CWEB Price updated: ${cwebPrice}`);
//     } else {
//         console.log('Failed to fetch CWEB price.');
//     }
// }
//
// // Start bot interval
// let botTimer: any;
//
// function startBot() {
//     console.log('Starting bot...');
//     botWork();
//     botTimer = setInterval(() => botWork(), INTERVAL);
// }
//
// function stopBot() {
//     console.log('Stopping bot...');
//     clearInterval(botTimer);
// }
//
// // Initialize Express App
// const app = express();
//
// app.get('/', (req, res) => {
//     res.send('Bot is running...');
// });
//
// // Start bot when server starts
// app.listen(3000, async () => {
//     console.log('Server started on http://localhost:3000');
//     await fetchCwebPrice();  // Fetch the CWEB price once
//     startBot();  // Start the bot
// });


import express from 'express';
import sentTxMonitor, { sleep, walletWithMnemonic } from './utils/wallet.ts';
import { getAllMarketClaim, getAllUserPositions, getMarketMakerOrders } from './api/index.ts';
import { ACTIVITY_STATUS, BtcChainData } from 'dex-app.cm/src/offchain/index.ts';
import { Currency } from './constants/index.ts';
import { chandeOrders, chandePositions, sendC2Claim } from './utils/botFunctionCcxt.ts';
import { mnemonicToSeedSync } from 'bip39';
import HDKey from 'hdkey';
import { getBinancePrice, getTestPrices } from './utils/binanceApi.ts';
import { getCwebPriceFromCoinGekko } from './utils/api.ts';
import { get_all_utxos as getAllUtxos, get_failed_txs as getFailedTxs } from '@coinweb/wallet-lib';

const LIMIT = 100;
const INTERVAL = 5 * 60 * 1000;
const INTERVAL_PACT = 0.5 * 60 * 1000;
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

const app = express();

async function getTokenPrice(token: Currency | 'CWEB') {
    if (token === 'CWEB') {
        const cwebPrice = await getCwebPriceFromCoinGekko();
        tokenPrice.CWEB = cwebPrice ? 1 / cwebPrice : tokenPrice.CWEB;
        return cwebPrice ? 1 / cwebPrice : tokenPrice.CWEB;
    }
    if (token === Currency.USDT_BNB || token === Currency.USDT_ETH) return 1;
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

    const curMas = [
        { token: Currency.BNB, useC1: false, useC2: false },
        { token: Currency.ETH, useC1: false, useC2: true },
        { token: Currency.USDT_ETH, useC1: false, useC2: false },
        { token: Currency.USDT_BNB, useC1: false, useC2: false },
        { token: Currency.BTC, useC1: true, useC2: false },
    ];

    for (let i = 0; i < curMas.length; i++) {
        const currency = curMas[i].token;
        const useC1 = curMas[i].useC1;
        const useC2 = curMas[i].useC2;

        if (useC1) {
            const dataC1 = await getAllUserPositions(currency, wallet.pub_key, { limit: LIMIT, offset: 0 });
            const filterDataC1 = dataC1?.filter((item) => item.activityStatus === ACTIVITY_STATUS.ACTIVE);
            const projectionC1 = await getValuePositions(currency, false);

            if (currency === Currency.BTC) {
                const root = getbtcKey();
                await chandePositions(filterDataC1, projectionC1, wallet, txMonitor, btcWalletAddress, root);
            } else {
                await chandePositions(filterDataC1, projectionC1, wallet, txMonitor, ethWallet);
            }
        }

        if (useC2) {
            const dataC2 = await getMarketMakerOrders(currency, wallet.pub_key, { limit: LIMIT, offset: 0 });
            // @ts-ignore
            const filterDataC2 = dataC2?.filter((item) => item.activityStatus === ACTIVITY_STATUS.ACTIVE);
            const projectionC2 = await getValuePositions(currency, true);
            await chandeOrders(filterDataC2, projectionC2, wallet, collateralConst, txMonitor);
        }
    }

    return 'end botWork';
}

function getbtcKey() {
    const seed = mnemonicToSeedSync(btcWalletMnemonic);
    const hdWallet = HDKey.fromMasterSeed(seed);
    const root = hdWallet.derive(btcWalletDerivationPath);
    return root;
}

async function intervalBot(wallet: any, txMonitor: any) {
    if (functionTimer) {
        const result = await botWork(wallet, txMonitor);
        await sleep(INTERVAL);
        await intervalBot(wallet, txMonitor);
    }
}

app.post('/start-bot', async (req, res) => {
    if (!saveTxMonitor) {
        const txMonitor = await sentTxMonitor();
        saveTxMonitor = txMonitor;
    }

    const wallet = await walletWithMnemonic(mnemonic);
    functionTimer = true;
    intervalBot(wallet, saveTxMonitor);
    res.send('Bot started');
});

app.post('/end-bot', (req, res) => {
    functionTimer = false;
    res.send('Bot stopped');
});

app.listen(3000, () => {
    console.log('Bot backend running on port 3000');
});
