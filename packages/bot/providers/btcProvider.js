import axios from 'axios';
export async function getBTCUTXOs(address) {
    try {
        const { data } = await axios.get(`https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`);
        console.log('UTXOs:', data.txrefs);
    }
    catch (error) {
        console.error('Error fetching UTXOs:', error);
    }
}
