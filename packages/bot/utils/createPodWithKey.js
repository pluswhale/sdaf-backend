import webapp from '@coinweb/webapp-library';
export const createPodWithKey = (pubKey) => {
    const subscription = webapp.subscribe_webapp(pubKey, undefined, {
        keepAlive: 10_000,
        retryAttempts: 100,
        shouldRetry: (error) => {
            // eslint-disable-next-line no-console
            console.error('WS error:', error);
            return true;
        },
        onNonLazyError: (errorOrCloseEvent) => {
            // eslint-disable-next-line no-console
            console.error('WS error or close event:', errorOrCloseEvent);
        },
        on: {
            error: (received) => {
                // eslint-disable-next-line no-console
                console.error('WS `error`:', received);
            },
            closed: (received) => {
                // eslint-disable-next-line no-console
                console.warn('WS `closed`:', received);
            },
        },
    });
    return subscription;
};
