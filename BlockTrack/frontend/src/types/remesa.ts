// types/remesa.ts (frontend)

// Enums como uniones de string (idénticos a Prisma)
export type EstadoRemesa =
  | "PENDIENTE"
  | "ASIGNADA"
  | "EN_RUTA"
  | "ENTREGADA"
  | "CANCELADA";

export type TipoMercancia =
  | "GENERICO"
  | "PERECEDERO"
  | "FRAGIL"
  | "PELIGROSO"
  | "DOCUMENTACION";

// Interface principal alineada al nuevo modelo
export interface Remesa {
  id?: number;
  // Datos
  peso: number;
  medida: string;
  nPaquetes: number;
  tipoMercancia: TipoMercancia;
  estado?: EstadoRemesa; // en BD por defecto es PENDIENTE

  // ENTREGA
  dirEnvio: string; // dirección completa
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
  onchain?: any;

  observaciones?: string;
}
