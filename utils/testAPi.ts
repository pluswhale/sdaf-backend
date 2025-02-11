import axios from 'axios';


export async function testAPis() {
  const usdtTransfers = await axios.get(`https://api.bscscan.com/api`, {
    params: {
      module: 'account',
      action: 'tokentx',
      contractaddress: '0x55d398326f99059fF775485246999027B3197955',
      address: '0x66FBb823E5F53D5E8161CCcd3C5BC4d158b82F27',
      startblock: 0,
      endblock: 999999999,
      page: 1,
      offset: 10000,
      sort: 'desc',
      apiKey: process.env.BSC_SCAN_API_KEY,
    },
  });

  return {
    bnbLikeTxsResponse: usdtTransfers?.data
  }

}

