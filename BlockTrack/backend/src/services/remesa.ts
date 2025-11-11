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
    // 1) Cargar remesas del cliente
    const remesas = await prisma.remesa.findMany({
      where: { clienteId },
    });
    if (remesas.length === 0) return [];

    // 2) Asegurar factory desplegada (una sola vez)
    await assertFactoryDeployed();

    // Cache para no repetir la misma búsqueda de usuario por wallet
    const userByWallet = new Map<
      string,
      { id: number; email: string; rol: string } | null
    >();

    // 3) Construir respuesta en paralelo
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
          // Si algo falla para una remesa concreta, devolvemos onchain:null (no rompemos todo)
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

    // Contrato Envio en SOLO LECTURA
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
  // 1) Crea la fila off-chain (tu código original)
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

  // ⚠️ remesa.id debe ser number/bigint (no string UUID)
  const idOnChain = BigInt(remesa.id);

  try {
    await assertFactoryDeployed();

    // Instancia de factory FIRMADA por el usuario (enviador)
    const walletIndex = await getWalletIndexByClienteId(remesa.clienteId);
    const factory = getEnvioFactoryForUserIndex(walletIndex);

    console.log("Firmando como:", await (factory.runner as any)?.getAddress());

    // 1) Idempotencia (lectura con provider)
    const existing = await envioFactoryRead.getEnvioByRemesaId(idOnChain);
    if (existing && existing !== ZERO_ADDRESS) {
      return {
        remesa,
        chain: { chainId: CHAIN_ID, contractAddress: existing, txHash: null },
      };
    }

    // 2) Crear on-chain firmando como el usuario
    const tx = await factory.crearEnvio(idOnChain);
    const receipt = await tx.wait();

    // 3) Parsear evento de la FACTORY usada para enviar
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

    // 4) Fallback de lectura
    if (!contractAddress) {
      contractAddress = await envioFactoryRead.getEnvioByRemesaId(idOnChain);
    }

    // (opcional) log de verificación
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
    // 1) Resolver contrato
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

    // 2) Lecturas on-chain base
    const envioRead = new Contract(envioAddr, envioAbi, provider);
    const poseedorOnchain: string = (
      await envioRead.poseedorActualRemesa()
    ).toLowerCase();
    const receptorOnchain: string =
      (await envioRead.receptor())?.toLowerCase?.() ?? ZERO_ADDRESS;

    // 3) Resolver actor (quien firma) a partir del poseedor on-chain
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

    // 3.b (seguridad): comprobar que el email indicado corresponde al poseedor actual
    const emailActorDb = actorUser.email?.toLowerCase();
    if (!emailActorDb || emailActorDb !== emailPoseedorActual.toLowerCase()) {
      // Si quieres permitir desajustes, comenta este bloque;
      // mantenerlo evita abusos vía endpoint.
      throw new GeneralError(
        403,
        "El email no corresponde al poseedor actual",
        "servidor"
      );
    }

    // 4) Datos off-chain: cliente (creador) y llevas ordenadas
    const remesa = await prisma.remesa.findUnique({
      where: { id: remesaId },
      select: {
        cliente: { select: { usuario: { select: { email: true } } } },
        emailDestinatario: true, // por si lo quieres para UI/logs
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

    // Utilidades para obtener email y wallet de una lleva
    const emailDe = (idx: number) =>
      llevas[idx]?.conduce?.transportista?.usuario?.email?.toLowerCase() ??
      null;
    const walletDe = (idx: number) =>
      llevas[
        idx
      ]?.conduce?.transportista?.usuario?.walletAddress?.toLowerCase() ?? null;

    // 5) Determinar siguiente destino según reglas
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
      // Buscar índice de la lleva cuyo transportista tiene ese email
      const emailLower = emailPoseedorActual.toLowerCase();
      const idx = llevas.findIndex(
        (l) =>
          l.conduce?.transportista?.usuario?.email?.toLowerCase() === emailLower
      );

      if (idx === -1) {
        // Si no está en la lista de llevas, el "siguiente" no es claro
        // (podría ser un hand-off no mapeado). Lanza error explícito.
        throw new GeneralError(
          404,
          "El email no corresponde a ningún transportista de los tramos (llevas)",
          "servidor"
        );
      }

      if (idx < llevas.length - 1) {
        // Siguiente tramo -> siguiente transportista
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
        // Última lleva -> receptor
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

    // 6) Validación amable: receptor o transportista aceptado (contrato lo exige)
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

    // 7) Firmar como P/O actual y cambiar poseedor
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

//UTILIZACIÓN DE UN ALGORITMO VORAZ (GREEDY)
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

    // 1) Selección off-chain
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

    // 2) On-chain: setTotalTransportistas firmado por el ENVIADOR (cliente de la remesa)
    // 2.1) Obtén wallet del enviador (usuario del cliente)
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

    // 2.2) Dirección del contrato Envio para esta remesa
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

    // 2.3) Firmar como enviador y fondear si hace falta
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

    // 2.4) Idempotencia: sólo llama si hace falta cambiarlo
    const currentTotal: bigint = await envio.totalTransportistas();
    if (Number(currentTotal) !== totalNecesarios) {
      // ojo: duringSetup -> sólo válido si el Envio sigue en Creada
      const tx = await envio.setTotalTransportistas(totalNecesarios);
      await tx.wait();
    }

    // 3) BD: ahora sí, bloqueamos disponibilidad y creamos llevas
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

    // 4) Notificaciones
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
    // Si el require del contrato salta (p. ej., "Configuracion cerrada" o "Total menor que aceptados"),
    // propaga un mensaje claro:
    const msg =
      err?.shortMessage ??
      err?.reason ??
      err?.message ??
      "Error al asignar remesa";
    throw new Error(msg);
  }
};
