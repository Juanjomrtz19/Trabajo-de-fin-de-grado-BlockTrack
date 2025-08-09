import { Request, Response } from "express";
import * as remesaService from "../services/remesa";
import { Remesa } from "../models/remesa";

const isClient = (rol: "CLIENTE" | "TRANSPORTISTA" | "") => {
  return rol === "CLIENTE";
};

export const crearRemesa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { rol, userId } = req.user!;
  const {
    peso,
    medida,
    nPaquetes,
    tipoMercancia,
    dirEnvio,
    dirRecogida,
    ciudad,
    observaciones,
    codigoPostal,
  } = req.body;

  if (!isClient(rol))
    res.status(401).json({ message: "No esta autorizado a crear remesas" });

  try {
    console.log("[REMESA][CREARREMESA] Request");
    const data: Remesa = {
      peso,
      medida,
      nPaquetes,
      tipoMercancia,
      dirEnvio,
      dirRecogida,
      ciudad,
      observaciones,
      codigoPostal,
      estado: "En preparacion",
      clienteId: userId,
    };

    const result = await remesaService.crearRemesa(data);
    res.status(200).json({ message: "Remesa creada correctamente", result });

    console.log("[REMESA][CREARREMESA] Success");
  } catch (error) {
    console.error(error);
    console.log("[REMESA][CREARREMESA] Error", error);
    res.status(500).json({ message: "Error creando remesa" });
  }
};

export const editarRemesa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { rol, userId } = req.user!;
  const {
    peso,
    medida,
    nPaquetes,
    tipoMercancia,
    dirEnvio,
    dirRecogida,
    ciudad,
    observaciones,
    codigoPostal,
  } = req.body;
  const { idRemesa } = req.params;

  if (!isClient(rol))
    res.status(401).json({ message: "No esta autorizado a editar remesas" });

  try {
    console.log("[REMESA][EDITARREMESA] Request");
    const data: Remesa = {
      peso,
      medida,
      nPaquetes,
      tipoMercancia,
      dirEnvio,
      dirRecogida,
      ciudad,
      observaciones,
      codigoPostal,
      clienteId: userId,
      id: Number(idRemesa),
    };

    const result = await remesaService.editarRemesa(data);
    res.status(200).json({ message: "Remesa editada correctamente", result });

    console.log("[REMESA][EDITARREMESA] Success");
  } catch (error) {
    console.error(error);
    console.log("[REMESA][EDITARREMESA] Error", error);
    res.status(500).json({ message: "Error creando remesa" });
  }
};

export const cancelarRemesa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { rol, userId } = req.user!;
  const { idRemesa } = req.params;

  if (!isClient(rol))
    res.status(401).json({ message: "No esta autorizado a cancelar remesas" });

  try {
    console.log("[REMESA][CANCELARREMESA] Request");
    const result = await remesaService.cancelarRemesa(
      Number(idRemesa),
      userId,
      "Cancelada"
    );
    console.log("[REMESA][CANCELARREMESA] Success");
  } catch (error) {
    console.error(error);
    console.log("[REMESA][CANCELARREMESA] Error", error);
    res.status(500).json({ message: "Error cancelando remesa" });
  }
};
