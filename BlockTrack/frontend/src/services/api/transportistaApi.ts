import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import { LLeva } from "../../types/lleva";

export const transportistaApi = createApi({
  reducerPath: "transportistaApi",
  baseQuery,
  endpoints: (builder) => ({
    darDeBajaTransportista: builder.mutation({
      query: ({ baja }) => ({
        url: `/transportistas/darDeBaja`,
        method: "PATCH",
        body: { baja },
      }),
    }),
    obtenerLlevasPorTransportista: builder.query<LLeva[], void>({
      query: () => ({
        url: `/transportistas/llevas`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useDarDeBajaTransportistaMutation,
  useObtenerLlevasPorTransportistaQuery,
} = transportistaApi;
