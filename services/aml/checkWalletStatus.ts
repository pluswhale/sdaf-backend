import axios from 'axios';

const AML_API = 'https://btrace.amlcrypto.io/api/v2/';
const AML_API_KEY = '4BFDE9F00E302EAB67FA48F34F125860D434EC5B'; // Set this securely

export async function checkWalletStatus(address: string): Promise<'black' | 'white' | null> {
  const { data } = await axios.post(
    'https://btrace.amlcrypto.io/api/v2/risk_score',
    { address },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': AML_API_KEY,
      },
    },
  );

  console.log('res', data);
  const riskLevel = data?.data?.risk_level || null;

  if (!riskLevel) {
    return null;
  }

  return riskLevel === 'High' ? 'black' : 'white';
}
