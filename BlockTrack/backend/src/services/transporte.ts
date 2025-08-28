import prisma from "../config/prisma";
import { Transporte } from "../models/transporte";
import { GeneralError } from "../server/serverInterface";

export const create = async (
  transportistaId: number,
  transporte: Transporte
) => {
  try {
    const result = await prisma.transporte.create({
      data: {
        creadorId: transportistaId,
        tipoCarga: transporte.tipoCarga,
        matricula: transporte.matricula,
        capacidadCarga: transporte.capacidadCarga,
        marca: transporte.marca,
      },
    });
    return result;
  } catch (error) {
    console.error("Error creating transporte:", error);
    throw new GeneralError(500, "Error al crear el transporte", "servidor");
  }
};

export const getAll = async (transportistaId: number) => {
  try {
    const result = await prisma.transporte.findMany({
      where: {
        creadorId: transportistaId,
      },
    });
    return result;
  } catch (error) {
    console.error("Error fetching transportes:", error);
    throw new GeneralError(500, "Error al obtener los transportes", "servidor");
  }
};

export const update = async (id: number, transporte: Partial<Transporte>) => {
  try {
    const result = await prisma.transporte.update({
      where: { id },
      data: transporte,
    });
    return result;
  } catch (error) {
    console.error("Error updating transporte:", error);
    throw new GeneralError(
      500,
      "Error al actualizar el transporte",
      "servidor"
    );
  }
};

export const deleteOne = async (id: number) => {
  try {
    const result = await prisma.transporte.delete({
      where: { id },
    });
    return result;
  } catch (error) {
    console.error("Error deleting transporte:", error);
    throw new GeneralError(500, "Error al eliminar el transporte", "servidor");
  }
};
