import { Outlet } from "react-router-dom";
import AppInitializer from "../components/AppInitializer/AppInitializer";

const RootLayout = () => {
  return (
    <>
      <AppInitializer />
      <Outlet />
    </>
  );
};

export default RootLayout;
