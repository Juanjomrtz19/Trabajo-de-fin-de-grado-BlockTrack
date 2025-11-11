import { api } from "./api";

export interface Estadisticas {
  totalRemesasCreadas: number;
  transportistasActivos: number;
  remesasARecoger: number;
}

export const estadisticasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    obtenerEstadisticas: builder.query<Estadisticas, void>({
      query: () => "estadisticas",
    }),
  }),
});

export const { useObtenerEstadisticasQuery } = estadisticasApi;
