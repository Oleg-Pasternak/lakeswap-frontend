import { http, createConfig } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not defined in the environment variables.",
  );
}

const localhost = {
  id: 1337,
  name: "Localhost",
  network: "localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:7545"],
    },
    public: {
      http: ["http://127.0.0.1:7545"],
    },
  },
};

export const config = createConfig({
  chains: [mainnet, base, localhost],
  connectors: [walletConnect({ projectId }), metaMask(), coinbaseWallet()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [localhost.id]: http(),
  },
});
