import prisma from "../config/prisma";
import { Rol } from "@prisma/client";
import { Transportista, Usuario, UsuarioUpdate } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isClient } from "../helpers/functionHelper";
import { addressFromIndex } from "../blockchain/carteraUsuario";
import { ensureFunds } from "../blockchain/faucet";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

export const registerUser = async (data: any) => {
  const {
    dni,
    nombre,
    apellidos,
    email,
    telefono,
    rol,
    contrasenia,
    // CLIENTE
    direccionPrincipal,
    direccionPrincipalCP,
    direccionPrincipalCiudad,
    direccionPrincipalLat,
    direccionPrincipalLon,
    // TRANSPORTISTA
    zonaOperativa,
    zonaOperativaCP,
    zonaOperativaCiudad,
    zonaOperativaLat,
    zonaOperativaLon,
    disponibilidadActual,
    documentacionValidad,
  } = data;

  try {
    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1) Crear usuario base
      const created = await tx.usuario.create({
        data: {
          dni,
          nombre,
          apellidos,
          email,
          telefono,
          rol: (rol as string).toUpperCase() as Rol,
          contrasenia: hashedPassword,
        },
        select: { id: true, rol: true },
      });

      // 2) Crear entidad dependiente
      if (created.rol === "CLIENTE") {
        if (!direccionPrincipal) {
          throw new Error("direccionPrincipal is required for CLIENTE");
        }
        await tx.cliente.create({
          data: {
            usuarioId: created.id,
            direccionPrincipal: direccionPrincipal ?? "",
            codigoPostalPrincipal: direccionPrincipalCP
              ? String(direccionPrincipalCP)
              : null,
            latPrincipal: direccionPrincipalLat ?? null,
            lngPrincipal: direccionPrincipalLon ?? null,
            ciudadPrincipal: direccionPrincipalCiudad ?? null,
          },
        });
      } else if (created.rol === "TRANSPORTISTA") {
        await tx.transportista.create({
          data: {
            usuarioId: created.id,
            zonaOperativa: zonaOperativa ?? "",
            disponibilidaActual: disponibilidadActual ?? true,
            documentacionValidad: documentacionValidad ?? true,
            zonaOperativaCP: zonaOperativaCP ? String(zonaOperativaCP) : null,
            zonaOperativaCiudad: zonaOperativaCiudad ?? null,
            zonaOperativaLat: zonaOperativaLat ?? null,
            zonaOperativaLng: zonaOperativaLon ?? null,
          },
        });
      }

      // 3) Derivar índice/addr del wallet
      //    Usamos id-1 para empezar en m/44'/60'/0'/0/0 con el primer usuario
      const walletIndex = created.id - 1;
      const walletAddress = (await addressFromIndex(walletIndex)).toLowerCase();

      // 4) Actualizar el usuario con el wallet
      const updated = await tx.usuario.update({
        where: { id: created.id },
        data: {
          walletIndex,
          walletAddress,
        },
        select: {
          id: true,
          walletIndex: true,
          walletAddress: true,
        },
      });

      return updated;
    });

    try {
      if (result.walletAddress) {
        await ensureFunds(result.walletAddress, "0.01", "0.05");
      }
    } catch (e) {
      // no rompas el registro si el faucet falla; log y sigue
      console.warn("[FAUCET] No se pudo fondear", result.walletAddress, e);
    }

    return {
      message: "User registered successfully",
      wallet: {
        index: result.walletIndex,
        address: result.walletAddress,
      },
    };
  } catch (err: any) {
    console.error("Error", err);
    // Si hay colisión por UNIQUE (muy raro con id-1), Prisma lanza P2002
    if (err.code === "P2002") {
      throw new Error(
        "Conflicto de unicidad al asignar wallet. Intenta de nuevo."
      );
    }
    throw new Error("Error al registrar usuario");
  }
};

export const loginUser = async (email: string, password: string) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  const userPasswordRecord = await prisma.usuario.findUnique({
    where: { id: usuario.id },
    select: { contrasenia: true },
  });

  const isClientUser = isClient(usuario.rol);

  const cliente = isClientUser
    ? await prisma.cliente.findUnique({
        where: { usuarioId: usuario.id }, // es @unique
        select: { id: true },
      })
    : null;

  const transportista = !isClientUser
    ? await prisma.transportista.findUnique({
        where: { usuarioId: usuario.id }, // es @unique
        select: { id: true },
      })
    : null;

  if (!userPasswordRecord) {
    throw new Error("Contraseña no encontrada para el usuario");
  }

  const isMatch = await bcrypt.compare(
    password,
    userPasswordRecord.contrasenia
  );

  if (!isMatch) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      dni: usuario.dni,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      usuarioId: usuario.id,
      ...(isClientUser
        ? { clienteId: cliente?.id ?? null }
        : { transportistaId: transportista?.id ?? null }),
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};

export const updateUser = async (data: UsuarioUpdate) => {
  const { dni, nombre, apellidos, email, telefono, id } = data;
  console.log("data", data);
  const result = await prisma.usuario.update({
    where: { id: Number(id) },
    data: {
      dni,
      nombre,
      apellidos,
      email,
      telefono,
    },
  });
  return result;
};

export const verifyToken = async (token: string) => {
  const result = jwt.verify(token, JWT_SECRET) as any;

  const currentUser = await prisma.usuario.findUnique({
    where: { id: result.usuarioId }, // <-- usar usuarioId
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      email: true,
      telefono: true,
      rol: true,
      dni: true,
    },
  });

  if (!currentUser) return null;

  return {
    ...currentUser,
    clienteId: result.clienteId ?? null,
    transportistaId: result.transportistaId ?? null,
  };
};
