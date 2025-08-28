import prisma from "../../config/prisma";
import fs from "node:fs/promises";
import { Prisma, Rol } from "@prisma/client";
import path from "node:path";

export async function crearVehicles() {
  const file = await fs.readFile(
    path.join(__dirname, "../data/vehicles.json"),
    "utf-8"
  );
  const transportistas = await prisma.transportista.findMany({
    select: { id: true },
  });
  if (transportistas.length === 0) {
    console.log("No hay transportistas disponibles");
    return;
  }
  const vehiculos: Prisma.TransporteCreateManyInput[] = JSON.parse(file);
  const vehiculosConTransportista: Prisma.TransporteCreateManyInput[] =
    vehiculos.map((v, i) => {
      const transportista = transportistas[i % transportistas.length];
      return {
        ...v,
        creadorId: transportista.id,
      };
    });

  await prisma.transporte.createMany({
    data: vehiculosConTransportista,
    skipDuplicates: true,
  });

  console.log("Vehículos creados con éxito");
}
