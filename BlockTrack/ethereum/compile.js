
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import solc from "solc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractsDir = path.join(__dirname, "contracts");
const buildDir = path.join(__dirname, "build");

const solFiles = fs.readdirSync(contractsDir).filter(f => f.endsWith(".sol"));

const sources = {};
for (const f of solFiles) {
  const full = path.join(contractsDir, f);
  sources[f] = { content: fs.readFileSync(full, "utf8") };
}


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


function findImports(importPath) {
  const tryPaths = [
    path.join(contractsDir, importPath),                      
    path.join(__dirname, importPath),                         
    path.join(process.cwd(), importPath),                     
    path.join(process.cwd(), "node_modules", importPath)      
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


const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));


if (output.errors?.length) {
  for (const e of output.errors) {
    const tag = e.severity === "error" ? "ERROR" : "WARN";
    console.log(`[${tag}] ${e.formattedMessage}`);
  }
  if (output.errors.some(e => e.severity === "error")) process.exit(1);
}

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
console.log("Compilación completada.");
