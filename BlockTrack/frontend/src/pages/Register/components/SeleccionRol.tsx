import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../app/store";
import { setRol } from "../../../services/registerSlice";

const SeleccionRol = () => {
  const { rol } = useSelector((state: RootState) => state.register);
  const dispatch = useDispatch();

  return (
    <div className="flex items-center flex-col ">
      <div
        className="h-50 w-50 relative group cursor-pointer "
        onClick={() => dispatch(setRol({ rol: "TRANSPORTISTA" }))}
      >
        <p
          className={`absolute top-4 left-1/2 -translate-x-1/2 text-2xl font-semibold transition-colors duration-200 ${
            rol === "TRANSPORTISTA"
              ? "text-primary-light"
              : "text-gray-700 group-hover:text-primary-light"
          }`}
        >
          Transportista
        </p>

        <img
          src="/opcionTransportista.png"
          alt=""
          className={`transition-all duration-200 ${
            rol === "TRANSPORTISTA"
              ? "grayscale-0"
              : "grayscale group-hover:grayscale-0"
          }`}
        />
      </div>

      <div
        className="h-50 w-50 relative group cursor-pointer"
        onClick={() => dispatch(setRol({ rol: "CLIENTE" }))}
      >
        <p
          className={`absolute top-0 left-1/2 -translate-x-1/2 text-2xl font-semibold transition-colors duration-200 ${
            rol === "CLIENTE"
              ? "text-primary-light"
              : "text-gray-700 group-hover:text-primary-light"
          }`}
        >
          Usuario
        </p>

        <img
          src="/opcionUsuario.png"
          alt=""
          className={`transition-all duration-200 ${
            rol === "CLIENTE"
              ? "grayscale-0"
              : "grayscale group-hover:grayscale-0"
          }`}
        />
      </div>
    </div>
  );
};

export default SeleccionRol;
