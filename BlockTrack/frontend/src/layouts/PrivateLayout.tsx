import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import NavBarPrivate from "../components/layout/NavBarPrivate";
import Button from "../components/common/Button/Button";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { getAsignacionesSocket } from "../sockets/asignaciones";
import NotificationCounter from "../components/common/NotificationCounter/NotificationCounter";

const sidebarWidth = 256;

const PrivateLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const user = useSelector((state) => (state as RootState).user.user);
  const [pendientes, setPendientes] = useState<number | null>(null);

  const privateRoutesClient = [
    { path: "/admin", name: "Settings" },
    { path: "/admin/dashboard", name: "Dashboard" },
    { path: "/admin/remesas", name: "Remesas" },
  ];

  const privateRoutesTransportista = [
    { path: "/admin", name: "Settings" },
    { path: "/admin/dashboard", name: "Dashboard" },
    { path: "/admin/vehiculos", name: "Vehículos" },
    {
      path: "/admin/asignaciones",
      name: "Asignaciones",
      icon: <NotificationCounter counter={pendientes ?? 0} />,
    },
  ];

  useEffect(() => {
    const socket = getAsignacionesSocket();

    const onConnect = () => socket.emit("asignaciones:pendientes");
    const onPendientes = (n: number) => setPendientes(n);
    const onErr = (e: any) => console.error("socket error:", e?.message || e);

    socket.on("connect", onConnect);
    socket.on("asignaciones:pendientes", onPendientes);
    socket.on("connect_error", onErr);
  }, []);

  return (
    <div className="flex min-h-screen relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 w-12 h-12 p-2 rounded-full bg-blue-600 text-white flex items-center justify-center"
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
            routes={
              user?.rol === "CLIENTE"
                ? privateRoutesClient
                : privateRoutesTransportista
            }
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
