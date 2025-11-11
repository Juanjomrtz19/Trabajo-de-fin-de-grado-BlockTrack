import { useState } from "react";
import SeleccionRol from "./components/SeleccionRol";
import UsuarioGeneral from "./components/UsuarioGeneral";
import CartelMultiPaso from "../../components/common/CartelMultiPaso/CartelMultiPaso";
import CambiarPaso from "./components/CambiarPaso";
import { motion, AnimatePresence } from "framer-motion";
import UsuarioEspecifico from "./components/UsuarioEspecifico";

const Register = () => {
  const [paso, setPaso] = useState<number>(0);
  console.log("paso", paso);

  const cambiarFormulario = () => {
    switch (paso) {
      case 0:
        return <SeleccionRol />;

      case 1:
        return <UsuarioGeneral />;

      case 2:
        return <UsuarioEspecifico />;

      default:
        break;
    }
  };

  return (
    <>
      <div className="relative min-h-full w-full bg-[url('/landing.png')] bg-cover bg-center bg-fixed">
        <div className="absolute inset-0 bg-background-dark/50"></div>
        <div className="min-h-screen w-full flex items-center justify-center py-24 lg:py-12 px-4">
          <div
            className="relative z-10
               bg-background-light/90 p-4 sm:p-6 lg:p-8 rounded shadow-2xl border border-border-light/30
               w-full sm:w-[90%] md:w-4/5 lg:w-3/5 xl:w-1/2 2xl:w-2/5
               min-h-[600px] max-h-[85vh]
               flex justify-between flex-col"
          >
            <CartelMultiPaso paso={paso} nPasos={3} />

            <div className="flex-1 my-2 sm:my-3 lg:my-4 relative overflow-hidden overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={paso}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute w-full h-full"
                >
                  {cambiarFormulario()}
                </motion.div>
              </AnimatePresence>
            </div>

            <CambiarPaso paso={paso} setPaso={setPaso} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
