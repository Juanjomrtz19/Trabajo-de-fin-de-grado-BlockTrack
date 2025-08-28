import { useState } from "react";
import Button from "../../../components/common/Button/Button";
import type { RootState } from "../../../app/store";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  DNI_REGEX,
  EMAIL_REGEX,
  PASSWORD_REGEX,
  PHONE_REGEX,
} from "../../../utils/regex";
import type { RegisterUserPayload } from "../../../types/User";
import { useRegisterUserMutation } from "../../../services/api/userApi";

interface CambiarPaso {
  paso: number;
  setPaso: React.Dispatch<React.SetStateAction<number>>;
}

const CambiarPaso = ({ paso, setPaso }: CambiarPaso) => {
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const {
    rol,
    nombre,
    apellidos,
    dni,
    email,
    telefono,
    contrasenia,
    confirmarContrasenia,
    direccionPrincipal,
    zonaOperativa,
    direccionPrincipalCP,
    direccionPrincipalCiudad,
    direccionPrincipalLat,
    direccionPrincipalLon,
    zonaOperativaLat,
    zonaOperativaLon,
    zonaOperativaCP,
    zonaOperativaCiudad,
  } = useSelector((state: RootState) => state.register);

  const validatePaso = (pasoActual: number): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (pasoActual === 0) {
      if (!rol || rol.trim() === "") {
        newErrors.rol = "Role must be selected";
      }
    }

    if (pasoActual === 1) {
      if (nombre.trim() === "") newErrors.nombre = "First Name cannot be empty";
      if (apellidos.trim() === "")
        newErrors.apellidos = "Last Name cannot be empty";
      if (!EMAIL_REGEX.test(email))
        newErrors.email = "Please enter a valid email address";
      if (!PHONE_REGEX.test(String(telefono)))
        newErrors.telefono = "Please enter a valid phone number";
      if (!DNI_REGEX.test(dni)) newErrors.dni = "Please enter a valid DNI";
      if (!PASSWORD_REGEX.test(contrasenia)) {
        newErrors.contrasenia =
          "Password must be 8+ chars, 1 letter & 1 number";
      }
      if (contrasenia !== confirmarContrasenia) {
        newErrors.confirmarContrasenia = "Passwords do not match";
      }
    }

    if (pasoActual === 2) {
      if (rol === "TRANSPORTISTA" && (!zonaOperativa || zonaOperativa === "")) {
        newErrors.zonaOperativa = "Operative zone cannot be empty";
      }
      if (
        rol === "CLIENTE" &&
        (!direccionPrincipal || direccionPrincipal === "")
      ) {
        newErrors.direccionPrincipal = "Main direction cannot be empty";
      }
    }

    return newErrors;
  };

  const handleMas = () => {
    const n = paso + 1;

    if (n <= 2) setPaso(n);
  };

  const handleMenos = () => {
    const n = paso - 1;

    if (n >= 0) setPaso(n);
  };

  const handlePasoSiguiente = () => {
    const validationResult = validatePaso(paso);
    const isValid = Object.keys(validationResult).length === 0;

    if (!isValid) {
      setErrors(validationResult);
      const formatMessage = Object.values(validationResult).join("\n");
      toast.error(formatMessage);
      return;
    }

    handleMas();
  };

  const [errors, setErrors] = useState<Record<string, string>>({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    contrasenia: "",
    confirmarContrasenia: "",
    dni: "",
    direccionPrincipal: "",
    zonaOperativa: "",
  });

  const handleErrors = () => {
    const newErrors: Record<string, string> = {};

    if (nombre.trim() === "") {
      newErrors.nombre = "First Name cannot be empty";
    }
    if (apellidos.trim() === "") {
      newErrors.apellidos = "Last Name cannot be empty";
    }
    if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!PHONE_REGEX.test(telefono !== null ? String(telefono) : "")) {
      newErrors.telefono = "Please enter a valid phone number";
    }
    if (!DNI_REGEX.test(dni)) {
      newErrors.dni = "Please enter a valid phone dni";
    }
    if (!PASSWORD_REGEX.test(contrasenia)) {
      newErrors.contrasenia = "Password must be 8+ chars, 1 letter & 1 number";
    }
    if (contrasenia !== confirmarContrasenia) {
      newErrors.confirmarContrasenia = "Passwords do not match";
    }
    if (rol === "TRANSPORTISTA" && (!zonaOperativa || zonaOperativa === "")) {
      newErrors.zonaOperativa = "Operative zone cannot be empty";
    }
    if (
      rol === "CLIENTE" &&
      (!direccionPrincipal || direccionPrincipal === "")
    ) {
      newErrors.direccionPrincipal = "Main direction cannot be empty";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationResult = handleErrors();
    const isValid = Object.keys(validationResult).length === 0;

    if (!isValid) {
      const formatMessage = Object.values(validationResult)
        .filter((msg) => msg)
        .join("\n");

      toast.error(formatMessage);
      return;
    }

    const data: RegisterUserPayload = {
      rol,
      nombre,
      apellidos,
      dni,
      email,
      telefono,
      contrasenia,
      direccionPrincipal: rol === "TRANSPORTISTA" ? null : direccionPrincipal,
      zonaOperativa: rol === "TRANSPORTISTA" ? zonaOperativa : null,
      direccionPrincipalCP:
        rol === "TRANSPORTISTA" ? null : Number(direccionPrincipalCP),
      direccionPrincipalCiudad:
        rol === "TRANSPORTISTA" ? null : direccionPrincipalCiudad,
      direccionPrincipalLat:
        rol === "TRANSPORTISTA" ? null : direccionPrincipalLat,
      direccionPrincipalLon:
        rol === "TRANSPORTISTA" ? null : direccionPrincipalLon,
      zonaOperativaCP: rol === "CLIENTE" ? null : Number(zonaOperativaCP),
      zonaOperativaCiudad: rol === "CLIENTE" ? null : zonaOperativaCiudad,
      zonaOperativaLat: rol === "CLIENTE" ? null : zonaOperativaLat,
      zonaOperativaLon: rol === "CLIENTE" ? null : zonaOperativaLon,
    };

    try {
      const result = await registerUser(data);
      toast.success("Usuario registrado con éxito");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error desconocido al registrar usuario");
      }
    }
  };

  return (
    <div className="flex justify-between">
      <Button color="primary" onClick={handleMenos}>
        Anterior
      </Button>
      <Button
        color="primary"
        onClick={async () => {
          if (paso + 1 === 3) {
            await handleSubmit();
          } else {
            handlePasoSiguiente();
          }
        }}
      >
        {paso + 1 === 3 ? "Registrarse" : "Siguiente"}
      </Button>
    </div>
  );
};

export default CambiarPaso;
