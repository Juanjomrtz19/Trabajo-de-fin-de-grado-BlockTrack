import prisma from "../config/prisma";
import { Conduce } from "../models/conduce";
import { GeneralError } from "../server/serverInterface";

export const createConduce = async (conduceData: Conduce) => {
  console.log("conduceData", conduceData);
  try {
    const result = await prisma.conduce.upsert({
      where: { transportistaId: conduceData.transportistaId },
      update: { ...conduceData, transportistaId: conduceData.transportistaId },
      create: { ...conduceData, transportistaId: conduceData.transportistaId },
    });

    return result;
  } catch (error) {
    console.error("Error creating conduce", error);
    throw new GeneralError(
      500,
      "Error al crear el registro de conduce",
      "servidor"
    );
  }
};

export const getConduceByTransportistaId = async (transportistaId: number) => {
  try {
    const conduce = await prisma.conduce.findUnique({
      where: { transportistaId },
    });

    return conduce;
  } catch (error) {
    console.error("Error fetching conduce", error);
    throw new GeneralError(
      500,
      "Error al obtener el registro de conduce",
      "servidor"
    );
  }
};

export const borrarConduce = async (transportistaId: number) => {
  try {
    const result = await prisma.conduce.delete({
      where: { transportistaId },
    });

    return result;
  } catch (error) {
    console.error("Error deleting conduce", error);
    throw new GeneralError(
      500,
      "Error al eliminar el registro de conduce",
      "servidor"
    );
  }
};
