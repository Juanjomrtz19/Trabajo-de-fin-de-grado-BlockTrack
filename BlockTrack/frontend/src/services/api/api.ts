// src/store/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/",
    credentials: "include",
  }),
  tagTypes: [
    "Remesa",
    "Lleva",
    "Usuario",
    "Transportista",
    "Transporte",
    "Conduce",
  ],
  endpoints: () => ({}),
});
