import type React from "react";
import { Outlet } from "react-router-dom";
import HeaderLanding from "../components/layout/HeaderLanding";

const LandingLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen ">
      <HeaderLanding />

      <div className="flex flex-col w-10/12 h-screen ">
        <Outlet />
      </div>
    </div>
  );
};

export default LandingLayout;
