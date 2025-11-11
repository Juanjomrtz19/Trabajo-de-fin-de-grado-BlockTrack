// src/blockchain/faucet.ts
import {
  JsonRpcProvider,
  Wallet,
  parseEther,
  isAddress,
  ZeroAddress,
  NonceManager,
} from "ethers";
import { addressFromIndex } from "./carteraUsuario";

const RPC = process.env.RPC_URL ?? "http://127.0.0.1:8545";
const DEFAULT_PK =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const rawPk = (process.env.FAUCET_PK ?? DEFAULT_PK).trim();

const provider = new JsonRpcProvider(RPC);

const _faucetWallet = new Wallet(rawPk, provider);

const faucet = new NonceManager(_faucetWallet);

let faucetQueue = Promise.resolve();

const fundedRecently = new Set<string>();

export async function ensureFunds(
  address: string,
  minEth = "0.01",
  topupEth = "0.05",
  { log = false }: { log?: boolean } = {}
) {
  if (process.env.NODE_ENV === "production") return;
  if (!isAddress(address) || address === ZeroAddress) {
    throw new Error(`Dirección inválida: ${address}`);
  }

  if (fundedRecently.has(address.toLowerCase())) {
    if (log) console.log(`[FAUCET] ${address} ya marcado como fondeado.`);
    return;
  }

  const bal = await provider.getBalance(address);
  if (bal >= parseEther(minEth)) {
    if (log) console.log(`[FAUCET] ${address} tiene saldo suficiente.`);
    fundedRecently.add(address.toLowerCase());
    return;
  }

  faucetQueue = faucetQueue
    .then(async () => {
      const bal2 = await provider.getBalance(address);
      if (bal2 >= parseEther(minEth)) {
        if (log)
          console.log(`[FAUCET] (post-queue) ${address} ya tiene saldo.`);
        fundedRecently.add(address.toLowerCase());
        return;
      }

      const tx = await faucet.sendTransaction({
        to: address,
        value: parseEther(topupEth),
      });
      if (log)
        console.log(
          `[FAUCET] Enviando ${topupEth} ETH a ${address}: ${tx.hash}`
        );
      await tx.wait();
      if (log) console.log(`[FAUCET] Confirmado ${address}.`);
      fundedRecently.add(address.toLowerCase());
    })
    .catch((e) => {
      console.warn(
        `[FAUCET] Falló el envío a ${address}:`,
        e?.shortMessage ?? e?.message ?? e
      );
    });

  await faucetQueue;
}

export async function ensureFundsForIndex(
  index: number,
  minEth = "0.01",
  topupEth = "0.05",
  opts?: { log?: boolean }
) {
  const addr = await addressFromIndex(index);
  return ensureFunds(addr, minEth, topupEth, opts);
}
