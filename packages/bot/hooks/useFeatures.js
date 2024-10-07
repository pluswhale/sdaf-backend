import { useSearchParams } from 'react-router-dom';
export const parseFeatures = (features) => {
    const featureList = features ? features.split(',') : [];
    const enabledFeatures = {
        market: featureList.includes('market'),
    };
    featureList.forEach((feature) => {
        if (!enabledFeatures[feature]) {
            enabledFeatures[feature] = true;
        }
    });
    return enabledFeatures;
};
export const useFeatures = () => {
    const [searchParams] = useSearchParams();
    const features = searchParams.get('features') || undefined;
    return parseFeatures(features);
};
