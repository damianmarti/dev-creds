import { createConfig } from "ponder";
import { http } from "viem";
import externalContracts from "../nextjs/contracts/externalContracts";
import scaffoldConfig from "../nextjs/scaffold.config";

const targetNetwork = scaffoldConfig.targetNetworks[0];

const networks = {
  [targetNetwork.name]: {
    chainId: targetNetwork.id,
    transport: http(process.env[`PONDER_RPC_URL_${targetNetwork.id}`]),
  },
};

const contractNames = Object.keys(externalContracts[targetNetwork.id]);

const contracts = Object.fromEntries(contractNames.map((contractName) => {
  return [contractName, {
    network: targetNetwork.name as string,
    abi: externalContracts[targetNetwork.id][contractName].abi,
    address: externalContracts[targetNetwork.id][contractName].address,
    startBlock: externalContracts[targetNetwork.id][contractName].deployedOnBlock || 0,
  }];
}));

export default createConfig({
  networks: networks,
  contracts: contracts,
});

