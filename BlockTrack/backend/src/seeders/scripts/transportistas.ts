import prisma from "../../config/prisma";
import fs from "node:fs/promises";
import path from "node:path";
import { Prisma, Rol } from "@prisma/client";

type TransportistaRow = Omit<
  Prisma.TransportistaCreateManyInput,
  "usuarioId" | "zonaOperativa"
> & {
  zonaOperativa?: string | null;
};

export async function crearTransportistas() {
  const filePath = path.join(__dirname, "../data/transportistas.json");
  const file = await fs.readFile(filePath, "utf-8");

  let transportistas: TransportistaRow[];
  try {
    transportistas = JSON.parse(file);
  } catch (e) {
    console.error(
      "❌ No se pudo parsear transportistas.json:",
      (e as Error).message
    );
    return;
  }

  // Normalizamos datos
  const normalizados = transportistas.map((t) => ({
    zonaOperativa: t.zonaOperativa ?? "ESP",
    disponibilidaActual: t.disponibilidaActual ?? false,
    documentacionValidad: t.documentacionValidad ?? false,
    estaDeBaja: t.estaDeBaja ?? false,
    zonaOperativaCiudad: t.zonaOperativaCiudad ?? null,
    zonaOperativaCP: t.zonaOperativaCP ?? null,
    zonaOperativaLat: t.zonaOperativaLat ?? null,
    zonaOperativaLng: t.zonaOperativaLng ?? null,
    zonaRadioKm: t.zonaRadioKm ?? null,
  }));

  // Usuarios con rol TRANSPORTISTA y sin relación aún
  const usuariosDisponibles = await prisma.usuario.findMany({
    where: { rol: Rol.TRANSPORTISTA, transportista: null },
    select: { id: true },
  });

  if (usuariosDisponibles.length === 0) {
    console.warn("⚠️  No hay usuarios TRANSPORTISTA disponibles para asignar.");
    return;
  }

  const n = Math.min(normalizados.length, usuariosDisponibles.length);
  const data: Prisma.TransportistaCreateManyInput[] = Array.from(
    { length: n },
    (_, i) => ({
      ...normalizados[i],
      usuarioId: usuariosDisponibles[i].id,
    })
  );

  const skipped = normalizados.length - n;

  const result = await prisma.transportista.createMany({
    data,
    skipDuplicates: true,
  });

  console.log("✅ Seeder transportistas ejecutado");
  console.log(`   → Transportistas leídos del JSON: ${transportistas.length}`);
  console.log(
    `   → Usuarios TRANSPORTISTA disponibles: ${usuariosDisponibles.length}`
  );
  console.log(`   → Emparejados: ${n}`);
  console.log(`   → Insertados en BD: ${result.count}`);
  console.log(`   → Skipped (sin usuario): ${skipped}`);
}
