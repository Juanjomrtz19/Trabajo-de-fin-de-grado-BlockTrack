import { Request, Response } from "express";
import * as transportistaService from "../services/transportista";
import { isClient } from "../helpers/functionHelper";

export const darDeBaja = async (req: Request, res: Response): Promise<void> => {
  const { transportistaId, rol } = req.user!;
  const { baja }: { baja: boolean } = req.body;
  console.log("transportistaId:", transportistaId);
  try {
    if (isClient(rol))
      res.status(401).json({ message: "No esta autorizado a darse de baja" });

    console.log("[TRANSPORTISTA][DARDEBAJA] Request");
    const result = await transportistaService.almacenarBaja(
      baja,
      transportistaId
    );
    console.log("[TRANSPORTISTA][DARDEBAJA] Success");

    res
      .status(200)
      .json({ message: "Cambio de baja realizado con éxito", result });
  } catch (error) {
    console.error(error);
    console.log("[TRANSPORTISTA][ALMACENARBAJA] Error", error);
    res.status(500).json({ message: "Error dando de baja" });
  }
};
