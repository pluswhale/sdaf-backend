import axios from "axios";

export const getCwebPriceFromCoingecko = async (): Promise<number | null> => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: { ids: 'coinweb', vs_currencies: 'usd' },
        });
        return response.data?.coinweb?.usd;
    } catch (error) {
        console.error('Failed to fetch CWEB price from CoinGecko:', error);
        return null;
    }
};

export const getCwebPriceFromCoinGekko = async () => {
   return await getCwebPriceFromCoingecko();
};







