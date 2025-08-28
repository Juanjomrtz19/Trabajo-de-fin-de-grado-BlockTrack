import prisma from "../../config/prisma";
import fs from "node:fs/promises";
import { Prisma, Rol } from "@prisma/client";
import path from "node:path";

export async function crearConduce() {
  const transportistas = await prisma.transportista.findMany({
    select: { id: true },
  });
  let dataConduce: Prisma.ConduceCreateManyInput[] = [];
  for (const transportista of transportistas) {
    const vehicles = await prisma.transporte.findMany({
      where: { creadorId: transportista.id },
    });
    if (vehicles.length > 0)
      dataConduce.push({
        transporteId: vehicles[0].id,
        transportistaId: transportista.id,
      });
  }
  await prisma.conduce.createMany({
    data: dataConduce,
    skipDuplicates: true,
  });

  console.log("Conducciones creadas con éxito");
}
