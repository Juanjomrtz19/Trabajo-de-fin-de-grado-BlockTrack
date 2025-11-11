import { Request, Response } from "express";
import { GeneralError } from "../server/serverInterface";
import * as llevaService from "../services/lleva";

export const obtenerLlevas = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("[LLEVA][OBTENERLLEVAS] Request");
    const remesaId: number = parseInt(req.params.remesaId);
    if (isNaN(remesaId)) {
      throw new GeneralError(400, "ID de remesa inválido", "cliente");
    }
    const result = await llevaService.obtenerLLevas(remesaId);
    console.log("[LLEVA][OBTENERLLEVAS] Success");
    res.status(200).json({ message: "Llevas obtenidas con éxito", result });
  } catch (error: any) {
    console.log("[LLEVA][OBTENERLLEVAS] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Error interno del servidor";

    res.status(status).json({
      ok: false,
      message,
    });
  }
};

export const obtenerLlevasPorTransportista = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("[LLEVA][OBTENERLLEVASPORTRANSPORTISTA] Request");
    const { transportistaId } = req.user!;
    if (isNaN(transportistaId)) {
      throw new GeneralError(400, "ID de transportista inválido", "cliente");
    }
    const result = await llevaService.obtenerLLevasPorTransportista(
      transportistaId
    );
    console.log("[LLEVA][OBTENERLLEVASPORTRANSPORTISTA] Success");
    res.status(200).json(result);
  } catch (error: any) {
    console.log("[LLEVA][OBTENERLLEVASPORTRANSPORTISTA] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Error interno del servidor";

    res.status(status).json({
      ok: false,
      message,
    });
  }
};

export const aceptarLLeva = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { transportistaId } = req.user!;
    console.log("[LLEVA][ACEPTARLLEVA] Request");
    const llevaId: number = parseInt(req.body.llevaId);
    console.log("llevaId", llevaId);
    if (isNaN(llevaId)) {
      throw new GeneralError(400, "ID de lleva inválido", "cliente");
    }
    if (!transportistaId) {
      throw new GeneralError(400, "ID de transportista inválido", "cliente");
    }
    await llevaService.aceptarLLeva(llevaId, transportistaId);
    console.log("[LLEVA][ACEPTARLLEVA] Success");
    res.status(200).json({ message: "Lleva aceptada con éxito" });
  } catch (error: any) {
    console.log("[LLEVA][ACEPTARLLEVA] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Error interno del servidor";

    res.status(status).json({
      ok: false,
      message,
    });
  }
};

export const rechazarLleva = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { transportistaId } = req.user!;
    console.log("[LLEVA][RECHAZARLLEVA] Request");
    const llevaId: number = parseInt(req.body.llevaId);
    if (isNaN(llevaId)) {
      throw new GeneralError(400, "ID de lleva inválido", "cliente");
    }
    if (!transportistaId) {
      throw new GeneralError(400, "ID de transportista inválido", "cliente");
    }

    await llevaService.rechazarLleva(llevaId, transportistaId);
    console.log("[LLEVA][RECHAZARLLEVA] Success");
    res.status(200).json({ message: "Lleva rechazada con éxito" });
  } catch (error: any) {
    console.log("[LLEVA][RECHAZARLLEVA] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Error interno del servidor";

    res.status(status).json({
      ok: false,
      message,
    });
  }
};

export const consultarLlevasPedido = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("[LLEVA][CONSULTARLLEVASPEDIDO] Request");
    const remesaId: number = parseInt(req.params.remesaId);
    if (isNaN(remesaId)) {
      res.status(400).json({ message: "ID de remesa inválido" });
      return;
    }
    const result = await llevaService.obtenerLLevas(remesaId);
    console.log("[LLEVA][CONSULTARLLEVASPEDIDO] Success");
    res.status(200).json({ message: "Llevas obtenidas con éxito", result });
  } catch (error: any) {
    console.log("[LLEVA][CONSULTARLLEVASPEDIDO] Error:", error);
    const status = error.status ?? 500;
    const message = error.message ?? "Error interno del servidor";

    res.status(status).json({
      ok: false,
      message,
    });
  }
};
