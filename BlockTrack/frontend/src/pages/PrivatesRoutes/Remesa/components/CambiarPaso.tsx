import { useState } from "react";
import Button from "../../../../components/common/Button/Button";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../app/store";
import toast from "react-hot-toast";
import { Remesa } from "../../../../types/remesa";
import {
  useCrearRemesaMutation,
  useEditarRemesaMutation,
} from "../../../../services/api/remesaApi";

// Si ya tienes estos regex en utils, impórtalos desde allí.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
// CP España: 5 dígitos (no empezando por 00)
const CP_ES_REGEX = /^(0?[1-9]|[1-4]\d|5[0-2])\d{3}$/;

interface CambiarPasoProps {
  paso: number;
  setPaso: React.Dispatch<React.SetStateAction<number>>;
}

const CambiarPaso = ({ paso, setPaso }: CambiarPasoProps) => {
  const {
    id,
    peso,
    medida,
    nPaquetes,
    tipoMercancia,
    emailDestinatario,
    observaciones,
    datosEnvio,
    datosRecogida,
    estaEditando,
  } = useSelector((state: RootState) => state.crearRemesa);
  const [createRemesa] = useCrearRemesaMutation();
  const [editarRemesa] = useEditarRemesaMutation();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helpers
  const isNumber = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  const isPositive = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) && v > 0;
  const isPositiveInt = (v: unknown) =>
    typeof v === "number" && Number.isInteger(v) && v > 0;
  const nonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;

  /** Valida SOLO el paso actual según tu orden:
   * 0 -> datos iniciales
   * 1 -> dirección de envío
   * 2 -> dirección de recogida
   */
  const validatePaso = (pasoActual: number): Record<string, string> => {
    const e: Record<string, string> = {};

    if (pasoActual === 0) {
      // Email destinatario
      if (!EMAIL_REGEX.test(emailDestinatario ?? "")) {
        e.emailDestinatario = "Introduce un email de destinatario válido";
      }
      // Mercancía
      if (!isPositive(peso)) e.peso = "Peso debe ser un número > 0";

      if (!isPositiveInt(nPaquetes))
        e.nPaquetes = "Número de paquetes debe ser un entero > 0";
      if (!tipoMercancia || !nonEmpty(String(tipoMercancia))) {
        e.tipoMercancia = "Tipo de mercancía es obligatorio";
      }
    }

    if (pasoActual === 1) {
      // Dirección de envío
      if (!nonEmpty(datosEnvio?.direccion ?? "")) {
        e.envio_direccion = "Dirección de envío es obligatoria";
      }
      if (!isNumber(datosEnvio?.lat) || !isNumber(datosEnvio?.lon)) {
        e.envio_coords =
          "Selecciona una dirección de envío válida (con coordenadas)";
      }
      // Si quieres CP/ciudad obligatorios, descomenta:
      if (!nonEmpty(datosEnvio?.ciudad ?? ""))
        e.envio_ciudad = "Ciudad de envío es obligatoria";
      if (!nonEmpty(datosEnvio?.codPostal ?? ""))
        e.envio_cp = "Código postal de envío es obligatorio";
    }

    if (pasoActual === 2) {
      // Dirección de recogida
      if (!nonEmpty(datosRecogida?.direccion ?? "")) {
        e.recogida_direccion = "Dirección de recogida es obligatoria";
      }
      if (!isNumber(datosRecogida?.lat) || !isNumber(datosRecogida?.lon)) {
        e.recogida_coords =
          "Selecciona una dirección de recogida válida (con coordenadas)";
      }
      // Si quieres CP/ciudad obligatorios, descomenta:
      if (!nonEmpty(datosRecogida?.ciudad ?? ""))
        e.recogida_ciudad = "Ciudad de recogida es obligatoria";
      if (!nonEmpty(datosRecogida?.codPostal ?? ""))
        e.recogida_cp = "Código postal de recogida es obligatorio";
    }

    return e;
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
      const msg = Object.values(validationResult).join("\n");
      toast.error(msg);
      return;
    }
    handleMas();
  };

  const handleSubmit = async () => {
    // Validamos TODOS los pasos antes de crear
    const allSteps = [0, 1, 2];
    const aggregateErrors = allSteps.reduce((acc, step) => {
      return { ...acc, ...validatePaso(step) };
    }, {} as Record<string, string>);

    const isValid = Object.keys(aggregateErrors).length === 0;
    if (!isValid) {
      setErrors(aggregateErrors);
      const msg = Object.values(aggregateErrors).join("\n");
      toast.error(msg);
      return;
    }

    try {
      const dataRemesa: Remesa = {
        id: id ?? undefined,
        peso: peso ?? 0,
        medida: medida ?? "0x0x0",
        nPaquetes: nPaquetes ?? 0,
        tipoMercancia: tipoMercancia ?? "GENERICO",
        estado: "PENDIENTE",

        // ENTREGA
        dirEnvio: datosEnvio?.direccion ?? "",
        ciudadEnvio: datosEnvio?.ciudad ?? "",
        codigoPostalEnvio: datosEnvio?.codPostal ?? "",
        latEnvio: datosEnvio?.lat ?? 0,
        lngEnvio: datosEnvio?.lon ?? 0,

        // RECOGIDA
        dirRecogida: datosRecogida?.direccion ?? "",
        ciudadRecogida: datosRecogida?.ciudad ?? "",
        codigoPostalRecogida: datosRecogida?.codPostal ?? "",
        latRecogida: datosRecogida?.lat ?? 0,
        lngRecogida: datosRecogida?.lon ?? 0,

        // Contacto
        emailDestinatario: emailDestinatario ?? "",

        observaciones: observaciones ?? "",
      };
      console.log("dataRemesa", dataRemesa);

      if (estaEditando)
        await editarRemesa({
          body: dataRemesa,
          id: Number(dataRemesa.id),
        }).unwrap();
      else await createRemesa(dataRemesa).unwrap();

      toast.success(`Remesa ${estaEditando ? "editada" : "creada"} con éxito`);
    } catch {
      toast.error(`Error al ${estaEditando ? "editar" : "crear"} la remesa`);
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
        {paso + 1 === 3
          ? estaEditando
            ? "Editar remesa"
            : "Crear remesa"
          : "Siguiente"}
      </Button>
    </div>
  );
};

export default CambiarPaso;
