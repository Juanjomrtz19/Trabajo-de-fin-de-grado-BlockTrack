import { Request, Response } from "express";
import { z } from "zod";
import { TipoMercancia } from "@prisma/client";
import * as remesaService from "../services/remesa";
import { Remesa } from "../models/remesa";

const RemesaCreateSchema = z.object({
  // Datos de la remesa
  peso: z.number().int().positive(),
  medida: z.string().min(1),
  nPaquetes: z.number().int().positive(),
  tipoMercancia: z.nativeEnum(TipoMercancia),

  // ENTREGA (envío)
  dirEnvio: z.string().min(1),

  ciudadEnvio: z.string().min(1),
  codigoPostalEnvio: z.string().min(3).max(10),
  latEnvio: z.number().min(-90).max(90).optional(),
  lngEnvio: z.number().min(-180).max(180).optional(),

  // RECOGIDA
  dirRecogida: z.string().min(1),
  ciudadRecogida: z.string().min(1),
  codigoPostalRecogida: z.string().min(3).max(10),
  latRecogida: z.number().min(-90).max(90).optional(),
  lngRecogida: z.number().min(-180).max(180).optional(),

  // Contacto del destinatario
  emailDestinatario: z.string().email(),

  observaciones: z.string().optional(),
});

export const crearRemesa = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const clienteId = (req as any).user?.clienteId as number | undefined;
    if (!clienteId) {
      res.status(401).json({ message: "No está autorizado a crear remesas" });
      return;
    }

    // Normaliza números por si vienen como string
    const body = {
      ...req.body,
      peso: Number(req.body.peso),
      medida: req.body.medida,
      nPaquetes: Number(req.body.nPaquetes),
      latEnvio:
        req.body.latEnvio != null ? Number(req.body.latEnvio) : undefined,
      lngEnvio:
        req.body.lngEnvio != null ? Number(req.body.lngEnvio) : undefined,
      latRecogida:
        req.body.latRecogida != null ? Number(req.body.latRecogida) : undefined,
      lngRecogida:
        req.body.lngRecogida != null ? Number(req.body.lngRecogida) : undefined,
    };

    const parsed = RemesaCreateSchema.safeParse(body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Datos inválidos en la creación de remesa",
        errors: parsed.error.flatten(),
      });
      return;
    }

    console.log("[REMESA][CREARREMESA] Request");

    const data: Remesa = {
      // Relaciones
      clienteId,

      // Datos de la remesa
      peso: parsed.data.peso,
      medida: parsed.data.medida,
      nPaquetes: parsed.data.nPaquetes,
      tipoMercancia: parsed.data.tipoMercancia,

      // ENTREGA
      dirEnvio: parsed.data.dirEnvio,
      ciudadEnvio: parsed.data.ciudadEnvio,
      codigoPostalEnvio: parsed.data.codigoPostalEnvio,
      latEnvio: parsed.data.latEnvio,
      lngEnvio: parsed.data.lngEnvio,

      // RECOGIDA
      dirRecogida: parsed.data.dirRecogida,
      ciudadRecogida: parsed.data.ciudadRecogida,
      codigoPostalRecogida: parsed.data.codigoPostalRecogida,
      latRecogida: parsed.data.latRecogida,
      lngRecogida: parsed.data.lngRecogida,

      // Destinatario
      emailDestinatario: parsed.data.emailDestinatario,

      // Otros
      observaciones: parsed.data.observaciones,
    };

    const result = await remesaService.crearRemesa(data);

    console.log("[REMESA][CREARREMESA] Success");
    res.status(201).json({ message: "Remesa creada correctamente", result });
  } catch (error) {
    console.error("[REMESA][CREARREMESA] Error", error);
    res.status(500).json({ message: "Error creando remesa" });
  }
};

export const obtenerRemesas = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const clienteId = (req as any).user?.clienteId as number | undefined;
    if (!clienteId) {
      res.status(401).json({ message: "No está autorizado a obtener remesas" });
      return;
    }

    const remesas = await remesaService.obtenerRemesas(clienteId);
    res.status(200).json(remesas);
  } catch (error) {
    console.error("[REMESA][GETREMESAS] Error", error);
    res.status(500).json({ message: "Error al obtener remesas" });
  }
};

export const obtenerRemesa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { idRemesa } = req.params;
  if (!idRemesa || isNaN(Number(idRemesa))) {
    res.status(400).json({ message: "ID de remesa inválido" });
    return;
  }

  try {
    const remesa = await remesaService.obtenerRemesa(Number(idRemesa));
    res.status(200).json(remesa);
  } catch (error) {
    console.error("[REMESA][GETREMESA] Error", error);
    res.status(500).json({ message: "Error al obtener remesa" });
  }
};

export const editarRemesa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { rol, userId } = req.user!;
  const { idRemesa } = req.params;

  const clienteId = (req as any).user?.clienteId as number | undefined;
  if (!clienteId) {
    res.status(401).json({ message: "No está autorizado a editar remesas" });
    return;
  }

  const body = {
    ...req.body,
    peso: Number(req.body.peso),
    medida: Number(req.body.medida),
    nPaquetes: Number(req.body.nPaquetes),
    latEnvio: req.body.latEnvio != null ? Number(req.body.latEnvio) : undefined,
    lngEnvio: req.body.lngEnvio != null ? Number(req.body.lngEnvio) : undefined,
    latRecogida:
      req.body.latRecogida != null ? Number(req.body.latRecogida) : undefined,
    lngRecogida:
      req.body.lngRecogida != null ? Number(req.body.lngRecogida) : undefined,
  };

  const parsed = RemesaCreateSchema.safeParse(body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Datos inválidos en la edición de una remesa",
      errors: parsed.error.flatten(),
    });
    return;
  }

  try {
    console.log("[REMESA][EDITARREMESA] Request");
    const data: Remesa = {
      // Relaciones
      clienteId,

      // Datos de la remesa
      peso: parsed.data.peso,
      medida: parsed.data.medida,
      nPaquetes: parsed.data.nPaquetes,
      tipoMercancia: parsed.data.tipoMercancia,

      // ENTREGA
      dirEnvio: parsed.data.dirEnvio,
      ciudadEnvio: parsed.data.ciudadEnvio,
      codigoPostalEnvio: parsed.data.codigoPostalEnvio,
      latEnvio: parsed.data.latEnvio,
      lngEnvio: parsed.data.lngEnvio,

      // RECOGIDA
      dirRecogida: parsed.data.dirRecogida,
      ciudadRecogida: parsed.data.ciudadRecogida,
      codigoPostalRecogida: parsed.data.codigoPostalRecogida,
      latRecogida: parsed.data.latRecogida,
      lngRecogida: parsed.data.lngRecogida,

      // Destinatario
      emailDestinatario: parsed.data.emailDestinatario,

      // Otros
      observaciones: parsed.data.observaciones,
    };

    const result = await remesaService.editarRemesa(data, Number(idRemesa));
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
  const { estado } = req.body;

  const clienteId = (req as any).user?.clienteId as number | undefined;
  if (!clienteId) {
    res.status(401).json({ message: "No está autorizado a crear remesas" });
    return;
  }

  try {
    console.log("[REMESA][CANCELARREMESA] Request");
    const result = await remesaService.cancelarRemesa(
      Number(idRemesa),
      userId,
      estado
    );

    res.status(200).json({ message: "Remesa cancelada correctamente", result });
    console.log("[REMESA][CANCELARREMESA] Success");
  } catch (error) {
    console.error(error);
    console.log("[REMESA][CANCELARREMESA] Error", error);
    res.status(500).json({ message: "Error cancelando remesa" });
  }
};

export const asignarTransportistas = async (req: Request, res: Response) => {
  const { idRemesa } = req.params;

  try {
    const result = await remesaService.asignarRemesaATransportistas(
      Number(idRemesa)
    );
    res
      .status(200)
      .json({ message: "Transportistas asignados correctamente", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al asignar transportistas" });
  }
};
