import axios from 'axios';

interface PriceResponse {
  [key: string]: {
    usd: number;
  };
}

export async function getCryptoPrice(coinId: string): Promise<number | null> {
  try {
    const response = await axios.get<PriceResponse>(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
      },
    });

    return response.data[coinId]?.usd || null;
  } catch (error) {
    console.error(`Error fetching price for ${coinId}:`, error);
    return null;
  }
}

