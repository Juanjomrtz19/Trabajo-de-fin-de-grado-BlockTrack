
const assert = require("assert");
const ganache = require("ganache");
const Web3 = require("web3");
const compiledEnvio = require("../build/Envio.json");

const web3 = new Web3(ganache.provider());
const GAS = "5000000";

let accounts;
let envio;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  envio = await new web3.eth.Contract(compiledEnvio.abi)
    .deploy({
      data: compiledEnvio.bytecode,
      arguments: [123, accounts[0]], 
    })
    .send({
      from: accounts[0], 
      gas: GAS,
    });
});

describe("Envio Contract (simple)", () => {
    it("deploys a contract", async () => {
        assert.ok(envio.options.address);
        const id = await envio.methods.remesaId().call();
        assert.strictEqual(id, "123");
    });

    it("set a receiver", async () => {
        await envio.methods.setReceptor(accounts[1]).send({ from: accounts[0] });
        const receptor = await envio.methods.receptor().call();
        assert.strictEqual(receptor, accounts[1]);
    });

    it("add total transporters", async () => {
        await envio.methods.setTotalTransportistas(2).send({ from: accounts[0] });
        const total = await envio.methods.totalTransportistas().call();
        assert.strictEqual(total, "2");
    });

    it("register transporters (uno) + cuenta aceptados", async () => {
        await envio.methods.setTotalTransportistas(2).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[1]).send({ from: accounts[0] });

        await envio.methods.addTransportistaAceptado().send({ from: accounts[2] });

        const aceptado = await envio.methods
            .transportistasAceptados(accounts[2])
            .call();
        const totalAceptados = await envio.methods
            .totalTransportistasAceptados()
            .call();
        assert.strictEqual(aceptado, true);
        assert.strictEqual(totalAceptados, "1");
    });

    it("no deja aceptar sin fijar total", async () => {
        let failed = false;
        try {
            await envio.methods
                .addTransportistaAceptado()
                .send({ from: accounts[2] });
        } catch (_) {
            failed = true;
        }
        assert.ok(failed);
    });

    it("solo enviador puede setTotalTransportistas", async () => {
        await envio.methods.setTotalTransportistas(2).send({ from: accounts[0] });
        let failed = false;
        try {
            await envio.methods.setTotalTransportistas(3).send({ from: accounts[2] });
        } catch (_) {
            failed = true;
        }
        assert.ok(failed);
    });

    it("setReceptor no permite enviador ni transportista aceptado", async () => {
        await envio.methods.setTotalTransportistas(2).send({ from: accounts[0] });

        let f1 = false;
        try {
            await envio.methods.setReceptor(accounts[0]).send({ from: accounts[0] });
        } catch (_) {
            f1 = true;
        }
        assert.ok(f1);

        await envio.methods.addTransportistaAceptado().send({ from: accounts[2] });

        let f2 = false;
        try {
            await envio.methods.setReceptor(accounts[2]).send({ from: accounts[0] });
        } catch (_) {
            f2 = true;
        }
        assert.ok(f2);

        await envio.methods.setReceptor(accounts[3]).send({ from: accounts[0] });
        const receptor = await envio.methods.receptor().call();
        assert.strictEqual(receptor, accounts[3]);
    });

    it("al completar setup pasa a Pendiente automáticamente", async () => {
        await envio.methods.setTotalTransportistas(2).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[5]).send({ from: accounts[0] });

        let estado = await envio.methods.estado().call();
        assert.strictEqual(estado, "0");

        await envio.methods.addTransportistaAceptado().send({ from: accounts[2] });
        estado = await envio.methods.estado().call();
        assert.strictEqual(estado, "0"); // falta uno

        await envio.methods.addTransportistaAceptado().send({ from: accounts[4] });
        estado = await envio.methods.estado().call();
        assert.strictEqual(estado, "1"); // Pendiente
    });

    it("una vez Pendiente, ya no deja tocar setup", async () => {
        await envio.methods.setTotalTransportistas(1).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[5]).send({ from: accounts[0] });
        await envio.methods.addTransportistaAceptado().send({ from: accounts[2] });

        let f1 = false,
            f2 = false,
            f3 = false;
        try {
            await envio.methods.setTotalTransportistas(2).send({ from: accounts[0] });
        } catch (_) {
            f1 = true;
        }
        try {
            await envio.methods.setReceptor(accounts[6]).send({ from: accounts[0] });
        } catch (_) {
            f2 = true;
        }
        try {
            await envio.methods
                .addTransportistaAceptado()
                .send({ from: accounts[7] });
        } catch (_) {
            f3 = true;
        }
        assert.ok(f1 && f2 && f3);
    });

    it("solo el poseedor actual puede cambiar la custodia; sólo receptor o transportista aceptado", async () => {
        await envio.methods.setTotalTransportistas(2).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[5]).send({ from: accounts[0] });
        await envio.methods.addTransportistaAceptado().send({ from: accounts[2] });
        await envio.methods.addTransportistaAceptado().send({ from: accounts[4] });

        // no poseedor
        let f1 = false;
        try {
            await envio.methods
                .cambiarPoseedor(accounts[3])
                .send({ from: accounts[1] });
        } catch (_) {
            f1 = true;
        }
        assert.ok(f1);

        let f2 = false;
        try {
            await envio.methods
                .cambiarPoseedor(accounts[6])
                .send({ from: accounts[0] });
        } catch (_) {
            f2 = true;
        }
        assert.ok(f2);

        await envio.methods
            .cambiarPoseedor(accounts[2])
            .send({ from: accounts[0] });
        const poseedor = await envio.methods.poseedorActualRemesa().call();
        const estado = await envio.methods.estado().call();
        assert.strictEqual(poseedor, accounts[2]);
        assert.strictEqual(estado, "2"); // EnTransito
    });

    it("entrega directa al receptor desde el poseedor", async () => {
        await envio.methods.setTotalTransportistas(2).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[5]).send({ from: accounts[0] });
        await envio.methods.addTransportistaAceptado().send({ from: accounts[2] });
        await envio.methods.addTransportistaAceptado().send({ from: accounts[4] });

        await envio.methods
            .cambiarPoseedor(accounts[5])
            .send({ from: accounts[0] });
        const estado = await envio.methods.estado().call();
        const poseedor = await envio.methods.poseedorActualRemesa().call();
        assert.strictEqual(estado, "3"); 
        assert.strictEqual(poseedor, accounts[5]);
    });

    it("entregarPedido solo lo llama el poseedor actual", async () => {
        await envio.methods.setTotalTransportistas(1).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[5]).send({ from: accounts[0] });
        await envio.methods.addTransportistaAceptado().send({ from: accounts[2] });

        await envio.methods
            .cambiarPoseedor(accounts[2])
            .send({ from: accounts[0] });

        let f1 = false;
        try {
            await envio.methods.entregarPedido().send({ from: accounts[1] });
        } catch (_) {
            f1 = true;
        }
        assert.ok(f1);

        await envio.methods.entregarPedido().send({ from: accounts[2] });
        const estado = await envio.methods.estado().call();
        const poseedor = await envio.methods.poseedorActualRemesa().call();
        assert.strictEqual(estado, "3"); 
        assert.strictEqual(poseedor, accounts[5]);
    });

    it("cancelar en Creada y no dos veces", async () => {
        await envio.methods.cancelarPedido().send({ from: accounts[0] });
        const estado = await envio.methods.estado().call();
        assert.strictEqual(estado, "4");

        let f = false;
        try {
            await envio.methods.cancelarPedido().send({ from: accounts[0] });
        } catch (_) {
            f = true;
        }
        assert.ok(f);
    });
    it("no permite total menor que aceptados", async () => {
        await envio.methods.setTotalTransportistas(2).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[5]).send({ from: accounts[0] });
        await envio.methods.addTransportistaAceptado().send({ from: accounts[2] });

        let failed = false;
        try {
            await envio.methods.setTotalTransportistas(0).send({ from: accounts[0] });
        } catch (_) {
            failed = true;
        }
        assert.ok(failed);
    });
    it("el receptor no puede aceptarse como transportista", async () => {
        await envio.methods.setTotalTransportistas(1).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[3]).send({ from: accounts[0] });

        let failed = false;
        try {
            await envio.methods
                .addTransportistaAceptado()
                .send({ from: accounts[3] });
        } catch (_) {
            failed = true;
        }
        assert.ok(failed);
    });
    it("cambiarPoseedor no admite address(0)", async () => {
        await envio.methods.setTotalTransportistas(1).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[5]).send({ from: accounts[0] });
        await envio.methods.addTransportistaAceptado().send({ from: accounts[2] });

        let failed = false;
        try { await envio.methods.cambiarPoseedor("0x0000000000000000000000000000000000000000").send({ from: accounts[0] }); } catch (_) { failed = true; }
        assert.ok(failed);
    });
    it("entregarPedido antes de setup completo revierte", async () => {
        let failed = false;
        try { await envio.methods.entregarPedido().send({ from: accounts[0] }); } catch (_) { failed = true; }
        assert.ok(failed);
    });
    it("tras cancelar ya no permite operaciones protegidas por notCancelled", async () => {
        await envio.methods.cancelarPedido().send({ from: accounts[0] });
        let f1 = false, f2 = false;
        try { await envio.methods.setReceptor(accounts[1]).send({ from: accounts[0] }); } catch (_) { f1 = true; }
        try { await envio.methods.addTransportistaAceptado().send({ from: accounts[2] }); } catch (_) { f2 = true; }
        assert.ok(f1 && f2);
    });
    it("enviador y receptor no pueden aceptar", async () => {
        await envio.methods.setTotalTransportistas(1).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[3]).send({ from: accounts[0] });

        let f1 = false, f2 = false;
        try { await envio.methods.addTransportistaAceptado().send({ from: accounts[0] }); } catch (_) { f1 = true; }
        try { await envio.methods.addTransportistaAceptado().send({ from: accounts[3] }); } catch (_) { f2 = true; }
        assert.ok(f1 && f2);
    });
    it("no se puede cancelar si ya está entregado (e2e completo)", async () => {
        await envio.methods.setTotalTransportistas(1).send({ from: accounts[0] });
        await envio.methods.setReceptor(accounts[5]).send({ from: accounts[0] });
        await envio.methods.addTransportistaAceptado().send({ from: accounts[2] });


        await envio.methods
            .cambiarPoseedor(accounts[2])
            .send({ from: accounts[0] });

        await envio.methods
            .cambiarPoseedor(accounts[5])
            .send({ from: accounts[2] });

        const estado = await envio.methods.estado().call();
        assert.strictEqual(estado, "3");

        let f = false;
        try {
            await envio.methods.cancelarPedido().send({ from: accounts[0] });
        } catch (_) {
            f = true;
        }
        assert.ok(f);
    });
});
