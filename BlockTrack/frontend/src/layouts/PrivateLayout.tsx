import { useState } from "react";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import NavBarPrivate from "../components/layout/NavBarPrivate";
import Button from "../components/common/Button/Button";

const sidebarWidth = 256;

const PrivateLayout = () => {
  const [isOpen, setIsOpen] = useState(true);

  const privateRoutes = [{ path: "/admin", name: "Settings" }];

  return (
    <div className="flex min-h-screen relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-100 w-12 h-12 p-2 rounded-full bg-blue-600 text-white flex items-center justify-center"
      >
        {isOpen ? "✕" : "☰"}
      </Button>
      <motion.div
        animate={{ width: isOpen ? sidebarWidth : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden bg-primary-light shadow-lg 
             fixed sm:fixed lg:static h-screen z-40"
      >
        {isOpen && (
          <NavBarPrivate
            routes={privateRoutes}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        )}
      </motion.div>

      <motion.main
        animate={{ marginLeft: isOpen ? 0 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-h-full w-full overflow-y-auto flex justify-center"
      >
        <div className="py-10 p-16 w-full">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default PrivateLayout;
