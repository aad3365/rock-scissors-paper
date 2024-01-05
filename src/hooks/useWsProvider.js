import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getSupportedNetworks } from '../ethereum';
import { WebSocketProvider } from 'web3';

const WsProvider = createContext({});

export function WsContextProvider({ children }) {
    const supportedNetworks = getSupportedNetworks();
    const [currentWsUrl, setCurrentWsUrl] = useState(supportedNetworks[0].websocketUrl);
    const [wsProvider, setWsProvider] = useState();
    const [error, setError] = useState();
    const [connecting, setConnecting] = useState(false);

    const updateWsProvider = useCallback((url) => {
        setConnecting(true);
        setCurrentWsUrl(url);
    }, []);

    useEffect(() => {
        const provider = new WebSocketProvider(currentWsUrl);

        provider.on('connect', () => {
            setConnecting(false);
        });
        provider.on('error', (e) => {
            // TODO: if emits error event when listening contract logs, detach each cases.
            if (e.message) {
                setError(e.message);
            } else {
                setError(`Failed to connect to ${e.currentTarget.url}`);
            }
            setConnecting(false);
        });

        setWsProvider(provider);
        
        return () => {
            provider.removeAllListeners();
        };
    }, [currentWsUrl]);

    return (
        <WsProvider.Provider
            value={{
                wsProvider,
                currentWsUrl,
                error,
                connecting,
                updateWsProvider,
            }}
        >
            {children}
        </WsProvider.Provider>
    );
}

export const useWsProvider = () => {
    const context = useContext(WsProvider);
    if (context === undefined) {
        throw new Error('useWeb3 must be used within a "WsProvider"');
    }

    return context;
};