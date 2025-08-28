import { Transporte } from "../models/transporte";
import { Request, Response } from "express";
import { GeneralError } from "../server/serverInterface";
import { validateTransporte } from "../validators/transporte";
import * as transporteService from "../services/transporte";

export const crearTransporte = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("[TRANSPORTE][CREARTRANSPORTE] Request");
    const transporte: Transporte = req.body as Transporte;
    const { transportistaId } = req.user!;
    if (!transportistaId)
      throw new GeneralError(401, "No esta autorizado", "servidor");
    const transporteValidado = validateTransporte(transporte);
    const result = await transporteService.create(
      Number(transportistaId),
      transporteValidado
    );
    console.log("[TRANSPORTE][CREARTRANSPORTE] Success");
    res.status(201).json({ message: "Transporte creado con éxito", result });
  } catch (error: any) {
    console.log("[TRANSPORTE][CREARTRANSPORTE] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Error interno del servidor";

    res.status(status).json({
      ok: false,
      message,
    });
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("[TRANSPORTE][GETALL] Request");
    const { transportistaId } = req.user!;
    if (!transportistaId)
      throw new GeneralError(401, "No esta autorizado", "servidor");
    const result = await transporteService.getAll(Number(transportistaId));
    console.log("[TRANSPORTE][GETALL] Success");
    res
      .status(200)
      .json({ message: "Transportes obtenidos con éxito", result });
  } catch (error: any) {
    console.log("[TRANSPORTE][GETALL] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Error interno del servidor";

    res.status(status).json({
      ok: false,
      message,
    });
  }
};

export const updateTransporte = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("[TRANSPORTE][UPDATETRANSPORTE] Request");
    const { id } = req.params;
    const transporte: Partial<Transporte> = req.body;
    const { transportistaId } = req.user!;
    const transporteValidado = validateTransporte(transporte);
    if (!transportistaId)
      throw new GeneralError(401, "No esta autorizado", "servidor");
    const result = await transporteService.update(
      Number(id),
      transporteValidado
    );
    console.log("[TRANSPORTE][UPDATETRANSPORTE] Success");
    res
      .status(200)
      .json({ message: "Transporte actualizado con éxito", result });
  } catch (error: any) {
    console.log("[TRANSPORTE][UPDATETRANSPORTE] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Error interno del servidor";

    res.status(status).json({
      ok: false,
      message,
    });
  }
};

export const deleteTransporte = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("[TRANSPORTE][DELETETRANSPORTE] Request");
    const { id } = req.params;
    const { transportistaId } = req.user!;
    if (!transportistaId)
      throw new GeneralError(401, "No esta autorizado", "servidor");
    const result = await transporteService.deleteOne(Number(id));
    console.log("[TRANSPORTE][DELETETRANSPORTE] Success");
    res.status(200).json({ message: "Transporte eliminado con éxito", result });
  } catch (error: any) {
    console.log("[TRANSPORTE][DELETETRANSPORTE] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Error interno del servidor";

    res.status(status).json({
      ok: false,
      message,
    });
  }
};
