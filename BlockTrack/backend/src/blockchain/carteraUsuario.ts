// src/blockchain/userWallet.ts
import { HDNodeWallet, Wallet, JsonRpcProvider } from "ethers";
import prisma from "../config/prisma";

const provider = new JsonRpcProvider(
  process.env.RPC_URL ?? "http://127.0.0.1:8545"
);

export function signerFromIndex(index: number) {
  const path = `m/44'/60'/0'/0/${index}`;
  const wallet = HDNodeWallet.fromPhrase(
    process.env.MNEMONIC!,
    undefined,
    path
  );
  return new Wallet(wallet.privateKey, provider);
}

export async function addressFromIndex(index: number) {
  const s = signerFromIndex(index);
  return (await s.getAddress()).toLowerCase();
}

export async function getWalletIndexByClienteId(
  clienteId: number
): Promise<number> {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { usuario: { select: { walletIndex: true } } },
  });
  const idx = cliente?.usuario?.walletIndex;
  if (idx == null) throw new Error("Usuario (cliente) sin walletIndex");
  return idx;
}
