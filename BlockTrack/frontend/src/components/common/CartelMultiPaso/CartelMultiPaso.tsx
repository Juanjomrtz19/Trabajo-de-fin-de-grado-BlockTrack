import { motion } from "framer-motion";

interface CartelMultiPaso {
  paso: number;
  nPasos: number;
}

const CartelMultiPaso = ({ paso, nPasos }: CartelMultiPaso) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {Array.from({ length: nPasos }, (_, index) => {
        const activo = paso >= index;
        const completado = paso - 1 >= index;

        return (
          <div key={index} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                opacity: activo ? 1 : 0.6,
              }}
              transition={{ duration: 0.3 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold 
                transition-all duration-300
                ${
                  activo
                    ? "bg-accent-light border-4 border-accent-dark"
                    : "bg-gray-300"
                }
              `}
            >
              {index + 1}
            </motion.div>

            {index < nPasos - 1 && (
              <div className="w-10 h-1 mx-2 bg-gray-300 relative overflow-hidden rounded">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: completado ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute left-0 top-0 h-full w-full bg-accent-light origin-left"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CartelMultiPaso;
