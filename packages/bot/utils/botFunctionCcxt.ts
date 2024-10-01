import { force_refresh as forceRefresh, Wallet } from '@coinweb/wallet-lib';
import { convertInfoToCancelQr, convertInfoToCreateQr, convertInfoToTransfer } from './dexUtils.ts';
import { sentComposeTokenCommand, sentEmbed } from './wallet.ts';

import { ethers } from 'ethers';


import { erc20Abi } from 'viem';
import { getPsbtStartTransaction } from '../utils/bts.ts';
import {CONTRACT_PARAMS, Currency, ERC20_TOKENS} from "../constants/index.ts";
import {convertStringToBigInt, decimalsForCurrency} from "../model/swap.ts";
import {getAllMarketCollateralBalance} from "../api/index.ts";
import {eFix} from "./number.ts";
import {ERC20Currency, EvmCurrency} from "../types.ts";

const GLOBAL_WRONG_PACT: string[] = [];

async function findDifferences(filterData: any, projection: any, wallet: Wallet, txMonitor: any, isC2: boolean) {
  console.log(wallet, 'wallet');
  console.log(txMonitor, 'txMonitor');
  let newProjection = [...projection];
  for (let i = 0; i < filterData.length; i += 1) {
    console.log(newProjection, 'newProjection');
    if (
        filterData[i]?.covering &&
        (Number(filterData[i].covering) / Number(filterData[i].baseAmount)) * 100 < projection[0].partialPercent
    ) {
      console.log(filterData[i].id, 'canceled covering');
      if (isC2)
        await cancelOrder(filterData[i].id, `${projection[0].token}/CWEB`, wallet, txMonitor);
      else
        await cancelOrder(filterData[i].id, `CWEB/${projection[0].token}`, wallet, txMonitor);
      continue;
    }
    if (
        filterData[i]?.funds &&
        (Number(filterData[i].funds) / Number(filterData[i].baseAmount)) * 100 < projection[0].partialPercent
    ) {
      console.log(filterData[i].id, 'canceled funds');
      if (isC2)
        await cancelOrder(filterData[i].id, `${projection[0].token}/CWEB`, wallet, txMonitor);
      else
        await cancelOrder(filterData[i].id, `CWEB/${projection[0].token}`, wallet, txMonitor);
      continue;
    }
    const decimals = decimalsForCurrency(projection[0].token);
    const decimalsCweb = decimalsForCurrency(Currency.CWEB);

    const elements = newProjection.filter((item) => {
      /* console.log(item.cweb, `cweb ${index}`);
      console.log(item.l1, `l1 ${index}`);
      console.log(item.different, `different ${index}`);

      console.log((item.l1 * (100 - item.different)) / 100, 'l1 - different');
      console.log(Number(filterData[i].quoteAmount) / 10 ** decimals, 'quoteAmount');
      console.log((item.l1 * (100 + item.different)) / 100, 'l1 + different');

      console.log((item.cweb * (100 - item.different)) / 100, 'cweb - different');
      console.log(Number(filterData[i].baseAmount) / 10 ** decimalsCweb, 'baseAmount');
      console.log((item.cweb * (100 + item.different)) / 100, 'cweb + different'); */

      return (
          (item.cweb * (100 - item.different)) / 100 <= Number(filterData[i].baseAmount) / 10 ** decimalsCweb &&
          Number(filterData[i].baseAmount) / 10 ** decimalsCweb <= (item.cweb * (100 + item.different)) / 100 &&
          (item.l1 * (100 - item.different)) / 100 <= Number(filterData[i].quoteAmount) / 10 ** decimals &&
          Number(filterData[i].quoteAmount) / 10 ** decimals <= (item.l1 * (100 + item.different)) / 100
      );
    });
    console.log(elements, 'elements');
    if (elements.length > 0) {
      newProjection = newProjection.filter((item) => item.id !== elements[0].id);
    } else {
      console.log('canceled elements');
      if (isC2)
        await cancelOrder(filterData[i].id, `${projection[0].token}/CWEB`, wallet, txMonitor);
      else
        await cancelOrder(filterData[i].id, `CWEB/${projection[0].token}`, wallet, txMonitor);
    }
  }
  return newProjection;
}

async function getBtc(root: any, utxos: any, wallet?: string) {
  const publicKey = Buffer.from(root._publicKey).toString('hex');
  const { utxoId, vout, psbtB64} = await getPsbtStartTransaction(
      wallet ?? '',
      publicKey,
      root._privateKey,
      utxos,
  );
  return {utxoId, vout, psbtB64};
}

export async function chandePositions(filterData: any, projection: any, wallet: Wallet, txMonitor: any, ethWallet?: string, root?: any, usedUtxoMas?: any[]) {
  if (filterData.length === 0) {
    let utxo = usedUtxoMas ?? [];
    for (let i = 0; i < projection.length; i += 1) {
      if (root) {
        const { utxoId, vout, psbtB64 } = await getBtc(root, utxo, ethWallet);
        const chainData = {
          psbt: String(psbtB64),
          l1TxId: utxoId,
          vout: vout,
        }
        utxo.push({
          l1TxId: utxoId,
          vout: vout,
        });
        await createOrder(`CWEB/${projection[i].token}`, projection[i].cweb, projection[i].l1, wallet, txMonitor, ethWallet, chainData);
      } else
        await createOrder(`CWEB/${projection[i].token}`, projection[i].cweb, projection[i].l1, wallet, txMonitor, ethWallet);
    }
    return;
  }
  const newPosition = await findDifferences(filterData, projection, wallet, txMonitor, false);
  console.log(newPosition, 'newPosition chandePositions');
  let utxo = usedUtxoMas ?? [];
  if (root)
    for (let h = 0; h < filterData.length; h += 1) {
      if(filterData[h]?.chainData)
        utxo.push({
          l1TxId: filterData[h].chainData.l1TxId,
          vout: filterData[h].chainData.vout,
        });
    }
  for (let i = 0; i < newPosition.length; i += 1) {
    if (root) {
      const { utxoId, vout, psbtB64 } = await getBtc(root, utxo, ethWallet);
      const chainData = {
        psbt: String(psbtB64),
        l1TxId: utxoId,
        vout: vout,
      }
      utxo.push({
        l1TxId: utxoId,
        vout: vout,
      });
      await createOrder(`CWEB/${newPosition[i].token}`, newPosition[i].cweb, newPosition[i].l1, wallet, txMonitor, ethWallet, chainData);
    } else
      await createOrder(`CWEB/${newPosition[i].token}`, newPosition[i].cweb, newPosition[i].l1, wallet, txMonitor, ethWallet);
  }
}

export async function chandeOrders(filterData: any, projection: any, wallet: Wallet, collateralConst: number, txMonitor: any) {
  const decimals = decimalsForCurrency(Currency.CWEB); // projection[0].token);
  console.log(filterData, 'filterData chandeOrders');
  if (filterData.length === 0) {
    const data = await getAllMarketCollateralBalance(projection[0].token, wallet.pub_key);
    let balance = data?.content?.fees_stored ? Number(data.content.fees_stored) / 10 ** decimals : 0;
    if (balance === 0) {
      await transfer(20000, wallet.pub_key, `collateral_${projection[0].token.toLowerCase()}`, wallet, txMonitor);
    }
    for (let i = 0; i < projection.length; i += 1) {
      const isNewCollateralBalance = await checkCollateral(
          balance,
          projection[i].cweb * collateralConst,
          wallet,
          `collateral_${projection[i].token.toLowerCase()}`,
          txMonitor,
      );
      if (isNewCollateralBalance) {
        balance = isNewCollateralBalance;
        continue;
      }
      balance = balance - projection[i].cweb * collateralConst;
      await createOrder(`${projection[i].token}/CWEB`, projection[i].l1, projection[i].cweb, wallet, txMonitor);
    }
    return;
  }
  const newOrders = await findDifferences(filterData, projection, wallet, txMonitor, true);
  console.log(newOrders, 'newOrders chandeOrders');
  if (newOrders.length > 0) {
    const data = await getAllMarketCollateralBalance(newOrders[0].token, wallet.pub_key);
    let balance = data?.content?.fees_stored ? Number(data.content.fees_stored) / 10 ** decimals : 0;
    for (let i = 0; i < newOrders.length; i += 1) {
      const isNewCollateralBalance = await checkCollateral(
          balance,
          newOrders[i].cweb * collateralConst,
          wallet,
          `collateral_${newOrders[i].token.toLowerCase()}`,
          txMonitor,
      );
      if (isNewCollateralBalance) {
        balance = isNewCollateralBalance;
        continue;
      }
      await createOrder(`${newOrders[i].token}/CWEB`, newOrders[i].l1, newOrders[i].cweb, wallet, txMonitor);
    }
  }
}

async function checkCollateral(balance: number, cweb: number, wallet: Wallet, toAccount: string, txMonitor: any) {
  console.log(balance, 'balance');
  console.log(cweb, 'cweb');
  if (balance < cweb) {
    await transfer(cweb - balance, wallet.pub_key, toAccount, wallet, txMonitor);
    return (balance = balance - cweb);
  }
  return undefined;
}

const CANCELED_ORDER: string[] = [];

async function cancelOrder(id: string, symbol: string, wallet: Wallet, txMonitor: any) {
  try {
    if (CANCELED_ORDER.includes(id)) {
      console.log(`repeat cancelOrder ${id}`);
      return;
    }
    const qr = convertInfoToCancelQr(id, symbol);
    console.log(qr, 'qr cancelOrder');
    const {l2TransactionData, newTxs} = await sentComposeTokenCommand(wallet, JSON.parse(qr), null, txMonitor);
    console.log(l2TransactionData, 'composeCommand cancelOrder');
    console.log(newTxs, 'newTxs cancelOrder');
    const uuid = await sentEmbed(wallet, l2TransactionData?.l2_transaction);
    CANCELED_ORDER.push(id);
    // const status = txMonitor ? await timerStatus(txMonitor, newTxs) : 'wait';
    // console.log(status, 'status cancelOrder');
    console.log(uuid, 'uuid cancelOrder');
    await forceRefresh(wallet);
    return uuid;
  } catch (e) {
    console.log(e, 'error cancelOrder')
    return 'error';
  }
}

async function createOrder(symbol: string, amount: number, price: number, wallet: Wallet, txMonitor: any, ethWallet?: string, chainData?: any) {
  try {
    const ethDest = ethWallet ?? wallet.pub_key;
    const qr = await convertInfoToCreateQr(symbol, ethDest, amount, price, chainData);
    console.log(qr, 'qr createOrder');
    const {l2TransactionData, newTxs} = await sentComposeTokenCommand(wallet, JSON.parse(qr), null, txMonitor);
    console.log(l2TransactionData, 'composeCommand createOrder');
    console.log(newTxs, 'newTxs createOrder');
    const uuid = await sentEmbed(wallet, l2TransactionData.l2_transaction);
    // const status = txMonitor ? await timerStatus(txMonitor, newTxs) : 'wait';
    // console.log(status, 'status createOrder');
    console.log(uuid, 'uuid createOrder');
    await forceRefresh(wallet);
    return uuid;
  } catch (e) {
    console.log(e, 'error createOrder')
    return 'error';
  }
}

async function transfer(amount: number, fromAccount: string, toAccount: string, wallet: Wallet, txMonitor: any) {
  try{
    const transferQr = convertInfoToTransfer(fromAccount, toAccount, convertStringToBigInt(eFix(String(amount)), Currency.CWEB));//BigInt(Math.round(Number(amount) * 1e18) + 1));
    console.log(transferQr, 'transferQr transfer');
    const {l2TransactionData, newTxs} = await sentComposeTokenCommand(wallet, JSON.parse(transferQr), null, txMonitor);
    console.log(l2TransactionData, 'composeCommand transfer');
    console.log(newTxs, 'newTxs transfer');
    const uuid = await sentEmbed(wallet, l2TransactionData?.l2_transaction);
    // const status = txMonitor ? await timerStatus(txMonitor, newTxs) : 'wait';
    // console.log(status, 'status transfer');
    console.log(uuid, 'uuid transfer');
    await forceRefresh(wallet);
    return uuid;
  } catch (e) {
    console.log(e, 'error transfer')
    return 'error';
  }
}

async function approveERC20(signer: ethers.Wallet, item: any, token: Currency) {
  const { L1_TOKEN_ADDRESS, L1_CONTRACT_ADDRESS_MAKER } = (ERC20_TOKENS as string[]).includes(token)
      ? CONTRACT_PARAMS[token as ERC20Currency]
      : { L1_TOKEN_ADDRESS: undefined, L1_CONTRACT_ADDRESS_MAKER: undefined };
  if (!L1_TOKEN_ADDRESS && !L1_CONTRACT_ADDRESS_MAKER) return;
  const tokenAmount = item ? item.quote : 0n;
  const decimals = decimalsForCurrency(token);
  const sum = String(Number(tokenAmount) / 10 ** decimals);
  const contractApprove = new ethers.Contract(L1_TOKEN_ADDRESS, erc20Abi).connect(signer);

  const approvalTx = await contractApprove.getFunction('approve')(L1_CONTRACT_ADDRESS_MAKER, ethers.parseEther(sum));

  await approvalTx.wait();

  const transferTx = await contractApprove.getFunction('transferFrom')(
      signer.getAddress(),
      L1_CONTRACT_ADDRESS_MAKER,
      ethers.parseEther(sum),
  );

  await transferTx.wait();
}

export async function sendC2Claim(item: any, token: Currency, privKey: string) {
  if (GLOBAL_WRONG_PACT.includes(item.id)) {
    console.log(`stack pact ${item.id}`);
    return;
  }

  let rpcETH = 'https://geth-devblue-l1a.coinhq.store/';
  let rpcBNB = 'https://geth-devblue-l1b.coinhq.store/';

  console.log(process.env.MODE, 'MODE');
  if (process.env.MODE === 'production'){
    rpcETH = 'https://mainnet.infura.io/v3/c7dfefe8fad848b692b7cdb1ce554a5b';
    rpcBNB = 'https://bsc-dataseed.binance.org/'
  }

  let useRPC = rpcETH;
  if (token === Currency.BNB || token === Currency.USDT_BNB) {
    useRPC = rpcBNB;
  }
  const provider = new ethers.JsonRpcProvider(useRPC);
  const signer = new ethers.Wallet(privKey, provider);

  if ((ERC20_TOKENS as Currency[]).includes(token))
    await approveERC20(signer, item, token);

  const { L1_CONTRACT_ADDRESS_MAKER, L1_CONTRACT_ABI_MAKER, L1_CALL_METHOD_NAME_MAKER } =
      CONTRACT_PARAMS[token as EvmCurrency | ERC20Currency];

  const contract = new ethers.Contract(L1_CONTRACT_ADDRESS_MAKER, [L1_CONTRACT_ABI_MAKER], signer).connect(signer);

  const value = (ERC20_TOKENS as Currency[]).includes(token) ? 0 : item.quote;

  console.log(L1_CALL_METHOD_NAME_MAKER, 'L1_CALL_METHOD_NAME_MAKER');
  console.log(contract, 'contract');
  console.log(value, 'value');

  try {
    contract.getFunction(L1_CALL_METHOD_NAME_MAKER)(
        ethers.toBigInt(item.id),
        item.quote,
        item.recipient,
        item.quote,
        {
          value,
        },
    )
        .then((text) => console.log('contract.getFunction', text))
        .catch((er) => {
          GLOBAL_WRONG_PACT.push(item.id);
          console.error(er, 'error');
        });

  } catch (error) {
    GLOBAL_WRONG_PACT.push(item.id);
    console.error(error);
  }
}