import { useSearchParams } from 'react-router-dom';

export type Features = {
  market: boolean;
  [key: string]: boolean;
};

export const parseFeatures = (features?: string): Features => {
  const featureList = features ? features.split(',') : [];

  const enabledFeatures: Features = {
    market: featureList.includes('market'),
  };

  featureList.forEach((feature) => {
    if (!enabledFeatures[feature]) {
      enabledFeatures[feature] = true;
    }
  });

  return enabledFeatures;
};

export const useFeatures = (): Features => {
  const [searchParams] = useSearchParams();
  const features = searchParams.get('features') || undefined;

  return parseFeatures(features);
};
