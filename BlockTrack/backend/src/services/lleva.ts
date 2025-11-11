"use strict";

import prisma from "../config/prisma";
import { Remesa } from "../models/remesa";
import { EstadoLleva, Prisma } from "@prisma/client";
import { GeneralError } from "../server/serverInterface";
import { obtenerTransportistaCercanoaUnPunto } from "../helpers/asignarTransportistaHelper";
import { getSocket } from "../sockets";
import {
  assertFactoryDeployed,
  envioFactoryRead,
  provider,
} from "../blockchain/envioFactory";
import { ESTADO_LABELS, ZERO_ADDRESS } from "./remesa";
import { Contract } from "ethers";
import envioJson from "../../../ethereum/build/Envio.json";
import { signerFromIndex } from "../blockchain/carteraUsuario";
const envioAbi = (envioJson as any).abi;

export const obtenerLLevas = async (remesaId: number) => {
  try {
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

    if (llevas.length === 0) {
      return [];
    }

    await assertFactoryDeployed();
    const addr: string = await envioFactoryRead.getEnvioByRemesaId(
      BigInt(remesaId)
    );
    if (!addr || addr === ZERO_ADDRESS) {
      return llevas
        .filter((l) => l.status !== EstadoLleva.CANCELADA)
        .sort((a, b) => a.orden - b.orden);
    }

    const envio = new Contract(addr, envioAbi, provider);

    const walletByLlevaId = new Map<number, string>();
    const uniqueWallets = new Set<string>();

    for (const l of llevas) {
      const wallet = l.conduce?.transportista?.usuario?.walletAddress ?? "";
      const norm =
        wallet && wallet.startsWith("0x") ? wallet.toLowerCase() : "";
      walletByLlevaId.set(l.id, norm);
      if (norm) uniqueWallets.add(norm);
    }

    const acceptedByWallet = new Map<string, boolean>();
    await Promise.all(
      Array.from(uniqueWallets).map(async (w) => {
        try {
          const ok: boolean = await envio.transportistasAceptados(w);
          acceptedByWallet.set(w, ok);
        } catch {
          acceptedByWallet.set(w, false);
        }
      })
    );

    const updates: ReturnType<typeof prisma.lleva.update>[] = [];

    for (const l of llevas) {
      if (l.status === EstadoLleva.CANCELADA) continue;

      const wallet = walletByLlevaId.get(l.id) ?? "";
      const isAccepted = wallet ? acceptedByWallet.get(wallet) ?? false : false;
      const desired = isAccepted ? EstadoLleva.ACEPTADA : EstadoLleva.PENDIENTE;

      if (l.status !== desired) {
        updates.push(
          prisma.lleva.update({
            where: { id: l.id },
            data: { status: desired },
          })
        );
      }
    }

    if (updates.length) {
      await prisma.$transaction(updates);
    }

    const resultado = await prisma.lleva.findMany({
      where: { remesaId, status: { not: "CANCELADA" } },
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

    return resultado;
  } catch (error) {
    console.error("Error obtenerLLevas:", error);
    throw new GeneralError(500, "Error fetching llevas", "servidor");
  }
};

export const obtenerLLevasPorTransportista = async (
  transportistaId: number
) => {
  try {
    const conduce = await prisma.conduce.findFirst({
      where: { transportistaId },
      select: { id: true },
    });

    if (!conduce) return [];

    const llevas = await prisma.lleva.findMany({
      where: { conduceId: conduce.id },
      select: {
        id: true,
        dirFin: true,
        dirInicio: true,
        distanciaKm: true,
        remesaId: true,
        latInicio: true,
        lngInicio: true,
        latFin: true,
        lngFin: true,
        fecha: true,
        hora: true,
        status: true,
      },
      orderBy: { remesaId: "asc" },
    });
    if (llevas.length === 0) return [];

    await assertFactoryDeployed();

    const uniqueRemesas = Array.from(new Set(llevas.map((l) => l.remesaId)));
    const envioAddrByRemesa = new Map<number, string>();
    const onchainByRemesa = new Map<
      number,
      {
        address: string;
        estadoLabel: string;
        poseedorActual: string | null;
        transportistasTotales: number;
      } | null
    >();
    const userByWallet = new Map<
      string,
      { id: number; email: string; rol: string } | null
    >();

    await Promise.all(
      uniqueRemesas.map(async (rid) => {
        const addr = await envioFactoryRead.getEnvioByRemesaId(BigInt(rid));
        envioAddrByRemesa.set(rid, addr);
      })
    );

    await Promise.all(
      uniqueRemesas.map(async (rid) => {
        const addr = envioAddrByRemesa.get(rid) as string;
        if (!addr || addr === ZERO_ADDRESS) {
          onchainByRemesa.set(rid, null);
          return;
        }

        try {
          const envio = new Contract(addr, envioAbi, provider);
          const [estadoRaw, totalTransportistas, poseedor] = await Promise.all([
            envio.estado().then(Number),
            envio.totalTransportistas().then((n: any) => Number(n)),
            envio.poseedorActualRemesa(),
          ]);

          const estadoLabel = ESTADO_LABELS[estadoRaw] || "Desconocido";

          const walletLc = String(poseedor).toLowerCase();
          let user = userByWallet.get(walletLc) ?? null;
          if (!userByWallet.has(walletLc)) {
            user = await prisma.usuario.findUnique({
              where: { walletAddress: walletLc },
              select: { id: true, email: true, rol: true },
            });
            userByWallet.set(walletLc, user);
          }

          onchainByRemesa.set(rid, {
            address: addr,
            estadoLabel,
            poseedorActual: user?.email ?? null,
            transportistasTotales: totalTransportistas,
          });
        } catch {
          onchainByRemesa.set(rid, null);
        }
      })
    );

    const enriched = llevas.map((l) => ({
      ...l,
      onchain: onchainByRemesa.get(l.remesaId) ?? null,
    }));

    return enriched;
  } catch (error) {
    throw new GeneralError(500, "Error fetching llevas", "servidor");
  }
};

export const aceptarLLeva = async (
  llevaId: number,
  transportistaId: number
) => {
  try {
    const lleva = await prisma.lleva.findUnique({
      where: { id: llevaId },
      include: {
        remesa: { select: { id: true } },
        conduce: {
          select: {
            transportistaId: true,
            transportista: {
              select: {
                usuario: {
                  select: { id: true, walletIndex: true, walletAddress: true },
                },
              },
            },
          },
        },
      },
    });

    if (!lleva) throw new GeneralError(404, "Lleva no encontrada", "servidor");
    if (!lleva.remesa?.id)
      throw new GeneralError(400, "Lleva sin remesa asociada", "servidor");

    if (lleva.conduce?.transportistaId !== transportistaId) {
      throw new GeneralError(
        403,
        "El transportista no corresponde a esta lleva",
        "servidor"
      );
    }

    const walletIndex = lleva.conduce?.transportista?.usuario?.walletIndex;
    if (walletIndex == null) {
      throw new GeneralError(
        400,
        "El transportista no tiene wallet configurada",
        "servidor"
      );
    }

    await assertFactoryDeployed();
    const addr: string = await envioFactoryRead.getEnvioByRemesaId(
      BigInt(lleva.remesa.id)
    );
    if (!addr || addr === ZERO_ADDRESS) {
      throw new GeneralError(
        404,
        "Contrato Envio no desplegado para esta remesa",
        "onchain"
      );
    }

    const signer = signerFromIndex(walletIndex);
    const envio = new Contract(addr, envioAbi, signer);

    const tx = await envio.addTransportistaAceptado();
    const receipt = await tx.wait();

    const io = getSocket();
    io.of("/asignaciones")
      .to(`transportista:${transportistaId}`)
      .emit("asignaciones:pendientes");

    return { txHash: receipt.hash, contractAddress: addr };
  } catch (error: any) {
    const msg =
      error?.shortMessage ||
      error?.reason ||
      error?.message ||
      "Error aceptando lleva";
    throw new GeneralError(500, msg, "servidor");
  }
};

export const rechazarLleva = async (
  llevaId: number,
  transportistaId: number
) => {
  try {
    let actualLleva = await prisma.lleva.findUnique({
      where: { id: llevaId },
    });

    if (!actualLleva)
      throw new GeneralError(404, "Lleva no encontrada", "servidor");
    let nuevoTransportistaId = await obtenerTransportistaCercanoaUnPunto({
      lat: Number(actualLleva?.latInicio),
      lng: Number(actualLleva?.lngInicio),
    });

    if (!nuevoTransportistaId)
      throw new GeneralError(404, "Transportista no encontrado", "servidor");

    console.log("nuevoTransportistaId:", nuevoTransportistaId);

    const nuevoConduce = await prisma.conduce.findUnique({
      where: { transportistaId: Number(nuevoTransportistaId) },
    });

    if (!nuevoConduce)
      throw new GeneralError(404, "Conduce no encontrado", "servidor");

    const transaccion = await prisma.$transaction(async (prisma) => {
      //CANCELAR LA ENTRADA LLEVA
      await prisma.lleva.update({
        where: { id: llevaId },
        data: { status: "CANCELADA" },
      });

      const result = await prisma.lleva.create({
        data: {
          dirFin: actualLleva.dirFin,
          dirInicio: actualLleva.dirInicio,
          distanciaKm: actualLleva.distanciaKm,
          remesaId: actualLleva.remesaId,
          latInicio: actualLleva.latInicio,
          lngInicio: actualLleva.lngInicio,
          latFin: actualLleva.latFin,
          lngFin: actualLleva.lngFin,
          fecha: actualLleva.fecha,
          hora: actualLleva.hora,
          status: "PENDIENTE",
          conduceId: nuevoConduce.id,
          orden: actualLleva.orden,
        },
      });

      await prisma.transportista.update({
        where: { id: transportistaId },
        data: { disponibilidaActual: true },
      });
      return result;
    });

    const io = getSocket();
    io.of("/asignaciones")
      .to(`transportista:${nuevoTransportistaId}`)
      .emit("asignaciones:pendientes");

    io.of("/asignaciones")
      .to(`transportista:${transportistaId}`)
      .emit("asignaciones:pendientes");

    return transaccion;
  } catch (error: any) {
    throw new GeneralError(
      500,
      `Error rechazando el tramo ${error.message}`,
      "servidor"
    );
  }
};
