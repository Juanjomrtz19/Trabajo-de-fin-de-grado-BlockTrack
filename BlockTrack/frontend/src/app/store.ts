// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "../services/api/userApi";
import userReducer from "../services/userSlice";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    user: userReducer,
    // otros reducers si tienes
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
