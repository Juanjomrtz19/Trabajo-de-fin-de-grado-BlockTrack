
import { JsonRpcProvider, Wallet, ContractFactory } from 'ethers';
import { promises as fs } from 'fs';
import path from 'path';


import envioFactory from './build/EnvioFactory.json' with { type: 'json' };


const provider = new JsonRpcProvider('http://127.0.0.1:8545');


const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
  const wallet = new Wallet(PRIVATE_KEY, provider);
  console.log('Deployer:', wallet.address);


  if (!envioFactory.abi || !envioFactory.bytecode) {
    throw new Error('El JSON no tiene abi/bytecode. Revisa artifacts/build/EnvioFactory.json');
  }

  const factory = new ContractFactory(envioFactory.abi, envioFactory.bytecode, wallet);


  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('EnvioFactory @', address);


  const outDir = path.join(process.cwd(), 'deployments', 'localhost');
  await fs.mkdir(outDir, { recursive: true });

  await fs.writeFile(
    path.join(outDir, 'EnvioFactory.json'),
    JSON.stringify({ address, abi: envioFactory.abi, network: 'localhost' }, null, 2)
  );

  console.log('Guardado deployments/localhost/EnvioFactory.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
