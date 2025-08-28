export interface lleva {
  remesaId: number;
  orden: number;

  //GEOGRAFÍA
  latInicio: number;
  latFin: number;
  dirInicio: string;
  lngInicio: number;
  lngFin: number;
  dirFin: string;
  distanciaKm?: number;
  fecha: Date;
  hora: string;
  status: "PENDIENTE" | "CANCELADA" | "ACEPTADA";

  //OTROS
  conduceId: number;
}
