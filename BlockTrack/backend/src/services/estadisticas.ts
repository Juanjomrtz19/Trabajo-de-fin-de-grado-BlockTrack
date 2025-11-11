"use strict";
import prisma from "../config/prisma";

export const obtenerEstadisticas = async (clientId: number, email: string) => {
  const totalRemesasCreadas = await prisma.remesa.count({
    where: { clienteId: clientId },
  });

  const transportistasActivos = await prisma.transportista.count({
    where: { disponibilidaActual: true },
  });

  const remesasARecoger = await prisma.remesa.count({
    where: {
      emailDestinatario: email,
    },
  });

  return {
    totalRemesasCreadas,
    transportistasActivos,
    remesasARecoger,
  };
};
