import axios from 'axios';

export const getBitcoinBalance = async (btcAddress: string): Promise<number> => {
  const network: string = process.env.NETWORK === 'mainnet' ? '' : 'testnet/';

  try {
    const response = await axios.get(`https://blockstream.info/${network}api/address/${btcAddress}`);

    const funded = response?.data?.chain_stats?.funded_txo_sum;
    const spent = response?.data.chain_stats?.spent_txo_sum;

    const balance = (funded - spent) / 1e8; // Convert from satoshis to BTC

    return balance;
  } catch (error) {
    console.error('Error fetching Bitcoin balance:', error);
    throw new Error('Unable to retrieve Bitcoin balance.');
  }
};

