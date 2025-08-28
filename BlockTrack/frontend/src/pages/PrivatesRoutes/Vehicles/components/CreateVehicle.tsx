import { useState } from "react";
import Dialog from "../../../../components/common/Dialog/Dialog";
import TextField from "../../../../components/common/Inputs/TextField";
import { Transporte } from "../../../../types/transporte";
import {
  useCreateTransporteMutation,
  useUpdateTransporteMutation,
} from "../../../../services/api/transporteApi";
import toast from "react-hot-toast";

const CreateVehicle = ({
  open,
  onClose,
  vehicle,
}: {
  open: boolean;
  onClose: () => void;
  vehicle: Transporte | null;
}) => {
  const [matricula, setMatricula] = useState<string>(vehicle?.matricula || "");
  const [marca, setMarca] = useState<string>(vehicle?.marca || "");
  const [tipoCarga, setTipoCarga] = useState<string>(vehicle?.tipoCarga || "");
  const [capacidadCarga, setCapacidadCarga] = useState<string>(
    vehicle?.capacidadCarga || ""
  );

  const [createTransporte] = useCreateTransporteMutation();
  const [updateTransporte] = useUpdateTransporteMutation();

  const [errors, setErrors] = useState({
    matricula: "",
    marca: "",
    tipoCarga: "",
    capacidadCarga: "",
  });

  const handleSubmit = async () => {
    let hasErrors = false;
    const newErrors = {
      matricula: "",
      marca: "",
      tipoCarga: "",
      capacidadCarga: "",
    };

    if (!matricula.trim()) {
      newErrors.matricula = "La matrícula es requerida";
      hasErrors = true;
    }
    if (!marca.trim()) {
      newErrors.marca = "La marca es requerida";
      hasErrors = true;
    }
    if (!tipoCarga.trim()) {
      newErrors.tipoCarga = "El tipo de carga es requerido";
      hasErrors = true;
    }
    if (!capacidadCarga.trim()) {
      newErrors.capacidadCarga = "La capacidad de carga es requerida";
      hasErrors = true;
    }

    setErrors(newErrors);
    if (hasErrors) {
      return;
    }

    const data: Transporte = {
      tipoCarga,
      matricula,
      capacidadCarga,
      marca,
    };

    try {
      if (vehicle) {
        await updateTransporte({ ...data, id: vehicle.id }).unwrap();
        toast.success("Vehículo actualizado con éxito");
      } else {
        await createTransporte(data).unwrap();
        toast.success("Vehículo creado con éxito");
      }

      onClose();
    } catch (error) {
      toast.error("Error al crear/actualizar transporte");
      console.error("Error al crear transporte:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Añadir vehículo"
      onConfirm={() => handleSubmit()}
      confirmText="Guardar"
    >
      <form
        id="vehicle-form"
        className="grid grid-cols-6 gap-6"
        onSubmit={handleSubmit}
      >
        <button type="submit" className="hidden" />

        <div className="col-span-3">
          <TextField
            label="Matrícula"
            value={matricula}
            onChange={(e) => {
              setMatricula(e.target.value);
              if (errors.matricula) setErrors((p) => ({ ...p, matricula: "" }));
            }}
            onBlur={() => {
              if (matricula && !matricula.trim()) {
                setErrors((p) => ({
                  ...p,
                  matricula: "La matrícula es requerida",
                }));
              }
            }}
            errorMessage={errors.matricula}
            placeholder="1234-ABC"
          />
        </div>

        <div className="col-span-3">
          <TextField
            label="Marca"
            value={marca}
            onChange={(e) => {
              setMarca(e.target.value);
              if (errors.marca) setErrors((p) => ({ ...p, marca: "" }));
            }}
            onBlur={() => {
              if (marca && !marca.trim()) {
                setErrors((p) => ({ ...p, marca: "La marca es requerida" }));
              }
            }}
            errorMessage={errors.marca}
            placeholder="Ford, Iveco..."
          />
        </div>

        <div className="col-span-6">
          <TextField
            label="Tipo de carga"
            value={tipoCarga}
            onChange={(e) => {
              setTipoCarga(e.target.value);
              if (errors.tipoCarga) setErrors((p) => ({ ...p, tipoCarga: "" }));
            }}
            onBlur={() => {
              if (tipoCarga && !tipoCarga.trim()) {
                setErrors((p) => ({
                  ...p,
                  tipoCarga: "El tipo de carga es requerido",
                }));
              }
            }}
            errorMessage={errors.tipoCarga}
            placeholder="Palets, granel..."
          />
        </div>

        <div className="col-span-6">
          <TextField
            label="Capacidad de carga"
            value={capacidadCarga}
            onChange={(e) => {
              setCapacidadCarga(e.target.value);
              if (errors.capacidadCarga)
                setErrors((p) => ({ ...p, capacidadCarga: "" }));
            }}
            onBlur={() => {
              if (!capacidadCarga.trim()) {
                setErrors((p) => ({
                  ...p,
                  capacidadCarga: "La capacidad de carga es requerida",
                }));
              }
            }}
            errorMessage={errors.capacidadCarga}
            placeholder="p. ej., Alto x Ancho x Profundidad en cm"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default CreateVehicle;
