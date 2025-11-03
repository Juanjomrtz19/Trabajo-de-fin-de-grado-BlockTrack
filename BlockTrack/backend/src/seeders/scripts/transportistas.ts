import prisma from "../../config/prisma";
import fs from "node:fs/promises";
import path from "node:path";
import { Prisma, Rol } from "@prisma/client";

type TransportistaRow = Omit<
  Prisma.TransportistaCreateManyInput,
  "usuarioId" | "zonaOperativa"
> & { zonaOperativa?: string | null };

export async function crearTransportistas() {
  const filePath = path.join(__dirname, "../data/transportistas.json");
  const file = await fs.readFile(filePath, "utf-8");

  let transportistas: TransportistaRow[] = JSON.parse(file);

  // Normaliza valores por defecto
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

  // Todos los usuarios TRANSPORTISTA ya existen (creados por registerUser)
  const usuarios = await prisma.usuario.findMany({
    where: { rol: Rol.TRANSPORTISTA },
    select: { id: true },
    orderBy: { id: "asc" }, // para emparejar en el mismo orden que el JSON
  });

  const n = Math.min(normalizados.length, usuarios.length);
  let upserts = 0;

  for (let i = 0; i < n; i++) {
    const usuarioId = usuarios[i].id;
    const data = normalizados[i];

    await prisma.transportista.upsert({
      where: { usuarioId }, // ← requiere @unique en usuarioId
      create: { ...data, usuarioId }, // si faltara (por si ejecutas seed con BD limpia)
      update: data, // si existe, RELLENA columnas NULL
    });

    upserts++;
  }

  console.log("✅ Transportistas enriquecidos:", upserts);
  if (normalizados.length > usuarios.length) {
    console.log(
      `⚠️ Quedaron ${
        normalizados.length - usuarios.length
      } filas del JSON sin emparejar (faltan usuarios).`
    );
  }
}
