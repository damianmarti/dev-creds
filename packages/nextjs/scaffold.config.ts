import { env } from "process";
import * as chains from "viem/chains";

type EasConfig = {
  contractAddress: string;
  schemaUID: string;
  scan: string;
  graphUri: string;
};

export type BaseConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  easConfig?: Record<chains.Chain["id"], EasConfig>;
  miniAppConfig?: Record<string, string>;
};

export type ScaffoldConfig = BaseConfig;

export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

export const PONDER_GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [chains.optimismSepolia],
  // The interval at which your front-end polls the RPC servers for new data (it has no effect if you only target the local network (default is 4000))
  pollingInterval: 30000,
  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,
  // If you want to use a different RPC for a specific network, you can add it here.
  // The key is the chain ID, and the value is the HTTP RPC URL
  rpcOverrides: {
    // Example:
    // [chains.mainnet.id]: "https://mainnet.buidlguidl.com",
  },
  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
  onlyLocalBurnerWallet: true,
  // EAS Config
  easConfig: {
    [chains.optimismSepolia.id]: {
      contractAddress: "0x4200000000000000000000000000000000000021",
      schemaUID: "0xed8c209ab79c5b66eba9a2a9806320b30513bd186712d790fd5cb7fc24eb3416",
      scan: "https://optimism-sepolia.easscan.org",
      graphUri: "https://optimism-sepolia.easscan.org/graphql",
    },
    [chains.optimism.id]: {
      contractAddress: "0x4200000000000000000000000000000000000021",
      schemaUID: "",
      scan: "https://optimism.easscan.org",
      graphUri: "https://optimism.easscan.org/graphql",
    },
    [chains.arbitrum.id]: {
      contractAddress: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
      schemaUID: "",
      scan: "https://arbitrum.easscan.org",
      graphUri: "https://arbitrum.easscan.org/graphql",
    },
  },
  miniAppConfig: {
    name: "DevCreds",
    subtitle: "Developer Reputation On-Chain", // Max length: 30 characters
    description:
      "DevCreds is a verifiable developer skill ledger on Arbitrum. Get peer attestations, showcase your expertise, and build trust in the Web3 ecosystem.",
    icon: env.NEXT_PUBLIC_URL + "/favicon.png",
    image: env.NEXT_PUBLIC_URL + "/thumbnail.jpg",
    splashImage: env.NEXT_PUBLIC_URL + "/favicon.png",
    splashBackgroundColor: "#1E293B",
    appImage: env.NEXT_PUBLIC_URL + "/thumbnail.jpg",
  },
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
