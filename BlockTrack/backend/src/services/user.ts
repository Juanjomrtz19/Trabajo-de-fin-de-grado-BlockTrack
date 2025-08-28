import prisma from "../config/prisma";
import { Rol } from "@prisma/client";
import { Transportista, Usuario, UsuarioUpdate } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isClient } from "../helpers/functionHelper";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

export const registerUser = async (data: Usuario) => {
  const {
    dni,
    nombre,
    apellidos,
    email,
    telefono,
    rol,
    contrasenia,
    direccionPrincipal,
    zonaOperativa,
    disponibilidadActual,
    documentacionValidad,
    direccionPrincipalCP,
    direccionPrincipalCiudad,
    direccionPrincipalLat,
    direccionPrincipalLon,
    zonaOperativaCP,
    zonaOperativaCiudad,
    zonaOperativaLat,
    zonaOperativaLon,
  } = data;

  try {
    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    await prisma.usuario.create({
      data: {
        dni,
        nombre,
        apellidos,
        email,
        telefono,
        rol: rol.toUpperCase() as Rol,
        contrasenia: hashedPassword,
      },
    });

    const usuario = await prisma.usuario.findUnique({
      where: { dni },
      select: { id: true },
    });

    if (!usuario?.id) {
      throw new Error("User ID is missing");
    }

    if (rol.toUpperCase() === "CLIENTE") {
      if (!direccionPrincipal) {
        throw new Error("direccionPrincipal is required for CLIENTE");
      }
      await prisma.cliente.create({
        data: {
          usuarioId: usuario.id,
          direccionPrincipal: direccionPrincipal ?? "",
          codigoPostalPrincipal: direccionPrincipalCP
            ? String(direccionPrincipalCP)
            : null,
          latPrincipal: direccionPrincipalLat || null,
          lngPrincipal: direccionPrincipalLon || null,
          ciudadPrincipal: direccionPrincipalCiudad || null,
        },
      });
    } else if (rol.toUpperCase() === "TRANSPORTISTA") {
      await prisma.transportista.create({
        data: {
          usuarioId: usuario.id,
          zonaOperativa: zonaOperativa ?? "",
          disponibilidaActual: disponibilidadActual ?? true,
          documentacionValidad: documentacionValidad ?? true,
          zonaOperativaCP: zonaOperativaCP ? String(zonaOperativaCP) : null,
          zonaOperativaCiudad: zonaOperativaCiudad || null,
          zonaOperativaLat: zonaOperativaLat || null,
          zonaOperativaLng: zonaOperativaLon || null,
        },
      });
    }

    return { message: "User registered successfully" };
  } catch (err) {
    console.error("Error", err);
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
