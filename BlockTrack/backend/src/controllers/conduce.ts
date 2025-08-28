import { Conduce } from "../models/conduce";
import { Request, Response } from "express";
import { GeneralError } from "../server/serverInterface";
import { validateConduce } from "../validators/conduce";
import * as conduceService from "../services/conduce";

export const crearConduce = async (req: Request, res: Response) => {
  try {
    console.log("[CONDUCE][CREARCONDUCE] Request");
    const { transportistaId } = req.user!;
    if (!transportistaId) {
      throw new GeneralError(
        403,
        "Usuario no autorizado a conducir vehículos",
        "validación"
      );
    }

    console.log("transportistaId", transportistaId);
    console.log("req.body", req.body);
    const conduce: Conduce = req.body;
    const data = validateConduce({ ...conduce, transportistaId });
    const newConduce = await conduceService.createConduce(data);
    console.log("[CONDUCE][CREARCONDUCE] Success");
    res.status(201).json(newConduce);
  } catch (error: any) {
    console.log("[CONDUCE][CREARCONDUCE] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Internal Server Error";
    res.status(status).json({
      ok: false,
      message,
    });
  }
};

export const obtenerConduce = async (req: Request, res: Response) => {
  try {
    console.log("[CONDUCE][OBTENERCONDUCE] Request");
    const { transportistaId } = req.user!;
    if (!transportistaId) {
      throw new GeneralError(
        403,
        "Usuario no autorizado a obtener información de vehículos",
        "validación"
      );
    }

    const conduce = await conduceService.getConduceByTransportistaId(
      transportistaId
    );

    console.log("[CONDUCE][OBTENERCONDUCE] Success");
    res.status(200).json(conduce);
  } catch (error: any) {
    console.log("[CONDUCE][OBTENERCONDUCE] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Internal Server Error";
    res.status(status).json({
      ok: false,
      message,
    });
  }
};

export const borrarConduce = async (req: Request, res: Response) => {
  try {
    console.log("[CONDUCE][BORRARCONDUCE] Request");
    const { transportistaId } = req.user!;
    if (!transportistaId) {
      throw new GeneralError(
        403,
        "Usuario no autorizado a eliminar vehículos",
        "validación"
      );
    }

    const result = await conduceService.borrarConduce(transportistaId);
    if (!result) {
      throw new GeneralError(404, "Conduce no encontrado", "validación");
    }

    console.log("[CONDUCE][BORRARCONDUCE] Success");
    res.status(204).send();
  } catch (error: any) {
    console.log("[CONDUCE][BORRARCONDUCE] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Internal Server Error";
    res.status(status).json({
      ok: false,
      message,
    });
  }
};
