// useSigner.ts
import { useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { type WalletClient } from "viem";
import { useWalletClient } from "wagmi";

export async function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  if (!chain || !account) {
    return;
  }

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const provider = new BrowserProvider(transport, network);
  const signer = await provider.getSigner(account.address);

  return signer;
}

export function useSigner() {
  const { data: walletClient } = useWalletClient();

  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);

  useEffect(() => {
    if (walletClient) {
      walletClientToSigner(walletClient).then(signer => {
        setSigner(signer);
      });
    }
  }, [walletClient]);

  return signer;
}
