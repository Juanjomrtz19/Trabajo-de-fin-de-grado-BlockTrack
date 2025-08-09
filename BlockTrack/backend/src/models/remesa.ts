export interface Remesa {
  id?: number;
  clienteId: number;
  peso: number;
  medida: number;
  nPaquetes: number;
  tipoMercancia: string;
  estado?: string;
  dirEnvio: string;
  dirRecogida: string;
  ciudad: string;
  observaciones: string;
  codigoPostal: string;
}
