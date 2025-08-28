// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "../services/api/userApi";
import { remesaApi } from "../services/api/remesaApi";
import { transportistaApi } from "../services/api/transportistaApi";
import { transporteApi } from "../services/api/transporteApi";
import { conduceApi } from "../services/api/conduceApi";
import userReducer from "../services/userSlice";
import registerReducer from "../services/registerSlice";
import CrearRemesaReducer from "../services/crearRemesaSlice";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [remesaApi.reducerPath]: remesaApi.reducer,
    [transportistaApi.reducerPath]: transportistaApi.reducer,
    [transporteApi.reducerPath]: transporteApi.reducer,
    [conduceApi.reducerPath]: conduceApi.reducer,
    user: userReducer,
    register: registerReducer,
    crearRemesa: CrearRemesaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(remesaApi.middleware)
      .concat(transportistaApi.middleware)
      .concat(transporteApi.middleware)
      .concat(conduceApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
