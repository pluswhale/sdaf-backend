import axios from 'axios';

export const getBitcoinBalance = async (btcAddress: string): Promise<number> => {
  const response = await axios.get(`https://blockstream.info/api/address/${btcAddress}`);
  return parseFloat(response.data.chain_stats.funded_txo_sum) - parseFloat(response.data.chain_stats.spent_txo_sum);
};

