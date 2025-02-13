import { KubeConfig, Cluster } from '@kubernetes/client-node';
import dotenv from 'dotenv';
dotenv.config();

export const generateKubernetesConfig = () => {
  console.log(process.env, 'ENV: ');

  if (
    process.env.KUBERNETES_CLUSTER_NAME &&
    process.env.KUBERNETES_SERVER &&
    process.env.KUBERNETES_CERTIFICATE_AUTHORITY_DATA &&
    process.env.KUBERNETES_USER_NAME &&
    process.env.KUBERNETES_CLIENT_CERTIFICATE_DATA &&
    process.env.KUBERNETES_CLIENT_KEY_DATA
  ) {
    const cluster: Cluster = {
      name: process.env.KUBERNETES_CLUSTER_NAME,
      server: process.env.KUBERNETES_SERVER || '',
      caData: process.env.KUBERNETES_CERTIFICATE_AUTHORITY_DATA || '',
    };

    const user = {
      name: process.env.KUBERNETES_USER_NAME || '',
      certData: process.env.KUBERNETES_CLIENT_CERTIFICATE_DATA,
      keyData: process.env.KUBERNETES_CLIENT_KEY_DATA,
    };

    const context = {
      name: 'kubernetes-admin@kubernetes',
      user: user.name,
      cluster: cluster.name,
    };

    return { cluster, user, context };
  } else {
    console.error('Kubernetes environment variables are not set.');
    return {};
  }
};

const kc = new KubeConfig();

const { cluster, user, context } = generateKubernetesConfig();

if (cluster && user && context) {
  kc.loadFromOptions({
    clusters: [cluster],
    users: [user],
    contexts: [context],
    currentContext: context.name,
  });
} else {
  console.error('Kubernetes configuration is incomplete.');
}

export { kc };

