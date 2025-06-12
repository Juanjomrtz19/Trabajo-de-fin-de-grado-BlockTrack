import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingLayout from "./layouts/LandingLayout";
import Home from "./pages/Home";
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingLayout />,
    children: [{ index: true, element: <Home /> }],
  },
]);

export default router;
