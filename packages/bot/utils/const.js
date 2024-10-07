import { NetworkName } from '@coinweb/wallet-lib/enums';
export var Currency;
(function (Currency) {
    Currency["ETH"] = "ETH";
    Currency["BNB"] = "BNB";
    Currency["USDT_ETH"] = "USDT_ETH";
    Currency["USDT_BNB"] = "USDT_BNB";
    Currency["BTC"] = "BTC";
    Currency["CWEB"] = "CWEB";
})(Currency || (Currency = {}));
export const ttlOffset = 10 * 1000;
//@ts-ignore
export const PROPERTY = {
    ETH: {
        NETWORK_NAME: NetworkName.DEVNET_L1A,
        L1_CONTRACT_ADDRESS: '1805fd292d3ec20b83c3324efadca511378e46127480415054ef3d56361c097d',
        OWNER_MIN_FEE: '0x2386F26FC10000',
        OWNER_PERCENTAGE_FEE: 1,
        L2_CONTRACT_ADDRESS: '0xd800600053281877c2a736c181ef5cff35a47b81483821a5833c1b960e537905',
    },
    BNB: {
        NETWORK_NAME: NetworkName.DEVNET_L1A,
        L1_CONTRACT_ADDRESS: '0x4353901dddbf41219a48eae1e2892161d0dec71491a8dd671e102e3c70cd27e4',
        OWNER_MIN_FEE: '0x2386F26FC10000',
        OWNER_PERCENTAGE_FEE: 1,
        L2_CONTRACT_ADDRESS: '0x21cce6f50914bf9be3f529e39a89bac05ef071a467c5687282da5d7baa08969c',
    },
    USDT_ETH: {
        NETWORK_NAME: NetworkName.DEVNET_L1A,
        L1_CONTRACT_ADDRESS: '0xe58c6fe35c9a457fc9dfdc8558e698908a1bce9d33ac3ce9fb78573530aa8429',
        OWNER_MIN_FEE: '0x2386F26FC10000',
        OWNER_PERCENTAGE_FEE: 1,
        L2_CONTRACT_ADDRESS: '0x821958cc343eaf106de0cb35960832bc643a45f84e74736c6630f8935b0f57ff',
        L1_TOKEN_ADDRESS: '0xB9bB403f6B79422a7c80EC73701D494B02c8697d',
    },
    USDT_BNB: {
        NETWORK_NAME: NetworkName.DEVNET_L1A,
        L1_CONTRACT_ADDRESS: '0x86e5e73fb9d118c20fd70f9995369dc37465f29deb508470075ca30c845c9258',
        OWNER_MIN_FEE: '0x2386F26FC10000',
        OWNER_PERCENTAGE_FEE: 1,
        L2_CONTRACT_ADDRESS: '0x1350dea80fcdc26c5ed0bc643d9daac31e8ff555c4ea5ddc7c469527830004da',
        L1_TOKEN_ADDRESS: '0x9FEc16f4D4F498bB4bd867FE2943b75B37903389',
    },
    CWEB: {
        NETWORK_NAME: NetworkName.DEVNET_L1A,
        L2_CONTRACT_ADDRESS: '',
        L1_CONTRACT_ADDRESS: '',
    },
};
export const depositAccount = [
    'collateral_eth',
    'collateral_usdt_eth',
    'collateral_bnb',
    'collateral_usdt_bnb',
    'collateral_btc',
];
export function findDepositCurrency(index) {
    if (index === -1)
        return 'CWEB';
    if (index >= 0 && index < depositAccount.length) {
        const currency = depositAccount[index].split('collateral_')[1];
        console.log(currency, 'currency findDepositCurrency');
        return Currency[currency.toUpperCase()];
    }
    else {
        throw new Error('wrong index of deposit');
    }
}
export function createOwner(pubKey) {
    return {
        auth: 'EcdsaContract',
        payload: pubKey,
    };
}
export function getCurrencyForPair(pair) {
    const currencies = pair.split('/');
    if (currencies.length === 2) {
        return {
            currency1: Currency[currencies[0]],
            currency2: Currency[currencies[1]],
        };
    }
    else {
        throw new Error('error pair');
    }
}
