# Dev Creds

![Dev Creds Sample](https://github.com/user-attachments/assets/d9e53927-984e-4191-9c35-341884df8fb4)

A decentralized developer credentials platform built on Arbitrum with [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) and the [Ethereum Attestation Service (EAS)](https://attest.org/). Developers can receive and give attestations for their skills, backed by verifiable GitHub evidence, creating an on-chain reputation system for builders.

**Key features:**

- Attest to other developers' skills with evidence from GitHub repositories
- Automated verification through GitHub repository analysis
- Reputation scoring based on attestations, verified evidence, and collaborator endorsements
- Developer profiles showcasing skills and attestations
- Multi-chain support (Optimism, Arbitrum, and other EAS-supported chains)

---

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Development Quickstart

1. Install dependencies

```
yarn install
```

2. Set up [Redis](#redis-setup) and [GitHub OAuth](#github-oauth-setup)

3. Configure environment variables

```
cp packages/nextjs/.env.example packages/nextjs/.env.local
cp packages/ponder/.env.example packages/ponder/.env.local
```

Edit both `.env.local` files with your configuration values.

4. Start the Ponder indexer (in one terminal):

```
yarn ponder:dev
```

5. Start your NextJS app (in another terminal):

```
yarn start
```

Visit your app on: `http://localhost:3000`.

## How It Works

### Attestation Flow

1. **Create Attestation** - Users attest to another developer's skills by providing:

   - GitHub username
   - List of skills (e.g., Solidity, React, TypeScript)
   - Description of the developer's strengths
   - GitHub repository URLs as evidence

2. **Automatic Verification** - Ponder indexes the attestation and:

   - Verifies the attested user is a contributor to the provided repositories
   - Analyzes repository languages to confirm claimed skills
   - Checks if the attester and attestee are collaborators
   - Calculates a reputation score

3. **Profile Building** - Developer profiles aggregate:
   - All received attestations
   - Verified vs. unverified attestations
   - Skills with counts and verification status
   - Overall reputation score

### Scoring System

- **Base Score**: +1 point per skill attested
- **Verified Evidence**: +1 point per skill when repository languages match the claimed skill
- **Collaborator Bonus**: +1 point per skill when attester and attestee collaborated on the same repository

### Architecture

Built with Next.js, RainbowKit, Wagmi, Viem, TypeScript, and Ponder for blockchain indexing.

- **Frontend (Next.js)**: Handles UI, wallet connections, and EAS contract interactions
- **Ponder Indexer**: Listens for EAS `Attested` events, verifies GitHub evidence, and maintains the database
- **Redis**: Stores mappings between GitHub accounts and wallet addresses
- **EAS Contracts**: Stores attestations on-chain with immutable records

## Redis Setup

This project uses Redis to persist GitHub account links to wallet addresses used by both Next.js and Ponder indexer.

**Option 1: Redis Cloud (Recommended)**

1. Go to [Redis Cloud](https://redis.io/cloud/) and create a free database (30MB is sufficient)
2. After creation, go to your database settings
3. Copy the connection string from the "Public endpoint" section
   - Format: `redis://default:password@host.redis-cloud.com:port`
4. Use this as your `REDIS_URL` in both `.env.local` files

You can connect locally with `redis-cli` for debugging:

```bash
# Install redis-cli: brew install redis (macOS) or sudo apt-get install redis-tools (Linux/WSL2)
redis-cli -u "redis://default:password@host.redis-cloud.com:port"
```

**Option 2: Local Redis (Development)**

```bash
# macOS
brew install redis && brew services start redis

# Linux
sudo apt-get install redis-server && sudo systemctl start redis

# Windows (WSL2)
sudo apt-get install redis-server && sudo service redis-server start
```

Then use `REDIS_URL=redis://localhost:6379` in your `.env.local` files.

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Dev Creds Local
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Secret to your `.env.local` files

## Environment Variables

**NextJS** (`packages/nextjs/.env.local`):

```bash
NEXT_PUBLIC_ALCHEMY_API_KEY=       # Get from https://dashboard.alchemyapi.io
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=  # Get from https://cloud.walletconnect.com
GITHUB_ID=                         # GitHub OAuth App ID
GITHUB_SECRET=                     # GitHub OAuth App Secret
NEXTAUTH_SECRET=                   # Generate with: openssl rand -base64 32
REDIS_URL=                         # Redis connection string
NEXT_PUBLIC_PONDER_URL=http://localhost:42069/graphql
```

**Ponder** (`packages/ponder/.env.local`):

```bash
PONDER_RPC_URL_11155420=           # Alchemy RPC URL for Optimism Sepolia
GITHUB_TOKEN=                      # Optional: GitHub Personal Access Token
REDIS_URL=                         # Redis connection string (same as NextJS)
```

## Network Configuration

The app is configured for Optimism Sepolia by default for local testing. To change networks, edit `packages/nextjs/scaffold.config.ts`:

```typescript
const scaffoldConfig = {
  targetNetworks: [chains.optimismSepolia], // Change to your network
  // ...
};
```

Update EAS contract addresses and schema UIDs in the same file based on your target network.

## MiniApp Configuration

DevCreds works as Farcaster MiniApp. Here are some things you will need to configure:

**NextJS** (`packages/nextjs/.env.local`):

```bash
NEXT_PUBLIC_URL=https://your.live.url
NEXT_PUBLIC_APP_AUTOADD=false # change to true if you want your miniapp to prompt user to add it to favorites on open. 
```

**farcaster.json** (`packages/nextjs/public/.well-known/farcaster.json`)

generate "accountAssociation" values at https://farcaster.xyz/~/developers/mini-apps/manifest

update following values:

        "homeUrl": "https://your.live.url",
        "iconUrl": "https://your.live.url/favicon.png",
        "imageUrl": "https://your.live.url/thumbnail.jpg",
        "splashImageUrl": "https://your.live.url/favicon.png",

remove "comments" section

Add your Base App Wallet Address to baseBuilder.allowedAddresses so you can access analytics on base app


You can debug your miniApp at:

- Farcaster Dev Tools: https://farcaster.xyz/~/developers/
- Base App Dev Tools: https://www.base.dev/preview


## Documentation

Visit [Scaffold-ETH 2 docs](https://docs.scaffoldeth.io) to learn all the technical details and guides of Scaffold-ETH 2.

To know more about its features, check the [Scaffold-ETH 2 website](https://scaffoldeth.io).

For more information about EAS, visit the [Ethereum Attestation Service Documentation](https://docs.attest.org/).

## Contributing

We welcome contributions to Dev Creds! Please feel free to submit issues and pull requests.
