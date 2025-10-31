// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { api } from "../services/api/api";
import userReducer from "../services/userSlice";
import registerReducer from "../services/registerSlice";
import CrearRemesaReducer from "../services/crearRemesaSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    user: userReducer,
    register: registerReducer,
    crearRemesa: CrearRemesaReducer,
  },
  middleware: (gDM) => gDM().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
