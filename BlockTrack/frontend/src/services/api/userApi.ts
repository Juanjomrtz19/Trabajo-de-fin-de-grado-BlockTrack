// src/services/api/userApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import type { RegisterUserPayload } from "../../types/User";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery,
  endpoints: (builder) => ({
    registerUser: builder.mutation<any, RegisterUserPayload>({
      query: (userData) => ({
        url: "/users/register",
        method: "POST",
        body: userData,
      }),
    }),
  }),
});

export const { useRegisterUserMutation } = userApi;
