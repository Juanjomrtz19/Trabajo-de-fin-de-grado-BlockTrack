import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import { Transporte } from "../../types/transporte";

export const transporteApi = createApi({
  reducerPath: "transporteApi",
  baseQuery,
  tagTypes: ["Transporte"] as const,
  endpoints: (builder) => ({
    createTransporte: builder.mutation<Transporte, Partial<Transporte>>({
      query: (transporte) => ({
        url: "/transportes",
        method: "POST",
        body: transporte,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Transporte", id: arg.id },
        { type: "Transporte", id: "LIST" },
      ],
    }),
    getTransportes: builder.query<Transporte[], void>({
      query: () => ({
        url: "/transportes",
        method: "GET",
      }),
      transformResponse: (response: {
        message: string;
        result: Transporte[];
      }) => {
        return response.result;
      },
      providesTags: (result) =>
        result && result.length
          ? [
              ...result
                .filter((t): t is Transporte & { id: number } => t.id != null)
                .map(({ id }) => ({ type: "Transporte" as const, id })),
              { type: "Transporte" as const, id: "LIST" },
            ]
          : [{ type: "Transporte" as const, id: "LIST" }],
    }),
    updateTransporte: builder.mutation<Transporte, Partial<Transporte>>({
      query: (transporte) => ({
        url: `/transportes/${transporte.id}`,
        method: "PUT",
        body: transporte,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Transporte", id: arg.id },
        { type: "Transporte", id: "LIST" },
      ],
    }),
    deleteTransporte: builder.mutation<Transporte, number>({
      query: (id) => ({
        url: `/transportes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Transporte", id: arg },
        { type: "Transporte", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateTransporteMutation,
  useGetTransportesQuery,
  useUpdateTransporteMutation,
  useDeleteTransporteMutation,
} = transporteApi;
