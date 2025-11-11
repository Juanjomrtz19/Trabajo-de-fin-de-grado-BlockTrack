import { Request, Response } from "express";
import * as estadisticasService from "../services/estadisticas";

export const obtenerEstadisticas = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clienteId, email } = req.user!;

    if (!clienteId) {
      res.status(401).json({ message: "No está autorizado" });
      return;
    }

    const estadisticas = await estadisticasService.obtenerEstadisticas(
      clienteId,
      email!
    );

    res.status(200).json(estadisticas);
  } catch (error) {
    console.error("[ESTADISTICAS][OBTENER] Error:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};
