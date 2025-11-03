// src/seeders/crearUsuarios.ts
import fs from "node:fs/promises";
import path from "node:path";
import { registerUser } from "../../services/user"; // <-- importa tu registerUser

export async function crearUsuarios() {
  const file = await fs.readFile(
    path.join(__dirname, "../data/usuarios.json"),
    "utf-8"
  );

  const rawUsuarios: any[] = JSON.parse(file);

  let ok = 0,
    fail = 0;

  // ⚠️ Secuencial para evitar colisiones/ruido en logs (puedes paralelizar si quieres)
  for (const u of rawUsuarios) {
    try {
      await registerUser(u); // 👈 ya hace todo (hash + dependientes + wallet)
      ok++;
    } catch (e: any) {
      fail++;
      // si hay duplicados en el JSON o en la BD, seguirá al siguiente
      console.error(
        `[SEED][FAIL] dni=${u.dni} email=${u.email}`,
        e?.message ?? e
      );
    }
  }

  console.log(`[SEED] Usuarios insertados: ${ok}. Fallidos: ${fail}.`);
}
