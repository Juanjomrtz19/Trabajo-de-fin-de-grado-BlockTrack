// src/services/api/userApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base";
import {
  type User,
  type LoginUserPayload,
  type RegisterUserPayload,
} from "../../types/User";
import { LogOut } from "lucide-react";

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

    loginUser: builder.mutation<any, LoginUserPayload>({
      query: (userData) => ({
        url: "/users/login",
        method: "POST",
        body: userData,
      }),
    }),

    getMe: builder.query<User, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      transformResponse: (response: { user: User }) => response.user,
    }),

    updateUser: builder.mutation<any, User>({
      query: (userData) => ({
        url: `/users/updateUser`,
        method: "PUT",
        body: userData,
      }),
    }),

    logOut: builder.mutation<any, any>({
      query: () => ({
        url: "/users/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateUserMutation,
  useLogOutMutation,
} = userApi;
