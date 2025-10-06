"use strict";

import prisma from "../config/prisma";
import { Remesa } from "../models/remesa";
import { Prisma } from "@prisma/client";
import { GeneralError } from "../server/serverInterface";
import { obtenerTransportistaCercanoaUnPunto } from "../helpers/asignarTransportistaHelper";
import { getSocket } from "../sockets";

export const obtenerLLevas = async (remesaId: number) => {
  try {
    const llevas = await prisma.lleva.findMany({
      where: { remesaId, status: { not: "CANCELADA" } },
      include: {
        conduce: {
          include: {
            transportista: { include: { usuario: true } },
            transporte: true,
          },
        },
      },
      orderBy: {
        orden: "asc",
      },
    });
    return llevas;
  } catch (error) {
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

    if (!conduce) {
      return [];
    }

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
    });
    return llevas;
  } catch (error) {
    throw new GeneralError(500, "Error fetching llevas", "servidor");
  }
};

export const aceptarLLeva = async (
  llevaId: number,
  transportistaId: number
) => {
  try {
    const result = await prisma.lleva.update({
      where: { id: llevaId },
      data: { status: "ACEPTADA" },
    });
    const io = getSocket();

    io.of("/asignaciones")
      .to(`transportista:${transportistaId}`)
      .emit("asignaciones:pendientes");
    return result;
  } catch (error) {
    throw new GeneralError(500, "Error aceptando lleva", "servidor");
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

      //CREO NUEVO LLEVA PARA TRANSPORTISTA NUEVO
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

      //VOLVER A PONER DISPONIBLE AL TRANSPORTISTA QUE HA CANCELADO
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
