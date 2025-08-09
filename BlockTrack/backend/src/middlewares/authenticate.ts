import { Rol } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

interface JwtUserPayload extends JwtPayload {
  dni: string;
  email: string;
  rol: Rol;
  nombre: string;
  apellidos: string;
  telefono: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtUserPayload;
    const { id, ...rest } = decoded;
    req.user = { ...rest, userId: id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
