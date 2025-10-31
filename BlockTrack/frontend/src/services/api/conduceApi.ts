import { createApi } from "@reduxjs/toolkit/query/react";
import { api } from "./api";

export const conduceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    obtenerConduce: builder.query<any, void>({
      query: () => "/conduce",
      providesTags: ["Conduce"],
    }),
    crearConduce: builder.mutation({
      query: (data) => ({
        url: "/conduce",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Conduce"],
    }),
    borrarConduce: builder.mutation({
      query: () => ({
        url: `/conduce`,
        method: "DELETE",
      }),
      invalidatesTags: ["Conduce"],
    }),
  }),
});

export const {
  useObtenerConduceQuery,
  useCrearConduceMutation,
  useBorrarConduceMutation,
} = conduceApi;
