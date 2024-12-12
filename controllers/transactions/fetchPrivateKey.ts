import crypto from 'crypto';
import { CoreV1Api } from '@kubernetes/client-node';
import { KUBERNETES_SECRETS_NAMESPACE } from '../../utils/const';
import { kc } from '../../config/kubernetes';

const k8sApi = kc.makeApiClient(CoreV1Api);

export const fetchPrivateKey = async (publicKey: string) => {
  console.log('publicKey: ', publicKey);

  try {
    const publicKeyHash = crypto.createHash('sha256').update(publicKey).digest('hex');
    console.log('publicKeyHash: ', publicKey);

    const secretName = `wallet-secret-${publicKeyHash.slice(0, 8)}`;
    console.log('secretName: ', secretName);
    const secretResponse = await k8sApi.readNamespacedSecret(secretName, KUBERNETES_SECRETS_NAMESPACE);

    console.log('secretResponse: ', secretResponse);

    if (!secretResponse.body.data) return null;

    const privateKey = Buffer.from(secretResponse.body.data.privateKey, 'base64').toString('utf-8');
    return { privateKey };
  } catch (error) {
    console.error('Error fetching private key:', error);
    throw new Error('Failed to retrieve wallet secret');
  }
};

