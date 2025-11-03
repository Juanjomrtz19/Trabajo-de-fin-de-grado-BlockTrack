// ethereum/compile.js (ESM)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import solc from "solc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractsDir = path.join(__dirname, "contracts");
const buildDir = path.join(__dirname, "build");

// 1) Recolecta .sol de la carpeta contracts
const solFiles = fs.readdirSync(contractsDir).filter(f => f.endsWith(".sol"));
// ej: ["Envio.sol", "EnvioFactory.sol"]

// 2) Crea el objeto sources para solc (Standard JSON)
const sources = {};
for (const f of solFiles) {
  const full = path.join(contractsDir, f);
  sources[f] = { content: fs.readFileSync(full, "utf8") };
}

// 3) Input para solc
const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"]
      }
    }
  }
};

// 4) Resolver imports locales y de node_modules (OpenZeppelin, etc.)
function findImports(importPath) {
  // Soporta import "./X.sol", "X.sol", "@openzeppelin/..."
  const tryPaths = [
    path.join(contractsDir, importPath),                      // ./contracts/...
    path.join(__dirname, importPath),                         // relativo al root ethereum/
    path.join(process.cwd(), importPath),                     // relativo al proyecto
    path.join(process.cwd(), "node_modules", importPath)      // node_modules
  ];

  for (const p of tryPaths) {
    try {
      if (fs.existsSync(p)) {
        return { contents: fs.readFileSync(p, "utf8") };
      }
    } catch (_) {}
  }
  return { error: `File not found: ${importPath}` };
}

// 5) Compila
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

// 6) Manejo de errores/avisos
if (output.errors?.length) {
  for (const e of output.errors) {
    const tag = e.severity === "error" ? "ERROR" : "WARN";
    console.log(`[${tag}] ${e.formattedMessage}`);
  }
  if (output.errors.some(e => e.severity === "error")) process.exit(1);
}

// 7) Escribir artefactos por cada contrato
fs.mkdirSync(buildDir, { recursive: true });

for (const fileName of Object.keys(output.contracts)) {
  const contractsInFile = output.contracts[fileName];
  for (const contractName of Object.keys(contractsInFile)) {
    const c = contractsInFile[contractName];
    const abi = c.abi;
    const bytecodeObj = c.evm?.bytecode?.object || "";
    const bytecode = bytecodeObj.startsWith("0x") ? bytecodeObj : "0x" + bytecodeObj;

    const outPath = path.join(buildDir, `${contractName}.json`);
    fs.writeFileSync(outPath, JSON.stringify({ abi, bytecode }, null, 2));
    console.log(`✔ ${contractName} -> ${path.relative(process.cwd(), outPath)}`);
  }
}
console.log("✅ Compilación completada.");
