// test/EnvioFactory.simple.test.cjs
const assert = require("assert");
const ganache = require("ganache");
const Web3 = require("web3");

// Artefactos compilados por tu compile.js
const compiledFactory = require("../build/EnvioFactory.json");
const compiledEnvio = require("../build/Envio.json");

const web3 = new Web3(ganache.provider());
const GAS = "6000000";

let accounts;
let factory;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  // Despliega la FACTORY (ojo: no desplegamos Envio aquí)
  factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: GAS });
});

describe("EnvioFactory (simple)", () => {
  it("despliega la factory", async () => {
    assert.ok(factory.options.address);
  });

  it("crearEnvio(123) y aparece en getContratosDesplegados", async () => {
    await factory.methods.crearEnvio(123).send({ from: accounts[0], gas: GAS });

    const list = await factory.methods.getContratosDesplegados().call();
    assert.strictEqual(list.length, 1);

    const envioAddr = list[0];
    assert.ok(envioAddr && envioAddr !== "0x0000000000000000000000000000000000000000");

    // Verificamos el Envio recién creado (leyendo su ABI)
    const envio = new web3.eth.Contract(compiledEnvio.abi, envioAddr);
    const id = await envio.methods.remesaId().call();
    const enviador = await envio.methods.enviador().call();

    assert.strictEqual(id, "123");
    assert.strictEqual(enviador, accounts[0]);
  });

  it("permite crear múltiples envíos y listarlos en orden", async () => {
    await factory.methods.crearEnvio(101).send({ from: accounts[0], gas: GAS });
    await factory.methods.crearEnvio(202).send({ from: accounts[1], gas: GAS });

    const list = await factory.methods.getContratosDesplegados().call();
    assert.strictEqual(list.length, 2);

    // Verificamos el segundo
    const envio2 = new web3.eth.Contract(compiledEnvio.abi, list[1]);
    const id2 = await envio2.methods.remesaId().call();
    const enviador2 = await envio2.methods.enviador().call();

    assert.strictEqual(id2, "202");
    assert.strictEqual(enviador2, accounts[1]);
  });

  it("revierte si remesaId = 0 (propagado por constructor de Envio)", async () => {
    let failed = false;
    try {
      await factory.methods.crearEnvio(0).send({ from: accounts[0], gas: GAS });
    } catch (_) {
      failed = true;
    }
    assert.ok(failed, "crearEnvio(0) debería revertir");
  });
});
