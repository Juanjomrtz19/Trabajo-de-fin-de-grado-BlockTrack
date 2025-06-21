import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingLayout from "./layouts/LandingLayout";
import Home from "./pages/Home";
import LogIn from "./pages/LogIn/LogIn";
import Register from "./pages/Register/Register";
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <LogIn /> },
      { path: "register", element: <Register /> },
    ],
  },
]);

export default router;
