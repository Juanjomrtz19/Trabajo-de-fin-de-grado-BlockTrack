import prisma from "../config/prisma";
import { crearConduce } from "./scripts/conduce";
import { crearTransportistas } from "./scripts/transportistas";
import { crearUsuarios } from "./scripts/user";
import { crearVehicles } from "./scripts/vehicles";

async function main() {
  await crearUsuarios();
  await crearTransportistas();
  await crearVehicles();
  await crearConduce();
}

main()
  .then(() => {
    console.log("Seed ejecutado correctamente");
  })
  .catch((error) => {
    console.error("Error al ejecutar el seed:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

//ts-node ./src/seeders/index.ts
