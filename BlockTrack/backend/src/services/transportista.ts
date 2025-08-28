import prisma from "../config/prisma";

export const almacenarBaja = async (baja: boolean, transportistaId: number) => {
  try {
    const result = prisma.transportista.update({
      where: { id: transportistaId },
      data: { estaDeBaja: baja },
    });

    return result;
  } catch (error) {
    console.error("Error", error);
    throw new Error("Error al darse de baja");
  }
};
