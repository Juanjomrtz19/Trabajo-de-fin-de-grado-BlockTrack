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

// ⚠️ NO usar en producción
const _faucetWallet = new Wallet(rawPk, provider);
// Wrap con NonceManager para manejar nonces correctamente
const faucet = new NonceManager(_faucetWallet);

// --- Cola global (mutex simple) para serializar envíos ---
let faucetQueue = Promise.resolve();

// Cache para no re-fondear si ya se hizo recientemente (opcional)
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
  // evita reentradas duplicadas al mismo address
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

  // Meter en cola para garantizar 1 tx a la vez
  faucetQueue = faucetQueue
    .then(async () => {
      // Re-check dentro del mutex por si otro hilo ya fondeó
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
      // Importante: no romper la cola por una excepción
      console.warn(
        `[FAUCET] Falló el envío a ${address}:`,
        e?.shortMessage ?? e?.message ?? e
      );
    });

  // Espera a que termine tu envío (no necesario si quieres que sea fire-and-forget)
  await faucetQueue;
}

// Comodín por índice HD
export async function ensureFundsForIndex(
  index: number,
  minEth = "0.01",
  topupEth = "0.05",
  opts?: { log?: boolean }
) {
  const addr = await addressFromIndex(index);
  return ensureFunds(addr, minEth, topupEth, opts);
}
