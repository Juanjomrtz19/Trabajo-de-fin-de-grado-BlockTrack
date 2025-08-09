import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout"; // <- nuevo layout base
import LandingLayout from "./layouts/LandingLayout";
import Admin from "./pages/PrivatesRoutes/Admin/Admin";
import LogIn from "./pages/LogIn/LogIn";
import Register from "./pages/Register/Register";
import Home from "./pages/Home";
import PrivateLayout from "./layouts/PrivateLayout";
import Transporter from "./pages/PrivatesRoutes/Transporter/Transporter";

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
          { path: "/admin/transporters", element: <Transporter /> },
        ],
      },
    ],
  },
]);

export default router;
