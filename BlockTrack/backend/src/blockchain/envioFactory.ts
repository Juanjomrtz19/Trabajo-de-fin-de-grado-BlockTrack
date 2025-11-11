// src/blockchain/envioFactory.ts
import { Contract, JsonRpcProvider, isAddress } from "ethers";
import deployed from "../../../ethereum/deployments/localhost/EnvioFactory.json";
import { signerFromIndex } from "./carteraUsuario";

const RPC_URL = process.env.RPC_URL ?? "http://127.0.0.1:8545";
const provider = new JsonRpcProvider(RPC_URL);

export const CHAIN_ID = 31337;

export const envioFactoryRead = new Contract(
  deployed.address,
  deployed.abi,
  provider
);

export function getEnvioFactoryForUserIndex(index: number) {
  const signer = signerFromIndex(index);
  return new Contract(deployed.address, deployed.abi, signer);
}

export async function assertFactoryDeployed() {
  if (!isAddress(deployed.address))
    throw new Error("ENVIO_FACTORY_ADDRESS inválida");
  const code = await provider.getCode(deployed.address);
  if (code === "0x")
    throw new Error(
      `No hay contrato en ${deployed.address}. ¿Reiniciaste la red y olvidaste redeploy?`
    );
}

export { provider };
