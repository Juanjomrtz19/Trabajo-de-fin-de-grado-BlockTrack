import { Request, Response } from "express";
import * as userService from "../services/user";
import { registerUserSchema } from "../validators/user";
import { UsuarioUpdate } from "../models/user";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    nombre,
    apellidos,
    email,
    telefono,
    contrasenia,
    rol,
    dni,
    direccionPrincipal,
    zonaOperativa,
    direccionPrincipalCP,
    direccionPrincipalCiudad,
    direccionPrincipalLat,
    direccionPrincipalLon,
    zonaOperativaCP,
    zonaOperativaCiudad,
    zonaOperativaLat,
    zonaOperativaLon,
  } = req.body;

  try {
    console.log("[USER][REGISTER] Request");

    const parsed = registerUserSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.format() });
      return;
    }

    const userData = {
      nombre: nombre,
      apellidos,
      email,
      telefono: String(telefono),
      contrasenia,
      rol,
      dni,
      direccionPrincipal,
      zonaOperativa,
      disponibilidadActual: true,
      documentacionValidad: true,
      direccionPrincipalCP: direccionPrincipalCP
        ? Number(direccionPrincipalCP)
        : null,
      direccionPrincipalCiudad: direccionPrincipalCiudad || null,
      direccionPrincipalLat: direccionPrincipalLat || null,
      direccionPrincipalLon: direccionPrincipalLon || null,
      zonaOperativaCP: zonaOperativaCP ? Number(zonaOperativaCP) : null,
      zonaOperativaCiudad: zonaOperativaCiudad || null,
      zonaOperativaLat: zonaOperativaLat || null,
      zonaOperativaLon: zonaOperativaLon || null,
    };

    const result = await userService.registerUser(userData);

    console.log("[USER][REGISTER] Success");
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    console.log("[USER][REGISTER] Error", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    console.log("[USER][LOGIN] Request");
    const result = await userService.loginUser(email, password);
    res.cookie("token", result, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    console.log("[USER][LOGIN] Succest");
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "There was something wrong" });
  }
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { dni, nombre, apellidos, email, telefono, rol } = req.body;

  const { userId } = req.user!;

  const data: UsuarioUpdate = {
    dni: dni,
    nombre: nombre,
    apellidos: apellidos,
    email: email,
    telefono: telefono,
    rol: rol,
    id: userId,
  };

  try {
    console.log("[USER][UPDATEUSER] Request");
    const result = await userService.updateUser(data);

    res.status(200).json(result);
    console.log("[USER][UPDATEUSER] Succest");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    console.log("[USER][GETCURRENTUSER] Request");
    const user = await userService.verifyToken(token);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return; // <-- importante
    }
    res.status(200).json({ user });
    console.log("[USER][GETCURRENTUSER] Success");
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// export const createTransporter = async
