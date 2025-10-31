import { createApi } from "@reduxjs/toolkit/query/react";
import { api } from "./api";
import { LLeva } from "../../types/lleva";

export const transportistaApi = api.injectEndpoints({
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
      providesTags: (result: any) =>
        result
          ? [
              ...result.map(({ id }: { id: number }) => ({
                type: "Lleva",
                id,
              })),
              "Lleva",
            ]
          : ["Lleva"],
    }),
    rechazarLleva: builder.mutation({
      query: ({ llevaId }) => ({
        url: `/transportistas/rechazarLleva`,
        method: "PATCH",
        body: { llevaId },
      }),
      invalidatesTags: ["Lleva"],
    }),
    aceptarLleva: builder.mutation({
      query: ({ llevaId }) => ({
        url: `/transportistas/aceptarLleva`,
        method: "PATCH",
        body: { llevaId },
      }),
      invalidatesTags: ["Lleva"],
    }),
  }),
});

export const {
  useDarDeBajaTransportistaMutation,
  useObtenerLlevasPorTransportistaQuery,
  useAceptarLlevaMutation,
  useRechazarLlevaMutation,
} = transportistaApi;
