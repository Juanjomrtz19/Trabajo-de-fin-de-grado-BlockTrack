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
      <div className="relative h-screen w-full bg-[url('/landing.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-background-dark/50"></div>
        <div
          className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
               bg-background-light/90 p-8 rounded shadow-2xl border border-border-light/30
               h-5/6 w-3/6 flex justify-between flex-col"
        >
          <CartelMultiPaso paso={paso} nPasos={3} />

          <div className="flex-1 my-4 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={paso}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute w-full"
              >
                {cambiarFormulario()}
              </motion.div>
            </AnimatePresence>
          </div>

          <CambiarPaso paso={paso} setPaso={setPaso} />
        </div>
      </div>
    </>
  );
};

export default Register;
