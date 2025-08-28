// models/remesa.ts
import type {
  TipoMercancia as PrismaTipoMercancia,
  EstadoRemesa as PrismaEstadoRemesa,
} from "@prisma/client";

export type TipoMercancia = PrismaTipoMercancia;
export type EstadoRemesa = PrismaEstadoRemesa;

export interface Remesa {
  id?: number;
  clienteId: number;

  peso: number;
  medida: string;
  nPaquetes: number;
  tipoMercancia: TipoMercancia;
  estado?: EstadoRemesa;

  // ENTREGA
  dirEnvio: string;
  ciudadEnvio: string;
  codigoPostalEnvio: string;
  latEnvio?: number;
  lngEnvio?: number;

  // RECOGIDA
  dirRecogida: string;
  ciudadRecogida: string;
  codigoPostalRecogida: string;
  latRecogida?: number;
  lngRecogida?: number;

  // Contacto
  emailDestinatario: string;

  observaciones?: string;
}
