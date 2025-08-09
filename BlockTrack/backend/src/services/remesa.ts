"use strict";

import prisma from "../config/prisma";
import { Rol } from "@prisma/client";
import { Remesa } from "../models/remesa";

export const crearRemesa = async (data: Remesa) => {
  const {
    clienteId,
    peso,
    medida,
    nPaquetes,
    tipoMercancia,
    dirEnvio,
    dirRecogida,
    ciudad,
    estado,
    observaciones,
    codigoPostal,
  } = data;

  try {
    const result = await prisma.remesa.create({
      data: {
        clienteId,
        peso,
        medida,
        nPaquetes,
        tipoMercancia,
        estado: estado ?? "En preparacion",
        dirEnvio,
        dirRecogida,
        ciudad,
        observaciones,
        codigoPostal,
      },
    });

    return result;
  } catch (err) {
    console.error("Error", err);
    throw new Error("Error al crear remesa");
  }
};

export const editarRemesa = async (data: Remesa) => {
  const {
    clienteId,
    peso,
    medida,
    nPaquetes,
    tipoMercancia,
    dirEnvio,
    dirRecogida,
    ciudad,
    estado,
    observaciones,
    codigoPostal,
    id,
  } = data;

  try {
    const result = await prisma.remesa.update({
      where: {
        id,
      },
      data: {
        clienteId,
        peso,
        medida,
        nPaquetes,
        tipoMercancia,
        dirEnvio,
        dirRecogida,
        ciudad,
        estado,
        observaciones,
        codigoPostal,
      },
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
        estado,
      },
    });

    return result;
  } catch (err) {
    console.error("Error", err);
    throw new Error("Error al cancelar remesa");
  }
};
