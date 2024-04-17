import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, midnightTheme } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, WagmiConfig, Chain } from 'wagmi';
import {
  arbitrum,
  sepolia,
  mainnet,
  optimism,
  polygon,
  zora,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';


const localChain: Chain = {
  id: 31337, // Common ID for local Ethereum networks
  name: 'Foundry',
  network: 'localhost',
  nativeCurrency: {
    name: 'POLY',
    symbol: 'POLY',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545']}, 
    public: { http: ['http://127.0.0.1:8545']} // URL to your local Ethereum node
  },
  blockExplorers: {
    default: {
      name: 'Local Explorer',
      url: '', // No block explorer available for local networks
    }
  },
  testnet: true,
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    localChain,
    mainnet,
    sepolia,
    polygon,
    optimism,
    arbitrum,
    zora,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        coolMode chains={chains}
        theme={midnightTheme({
          accentColor: '#7b3fe4',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}
      >
      <div style={{ fontFamily: 'Roboto Condensed', fontSize: '36px', color: 'white', position: 'absolute', top: 50, left: 40, padding: '10px' }}>
          Polyswap
        </div>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
