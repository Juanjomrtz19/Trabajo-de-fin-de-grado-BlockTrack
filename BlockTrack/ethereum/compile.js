// compile.js (ESM)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import solc from "solc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTRACT_PATH = path.join(__dirname, "contracts", "Envio.sol");
const source = fs.readFileSync(CONTRACT_PATH, "utf8");

const input = {
  language: "Solidity",
  sources: { "Envio.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors?.length) {
  for (const e of output.errors) console.log(e.formattedMessage);
  if (output.errors.some(e => e.severity === "error")) process.exit(1);
}

const c = output.contracts["Envio.sol"]["Envio"];
const abi = c.abi;
const bytecode = "0x" + c.evm.bytecode.object;

const outDir = path.join(__dirname, "build");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "Envio.json"), JSON.stringify({ abi, bytecode }, null, 2));

console.log("Compilado OK -> artifacts/Envio.json");
