import prisma from "../../config/prisma";
import fs from "node:fs/promises";
import { Prisma, Rol } from "@prisma/client";
import path from "node:path";
import bcrypt from "bcrypt";

export async function crearUsuarios() {
  const file = await fs.readFile(
    path.join(__dirname, "../data/usuarios.json"),
    "utf-8"
  );

  const rawUsuarios: Prisma.UsuarioCreateManyInput[] = JSON.parse(file);

  const usuarios = await Promise.all(
    rawUsuarios.map(async (u) => ({
      ...u,
      contrasenia: await bcrypt.hash(u.contrasenia, 10),
    }))
  );

  const result = await prisma.usuario.createMany({
    data: usuarios,
    skipDuplicates: true,
  });

  console.log(`${result.count} usuarios insertados`);
}
