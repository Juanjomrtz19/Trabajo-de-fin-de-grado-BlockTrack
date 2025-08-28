import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout"; // <- nuevo layout base
import LandingLayout from "./layouts/LandingLayout";
import Admin from "./pages/PrivatesRoutes/Admin/Admin";
import LogIn from "./pages/LogIn/LogIn";
import Register from "./pages/Register/Register";
import Home from "./pages/Home";
import PrivateLayout from "./layouts/PrivateLayout";
import Remesa from "./pages/PrivatesRoutes/Remesa/Remesa";
import RequireRole from "./layouts/RequireRole";
import Vehicles from "./pages/PrivatesRoutes/Vehicles/Vehicles";
import HistorialRemesa from "./pages/PrivatesRoutes/HistorialRemesa/HistorialRemesa";
import Asignacion from "./pages/PrivatesRoutes/Asignacion/Asignacion";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <LandingLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "login", element: <LogIn /> },
          { path: "register", element: <Register /> },
        ],
      },
      {
        path: "/admin",
        element: <PrivateLayout />,
        children: [
          { index: true, element: <Admin /> },
          {
            // element: <RequireRole allowed={["CLIENTE"]} />,
            children: [{ path: "remesas", element: <Remesa /> }],
          },
          {
            // element: <RequireRole allowed={["CLIENTE"]} />,
            children: [
              {
                path: "remesas/:idRemesa/historial-remesas",
                element: <HistorialRemesa />,
              },
            ],
          },
          {
            // element: <RequireRole allowed={["TRANSPORTISTA"]} />,
            children: [{ path: "vehiculos", element: <Vehicles /> }],
          },
          {
            //element: <RequireRole allowed={["TRANSPORTISTA"]} />,
            children: [{ path: "asignaciones", element: <Asignacion /> }],
          },
        ],
      },
    ],
  },
]);

export default router;
