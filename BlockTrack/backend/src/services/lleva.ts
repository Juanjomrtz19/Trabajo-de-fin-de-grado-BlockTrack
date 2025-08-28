"use strict";

import prisma from "../config/prisma";
import { Remesa } from "../models/remesa";
import { Prisma } from "@prisma/client";
import { GeneralError } from "../server/serverInterface";

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

export const aceptarLLeva = async (llevaId: number) => {
  try {
    await prisma.lleva.update({
      where: { id: llevaId },
      data: { status: "ACEPTADA" },
    });
  } catch (error) {
    throw new GeneralError(500, "Error accepting lleva", "servidor");
  }
};

export const rechazarLleva = async (llevaId: number) => {};
