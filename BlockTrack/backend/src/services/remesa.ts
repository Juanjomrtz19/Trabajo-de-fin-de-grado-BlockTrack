"use strict";

import prisma from "../config/prisma";
import { Rol } from "@prisma/client";
import { Remesa } from "../models/remesa";
import { Prisma, EstadoRemesa } from "@prisma/client";
// @ts-ignore
import {
  envioFactoryRead,
  getEnvioFactoryForUserIndex,
  assertFactoryDeployed,
  CHAIN_ID,
  provider,
} from "../blockchain/envioFactory";

import {
  crearEntradasLLeva,
  seleccionarTransportistasParaRemesa,
  transportistasConCoche,
} from "../helpers/asignarTransportistaHelper";
import { GeneralError } from "../server/serverInterface";
import { lleva } from "../models/lleva";
import { getSocket } from "../sockets";
import envioJson from "../../../ethereum/build/Envio.json";
import { Contract } from "ethers";
const envioAbi = (envioJson as any).abi;
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ESTADO_LABELS = [
  "Creada",
  "Pendiente",
  "EnTransito",
  "Entregada",
  "Cancelada",
];
import {
  getWalletIndexByClienteId,
  signerFromIndex,
} from "../blockchain/carteraUsuario";
import { ensureFunds } from "../blockchain/faucet";

const toDecimal = (v?: number | string | Prisma.Decimal | null) =>
  v == null ? null : new Prisma.Decimal(v);

const toUint256 = (x: number | string | bigint) => BigInt(x);

export const obtenerRemesas = async (clienteId: number) => {
  try {
    const remesas = await prisma.remesa.findMany({
      where: { clienteId },
    });
    if (remesas.length === 0) return [];

    await assertFactoryDeployed();

    const userByWallet = new Map<
      string,
      { id: number; email: string; rol: string } | null
    >();

    const enriched = await Promise.all(
      remesas.map(async (r) => {
        try {
          const addr: string = await envioFactoryRead.getEnvioByRemesaId(
            BigInt(r.id)
          );
          if (!addr || addr === ZERO_ADDRESS) {
            return { ...r, onchain: null };
          }

          const envio = new Contract(addr, envioAbi, provider);

          const [estadoRaw, totalTransportistas, poseedorActual] =
            await Promise.all([
              envio.estado().then(Number),
              envio.totalTransportistas().then((n: any) => Number(n)),
              envio.poseedorActualRemesa(),
            ]);

          const estadoLabel = ESTADO_LABELS[estadoRaw] || "Desconocido";

          const walletLc = String(poseedorActual).toLowerCase();
          let user = userByWallet.get(walletLc) ?? null;
          if (!userByWallet.has(walletLc)) {
            user = await prisma.usuario.findUnique({
              where: { walletAddress: walletLc },
              select: { id: true, email: true, rol: true },
            });
            userByWallet.set(walletLc, user);
          }

          return {
            ...r,
            onchain: {
              address: addr,
              estadoLabel,
              poseedorActual: user?.email ?? null,
              transportistasTotales: totalTransportistas,
            },
          };
        } catch {
          return { ...r, onchain: null };
        }
      })
    );

    return enriched;
  } catch (error) {
    console.error("Error obtenerRemesas:", error);
    throw new Error("Error al obtener remesas");
  }
};

export const obtenerRemesa = async (idRemesa: number) => {
  try {
    const result = await prisma.remesa.findUnique({ where: { id: idRemesa } });

    await assertFactoryDeployed();
    const addr: string = await envioFactoryRead.getEnvioByRemesaId(
      BigInt(idRemesa)
    );
    if (!addr || addr === ZERO_ADDRESS) {
      return { ...result, onchain: null };
    }

    const envio = new Contract(addr, envioAbi, provider);
    const estado = Number(await envio.estado());
    const estadoLabel = ESTADO_LABELS[estado] || "Desconocido";
    const transportistasTotales = Number(await envio.totalTransportistas());

    const poseedorActual = await envio.poseedorActualRemesa();
    const user = await prisma.usuario.findUnique({
      where: { walletAddress: poseedorActual.toLowerCase() },
      select: { id: true, email: true, rol: true },
    });

    return {
      ...result,
      onchain: {
        address: addr,
        estadoLabel,
        poseedorActual: user?.email,
        transportistasTotales,
      },
    };
  } catch (error) {
    console.error("Error", error);
    throw new GeneralError(500, "Error al obtener remesa", "servidor");
  }
};

export const crearRemesa = async (data: Remesa) => {
  const remesa = await prisma.remesa.create({
    data: {
      clienteId: data.clienteId,
      peso: data.peso,
      medida: data.medida,
      nPaquetes: data.nPaquetes,
      tipoMercancia: data.tipoMercancia,
      estado: data.estado ?? EstadoRemesa.PENDIENTE,

      // ENTREGA
      dirEnvio: data.dirEnvio,
      ciudadEnvio: data.ciudadEnvio,
      codigoPostalEnvio: data.codigoPostalEnvio,
      latEnvio: toDecimal(data.latEnvio),
      lngEnvio: toDecimal(data.lngEnvio),

      // RECOGIDA
      dirRecogida: data.dirRecogida,
      ciudadRecogida: data.ciudadRecogida,
      codigoPostalRecogida: data.codigoPostalRecogida,
      latRecogida: toDecimal(data.latRecogida),
      lngRecogida: toDecimal(data.lngRecogida),

      // Contacto
      emailDestinatario: data.emailDestinatario,

      observaciones: data.observaciones ?? null,
    },
  });

  const idOnChain = BigInt(remesa.id);

  try {
    await assertFactoryDeployed();

    const walletIndex = await getWalletIndexByClienteId(remesa.clienteId);
    const factory = getEnvioFactoryForUserIndex(walletIndex);

    console.log("Firmando como:", await (factory.runner as any)?.getAddress());

    const existing = await envioFactoryRead.getEnvioByRemesaId(idOnChain);
    if (existing && existing !== ZERO_ADDRESS) {
      return {
        remesa,
        chain: { chainId: CHAIN_ID, contractAddress: existing, txHash: null },
      };
    }

    const tx = await factory.crearEnvio(idOnChain);
    const receipt = await tx.wait();

    let contractAddress: string | null = null;
    const iface = factory.interface;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === "EnvioCreado") {
          contractAddress = parsed.args?.envio as string;
          break;
        }
      } catch {}
    }

    if (!contractAddress) {
      contractAddress = await envioFactoryRead.getEnvioByRemesaId(idOnChain);
    }

    const addr = await envioFactoryRead.getEnvioByRemesaId(idOnChain);
    console.log("EnvioByRemesaId:", addr);

    return {
      remesa,
      chain: {
        chainId: CHAIN_ID,
        txHash: receipt.hash,
        contractAddress,
      },
    };
  } catch (err) {
    console.error("Error on-chain crearEnvio(uint256):", err);
    throw new Error("Error on-chain al crear la remesa");
  }
};

export const editarRemesa = async (data: Remesa, idRemesa: number) => {
  try {
    const result = await prisma.remesa.update({
      where: {
        id: idRemesa,
      },
      data: data,
    });

    return result;
  } catch (err) {
    console.error("Error", err);
    throw new Error("Error al editar remesa");
  }
};

export const cancelarRemesa = async (
  id: number,
  clienteId: number,
  estado: string
) => {
  try {
    const result = await prisma.remesa.update({
      where: {
        clienteId,
        id,
      },

      data: {
        estado: estado as EstadoRemesa,
      },
    });

    return result;
  } catch (err) {
    console.error("Error", err);
    throw new Error("Error al cancelar remesa");
  }
};

export const cambiarPoseedorSiguiente = async (
  remesaId: number,
  emailPoseedorActual: string
) => {
  try {
    await assertFactoryDeployed();
    const envioAddr: string = await envioFactoryRead.getEnvioByRemesaId(
      BigInt(remesaId)
    );
    if (!envioAddr || envioAddr === ZERO_ADDRESS) {
      throw new GeneralError(
        404,
        "Contrato Envio no desplegado para esta remesa",
        "onchain"
      );
    }

    const envioRead = new Contract(envioAddr, envioAbi, provider);
    const poseedorOnchain: string = (
      await envioRead.poseedorActualRemesa()
    ).toLowerCase();
    const receptorOnchain: string =
      (await envioRead.receptor())?.toLowerCase?.() ?? ZERO_ADDRESS;

    const actorUser = await prisma.usuario.findUnique({
      where: { walletAddress: poseedorOnchain },
      select: { id: true, email: true, walletIndex: true, walletAddress: true },
    });
    if (!actorUser?.walletIndex) {
      throw new GeneralError(
        400,
        "Poseedor actual sin walletIndex configurado",
        "servidor"
      );
    }

    const emailActorDb = actorUser.email?.toLowerCase();
    if (!emailActorDb || emailActorDb !== emailPoseedorActual.toLowerCase()) {
      throw new GeneralError(
        403,
        "El email no corresponde al poseedor actual",
        "servidor"
      );
    }

    const remesa = await prisma.remesa.findUnique({
      where: { id: remesaId },
      select: {
        cliente: { select: { usuario: { select: { email: true } } } },
        emailDestinatario: true,
      },
    });

    const llevas = await prisma.lleva.findMany({
      where: { remesaId },
      include: {
        conduce: {
          include: {
            transportista: { include: { usuario: true } },
            transporte: true,
          },
        },
      },
      orderBy: { orden: "asc" },
    });

    const emailDe = (idx: number) =>
      llevas[idx]?.conduce?.transportista?.usuario?.email?.toLowerCase() ??
      null;
    const walletDe = (idx: number) =>
      llevas[
        idx
      ]?.conduce?.transportista?.usuario?.walletAddress?.toLowerCase() ?? null;

    let destinoAddr: string | null = null;
    let destinoLabel: string | null = null;

    const emailCliente = remesa?.cliente?.usuario?.email?.toLowerCase() ?? null;
    const esCliente =
      emailCliente && emailPoseedorActual.toLowerCase() === emailCliente;

    if (esCliente) {
      // Creador -> primera Lleva
      if (llevas.length === 0) {
        throw new GeneralError(
          404,
          "No hay llevas para esta remesa",
          "servidor"
        );
      }
      const walletPrimera = walletDe(0);
      if (!walletPrimera) {
        throw new GeneralError(
          404,
          "La primera Lleva no tiene transportista/usuario con wallet",
          "servidor"
        );
      }
      destinoAddr = walletPrimera;
      destinoLabel = emailDe(0) ?? walletPrimera;
    } else {
      const emailLower = emailPoseedorActual.toLowerCase();
      const idx = llevas.findIndex(
        (l) =>
          l.conduce?.transportista?.usuario?.email?.toLowerCase() === emailLower
      );

      if (idx === -1) {
        throw new GeneralError(
          404,
          "El email no corresponde a ningún transportista de los tramos (llevas)",
          "servidor"
        );
      }

      if (idx < llevas.length - 1) {
        const walletSiguiente = walletDe(idx + 1);
        if (!walletSiguiente) {
          throw new GeneralError(
            404,
            "La siguiente Lleva no tiene transportista/usuario con wallet",
            "servidor"
          );
        }
        destinoAddr = walletSiguiente;
        destinoLabel = emailDe(idx + 1) ?? walletSiguiente;
      } else {
        if (!receptorOnchain || receptorOnchain === ZERO_ADDRESS) {
          throw new GeneralError(
            400,
            "Receptor no configurado en el contrato",
            "onchain"
          );
        }
        destinoAddr = receptorOnchain;
        destinoLabel = "receptor";
      }
    }

    const esDestinoValido =
      (receptorOnchain &&
        receptorOnchain !== ZERO_ADDRESS &&
        receptorOnchain.toLowerCase() === destinoAddr) ||
      (await envioRead.transportistasAceptados(destinoAddr).catch(() => false));

    if (!esDestinoValido) {
      throw new GeneralError(
        400,
        "El siguiente poseedor debe ser receptor o transportista aceptado",
        "onchain"
      );
    }

    const signer = signerFromIndex(actorUser.walletIndex);
    const envio = new Contract(envioAddr, envioAbi, signer);
    const tx = await envio.cambiarPoseedor(destinoAddr);
    const receipt = await tx.wait();

    return {
      contractAddress: envioAddr,
      txHash: receipt.hash,
      from: actorUser.email ?? poseedorOnchain,
      to: destinoLabel ?? destinoAddr,
    };
  } catch (error: any) {
    const msg =
      error?.shortMessage ||
      error?.reason ||
      error?.message ||
      "Error cambiando el poseedor al siguiente";
    throw new GeneralError(500, msg, "servidor");
  }
};

export const asignarRemesaATransportistas = async (idRemesa: number) => {
  try {
    const remesa = await prisma.remesa.findUnique({ where: { id: idRemesa } });
    if (!remesa)
      throw new GeneralError(404, "Remesa no encontrada", "servidor");
    if (remesa.estado === EstadoRemesa.CANCELADA) {
      throw new GeneralError(500, "La remesa está cancelada", "servidor");
    }

    const puntoInicialEnvio = {
      lat: remesa.latEnvio ? Number(remesa.latEnvio) : 0,
      lng: remesa.lngEnvio ? Number(remesa.lngEnvio) : 0,
    };
    const puntoFinalEnvio = {
      lat: remesa.latRecogida ? Number(remesa.latRecogida) : 0,
      lng: remesa.lngRecogida ? Number(remesa.lngRecogida) : 0,
    };

    let transportistas: any[] = await transportistasConCoche();
    transportistas = transportistas.map((t) => ({
      id: t.transportista.id,
      zonaOperativaLat: t.transportista.zonaOperativaLat,
      zonaOperativaLng: t.transportista.zonaOperativaLng,
    }));

    const transportistasSeleccionados =
      await seleccionarTransportistasParaRemesa(
        transportistas,
        puntoInicialEnvio,
        puntoFinalEnvio
      );

    const entradasTablaLleva: lleva[] = await crearEntradasLLeva(
      transportistasSeleccionados,
      puntoInicialEnvio,
      puntoFinalEnvio,
      remesa
    );

    const totalNecesarios = entradasTablaLleva.length;
    if (totalNecesarios <= 0) {
      throw new GeneralError(
        400,
        "No hay transportistas candidatos",
        "servidor"
      );
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: remesa.clienteId },
      select: {
        usuario: { select: { walletIndex: true, walletAddress: true } },
      },
    });
    const walletIndex = cliente?.usuario.walletIndex;
    const walletAddress = cliente?.usuario.walletAddress?.toLowerCase();
    if (walletIndex == null || !walletAddress) {
      throw new GeneralError(
        500,
        "El enviador no tiene wallet asignada",
        "servidor"
      );
    }

    const envioAddr: string = await envioFactoryRead.getEnvioByRemesaId(
      BigInt(remesa.id)
    );
    if (!envioAddr || envioAddr === ZERO_ADDRESS) {
      throw new GeneralError(
        404,
        "Contrato Envio no desplegado para esta remesa",
        "servidor"
      );
    }

    const signer = signerFromIndex(walletIndex);
    const from = (await signer.getAddress()).toLowerCase();
    if (from !== walletAddress) {
      throw new GeneralError(
        500,
        "Signer del enviador no coincide con su wallet",
        "servidor"
      );
    }
    await ensureFunds(from, "0.005", "0.02");

    const envio = new Contract(envioAddr, envioAbi, signer);

    const currentTotal: bigint = await envio.totalTransportistas();
    if (Number(currentTotal) !== totalNecesarios) {
      const tx = await envio.setTotalTransportistas(totalNecesarios);
      await tx.wait();
    }

    const transaction = await prisma.$transaction(async (prisma) => {
      const cambioDisponibilidad = await prisma.transportista.updateMany({
        where: {
          id: {
            in: transportistasSeleccionados.map((t) => t.transportista.id),
          },
        },
        data: { disponibilidaActual: false },
      });
      if (cambioDisponibilidad.count <= 0) {
        throw new GeneralError(
          500,
          "No se pudo actualizar la disponibilidad de los transportistas",
          "servidor"
        );
      }

      await prisma.remesa.update({
        where: { id: idRemesa },
        data: { estado: EstadoRemesa.ASIGNADA },
      });

      return await prisma.lleva.createMany({ data: entradasTablaLleva });
    });

    for (const l of entradasTablaLleva) {
      const transportista = await prisma.conduce.findUnique({
        where: { id: l.conduceId },
        select: { transportistaId: true },
      });
      const io = getSocket();
      io.of("/asignaciones")
        .to(`transportista:${transportista?.transportistaId}`)
        .emit("asignaciones:pendientes");
    }

    return transaction;
  } catch (err: any) {
    console.error("Error", err);
    const msg =
      err?.shortMessage ??
      err?.reason ??
      err?.message ??
      "Error al asignar remesa";
    throw new Error(msg);
  }
};
