import {
  type GqlClaimFilter,
  type GqlIssuedClaim,
  type NetworkName,
  connect_to_node,
  fetch_claims,
} from '@coinweb/wallet-lib';
import { type Pagination } from 'dex-app.cm/src/offchain';
import {CONTRACT_PARAMS, Currency} from "../constants";

type IndexClaimKey = {
  first_part: unknown[];
  second_part: [number | string, ...unknown[]];
};

const cwebWalletNode = connect_to_node(process.env.API_URL || 'https://api-devnet.coinweb.io/wallet');

interface Client {
  fetchClaims: <T extends NonNullable<unknown>>(
    firstPart: NonNullable<unknown>,
    secondPart?: T | null,
    range?: { start: T; end: T },
    pagination?: Pagination,
  ) => Promise<GqlIssuedClaim[]>;
  updateClient: () => void;
}

const createClient = (contractAddress?: string, networkName?: NetworkName): Client => {
  const createClaimFilter = <T extends NonNullable<unknown>>(
    firstPart: NonNullable<unknown>,
    secondPart: T | null = null,
    range?: {
      start: T;
      end: T;
    },
  ): GqlClaimFilter => {
    return {
      issuer: { FromSmartContract: contractAddress },
      keyFirstPart: firstPart,
      keySecondPart: secondPart,
      startsAtKeySecondPart: range?.start ?? null,
      endsAtKeySecondPart: range?.end ?? null,
    };
  };

  const fetchClaims = async <T extends NonNullable<unknown>>(
    firstPart: NonNullable<unknown>,
    secondPart: T | null = null,
    range?: {
      start: T;
      end: T;
    },
    pagination?: Pagination,
  ): Promise<GqlIssuedClaim[]> => {
    if (!contractAddress || !networkName) {
      throw new Error('Network parameters are not defined');
    }

    const filter = createClaimFilter(firstPart, secondPart, range);

    const loadClaims = async () => {
      const rawData = await fetch_claims(cwebWalletNode, [filter], networkName, true);

      const sortedData = rawData.sort((a, b) => {
        let aValue: string | number | bigint = (a.content.key as IndexClaimKey).second_part[0];
        let bValue: string | number | bigint = (b.content.key as IndexClaimKey).second_part[0];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = BigInt(`0x${aValue}`);
          bValue = BigInt(`0x${bValue}`);
        }

        if (aValue < bValue) {
          return 1;
        } else if ((a.content.key as IndexClaimKey).second_part[0] > (b.content.key as IndexClaimKey).second_part[0]) {
          return -1;
        } else {
          return 0;
        }
      });

      return pagination ? sortedData.slice(pagination.offset, pagination.offset + pagination.limit) : sortedData;
    };

    const claimsRequest = loadClaims();

    const result = await claimsRequest;

    return result;
  };

  const updateClient = () => {};

  return {
    fetchClaims,
    updateClient,
  };
};

//@ts-ignore
export const baseClients: {
  [key in Exclude<Currency, Currency.CWEB>]: Client;
} = new Proxy(
    {},
    {
      get(obj, name) {
        //@ts-ignore
        return (
            {
              [Currency.ETH]: createClient(
                  CONTRACT_PARAMS[Currency.ETH].L2_CONTRACT_ADDRESS_BASE,
                  CONTRACT_PARAMS[Currency.ETH].NETWORK_NAME,
              ),
              [Currency.BNB]: createClient(
                  CONTRACT_PARAMS[Currency.BNB].L2_CONTRACT_ADDRESS_BASE,
                  CONTRACT_PARAMS[Currency.BNB].NETWORK_NAME,
              ),
              [Currency.USDT_ETH]: createClient(
                  CONTRACT_PARAMS[Currency.USDT_ETH].L2_CONTRACT_ADDRESS_BASE,
                  CONTRACT_PARAMS[Currency.USDT_ETH].NETWORK_NAME,
              ),
              [Currency.USDT_BNB]: createClient(
                  CONTRACT_PARAMS[Currency.USDT_BNB].L2_CONTRACT_ADDRESS_BASE,
                  CONTRACT_PARAMS[Currency.USDT_BNB].NETWORK_NAME,
              ),
              [Currency.BTC]: createClient(
                  CONTRACT_PARAMS[Currency.BTC].L2_CONTRACT_ADDRESS_BASE,
                  CONTRACT_PARAMS[Currency.BTC].NETWORK_NAME,
              ),
              [Currency.LTC]: createClient(
                  CONTRACT_PARAMS[Currency.BTC].L2_CONTRACT_ADDRESS_BASE,
                  CONTRACT_PARAMS[Currency.BTC].NETWORK_NAME,
              ),
              [Currency.EGLD]: createClient(
                  CONTRACT_PARAMS[Currency.BTC].L2_CONTRACT_ADDRESS_BASE,
                  CONTRACT_PARAMS[Currency.BTC].NETWORK_NAME,
              ),
            }
        )[name]
      }
    }
)

//@ts-ignore
export const makerClients: {
  [key in Exclude<Currency, Currency.CWEB>]: Client;
} = new Proxy(
    {},
    {
      get(obj, name) {
        //@ts-ignore
       return ({
          [Currency.ETH]: createClient(
            CONTRACT_PARAMS[Currency.ETH].L2_CONTRACT_ADDRESS_MAKER,
            CONTRACT_PARAMS[Currency.ETH].NETWORK_NAME,
        ),
            [Currency.BNB]: createClient(
            CONTRACT_PARAMS[Currency.BNB].L2_CONTRACT_ADDRESS_MAKER,
            CONTRACT_PARAMS[Currency.BNB].NETWORK_NAME,
        ),
            [Currency.USDT_ETH]: createClient(
            CONTRACT_PARAMS[Currency.USDT_ETH].L2_CONTRACT_ADDRESS_MAKER,
            CONTRACT_PARAMS[Currency.USDT_ETH].NETWORK_NAME,
        ),
            [Currency.USDT_BNB]: createClient(
            CONTRACT_PARAMS[Currency.USDT_BNB].L2_CONTRACT_ADDRESS_MAKER,
            CONTRACT_PARAMS[Currency.USDT_BNB].NETWORK_NAME,
        ),
            [Currency.BTC]: createClient(
            CONTRACT_PARAMS[Currency.BTC].L2_CONTRACT_ADDRESS_MAKER,
            CONTRACT_PARAMS[Currency.BTC].NETWORK_NAME,
        ),
            [Currency.LTC]: createClient(
            CONTRACT_PARAMS[Currency.BTC].L2_CONTRACT_ADDRESS_MAKER,
            CONTRACT_PARAMS[Currency.BTC].NETWORK_NAME,
        ),
            [Currency.EGLD]: createClient(
            CONTRACT_PARAMS[Currency.BTC].L2_CONTRACT_ADDRESS_MAKER,
            CONTRACT_PARAMS[Currency.BTC].NETWORK_NAME,
        ),
        })[name]
      }
    }
)
