import type React from "react";
import { Outlet } from "react-router-dom";
import HeaderLanding from "../components/layout/HeaderLanding";

const LandingLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <HeaderLanding />

      <div className="flex flex-col w-full lg:flex-1 h-screen overflow-y-auto">
        <div className="lg:hidden h-20"></div> {/* Spacer for mobile header */}
        <Outlet />
      </div>
    </div>
  );
};

export default LandingLayout;
