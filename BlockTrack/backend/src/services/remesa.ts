"use strict";

import prisma from "../config/prisma";
import { Rol } from "@prisma/client";
import { Remesa } from "../models/remesa";
import { Prisma, EstadoRemesa } from "@prisma/client";

import {
  crearEntradasLLeva,
  seleccionarTransportistasParaRemesa,
  transportistasConCoche,
} from "../helpers/asignarTransportistaHelper";
import { GeneralError } from "../server/serverInterface";
import { lleva } from "../models/lleva";

const toDecimal = (v?: number | string | Prisma.Decimal | null) =>
  v == null ? null : new Prisma.Decimal(v);

export const obtenerRemesas = async (clienteId: number) => {
  try {
    const result = await prisma.remesa.findMany({
      where: { clienteId: clienteId },
    });
    return result;
  } catch (error) {
    console.error("Error", error);
    throw new Error("Error al obtener remesas");
  }
};

export const obtenerRemesa = async (idRemesa: number) => {
  try {
    const result = await prisma.remesa.findUnique({
      where: { id: idRemesa },
    });
    return result;
  } catch (error) {
    console.error("Error", error);
    throw new GeneralError(500, "Error al obtener remesa", "servidor");
  }
};

export const crearRemesa = async (data: Remesa) => {
  const {
    // Relaciones
    clienteId,

    // Datos de la remesa
    peso,
    medida,
    nPaquetes,
    tipoMercancia,
    estado,

    // ENTREGA
    dirEnvio,
    ciudadEnvio,
    codigoPostalEnvio,
    latEnvio,
    lngEnvio,

    // RECOGIDA
    dirRecogida,

    ciudadRecogida,
    codigoPostalRecogida,
    latRecogida,
    lngRecogida,

    // Destinatario
    emailDestinatario,

    // Otros
    observaciones,
  } = data;

  try {
    const result = await prisma.remesa.create({
      data: {
        clienteId,
        peso,
        medida,
        nPaquetes,
        tipoMercancia,
        estado: estado ?? EstadoRemesa.PENDIENTE,

        // ENTREGA
        dirEnvio,

        ciudadEnvio,
        codigoPostalEnvio,
        latEnvio: toDecimal(latEnvio),
        lngEnvio: toDecimal(lngEnvio),

        // RECOGIDA
        dirRecogida,

        ciudadRecogida,
        codigoPostalRecogida,
        latRecogida: toDecimal(latRecogida),
        lngRecogida: toDecimal(lngRecogida),

        // Contacto
        emailDestinatario,

        observaciones: observaciones ?? null,
      },
    });

    return result;
  } catch (err) {
    console.error("Error al crear remesa", err);
    throw new Error("Error al crear remesa");
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

//UTILIZACIÓN DE UN ALGORITMO VORAZ (GREEDY)
export const asignarRemesaATransportistas = async (idRemesa: number) => {
  try {
    const remesa = await prisma.remesa.findUnique({
      where: { id: idRemesa },
    });
    if (remesa?.estado === EstadoRemesa.CANCELADA) {
      throw new GeneralError(500, "La remesa está cancelada", "servidor");
    }
    if (!remesa) {
      throw new GeneralError(404, "Remesa no encontrada", "servidor");
    }

    const puntoInicialEnvio = {
      lat: remesa?.latEnvio ? Number(remesa.latEnvio) : 0,
      lng: remesa?.lngEnvio ? Number(remesa.lngEnvio) : 0,
    };

    const puntoFinalEnvio = {
      lat: remesa?.latRecogida ? Number(remesa.latRecogida) : 0,
      lng: remesa?.lngRecogida ? Number(remesa.lngRecogida) : 0,
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

    let entradasTablaLleva: lleva[] = await crearEntradasLLeva(
      transportistasSeleccionados,
      puntoInicialEnvio,
      puntoFinalEnvio,
      remesa
    );

    const transaction = await prisma.$transaction(async (prisma) => {
      let cambioDisponibilidad = await prisma.transportista.updateMany({
        where: {
          id: {
            in: transportistasSeleccionados.map((t) => t.transportista.id),
          },
        },
        data: {
          disponibilidaActual: false,
        },
      });

      if (cambioDisponibilidad.count <= 0) {
        throw new GeneralError(
          500,
          "No se pudo actualizar la disponibilidad de los transportistas",
          "servidor"
        );
      }

      const cambioEstadoRemesa = await prisma.remesa.update({
        where: { id: idRemesa },
        data: { estado: EstadoRemesa.ASIGNADA },
      });

      return await prisma.lleva.createMany({
        data: entradasTablaLleva,
      });
    });

    return transaction;
  } catch (err) {
    console.error("Error", err);
    throw new Error("Error al asignar remesa a transportistas");
  }
};
