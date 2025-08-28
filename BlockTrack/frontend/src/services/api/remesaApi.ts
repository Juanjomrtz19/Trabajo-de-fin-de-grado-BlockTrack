import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import { type Remesa } from "../../types/remesa";

export const remesaApi = createApi({
  reducerPath: "remesaApi",
  baseQuery,
  tagTypes: ["Remesa"],
  endpoints: (builder) => ({
    getRemesas: builder.query<Remesa[], void>({
      query: () => ({
        url: "/remesas",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Remesa" as const, id })),
              { type: "Remesa" as const, id: "LIST" },
            ]
          : [{ type: "Remesa" as const, id: "LIST" }],
    }),
    getRemesa: builder.query<Remesa, number>({
      query: (id: number) => ({
        url: `/remesas/${id}`,
        method: "GET",
      }),
    }),
    crearRemesa: builder.mutation<any, Partial<Remesa>>({
      query: (body) => ({
        url: "/remesas",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Remesa" as const, id: "LIST" }],
    }),

    editarRemesa: builder.mutation<any, { body: Partial<Remesa>; id: number }>({
      query: ({ body, id }) => ({
        url: `/remesas/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Remesa" as const, id: "LIST" }],
    }),

    cancelarRemesa: builder.mutation<any, { id: number; estado: string }>({
      query: ({ id, estado }) => ({
        url: `/remesas/cancelarRemesa/${id}`,
        method: "PATCH",
        body: { estado },
      }),
      invalidatesTags: [{ type: "Remesa" as const, id: "LIST" }],
    }),

    asignarRemesaTransportistas: builder.mutation<any, any>({
      query: (idRemesa) => ({
        url: `/remesas/asignarTransportistas/${idRemesa}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Remesa" as const, id: "LIST" }],
    }),
    obtenerRemesaLlevas: builder.query<any, number>({
      query: (remesaId) => ({
        url: `/remesas/${remesaId}/llevas`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.result,
    }),
  }),
});

export const {
  useGetRemesasQuery,
  useCrearRemesaMutation,
  useEditarRemesaMutation,
  useCancelarRemesaMutation,
  useAsignarRemesaTransportistasMutation,
  useObtenerRemesaLlevasQuery,
  useGetRemesaQuery,
} = remesaApi;
