import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./styles/index.css";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import AppInitializer from "./components/AppInitializer/AppInitializer";

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppInitializer />
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </Provider>
  </React.StrictMode>
);
