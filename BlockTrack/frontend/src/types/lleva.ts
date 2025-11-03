export interface LLeva {
  id: number;
  dirFin: string;
  dirInicio: string;
  distanciaKm: number;
  remesaId: number;
  latInicio: number;
  lngInicio: number;
  latFin: number;
  lngFin: number;
  fecha: Date;
  hora: string;
  status: "PENDIENTE" | "ACEPTADA" | "CANCELADA";
  onchain?: any;
}
