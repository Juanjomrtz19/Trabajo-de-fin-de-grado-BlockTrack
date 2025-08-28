import { MdEdit } from "react-icons/md";
import { RiDeleteBack2Fill } from "react-icons/ri";
import Button from "../../../../components/common/Button/Button";
import { Transporte } from "../../../../types/transporte";
import { useDeleteTransporteMutation } from "../../../../services/api/transporteApi";
import toast from "react-hot-toast";
import {
  useCrearConduceMutation,
  useBorrarConduceMutation,
} from "../../../../services/api/conduceApi";

const VehicleCard = ({
  vehicle,
  selectedVehicle,
  setOpen,
  conduceData,
}: {
  vehicle: Transporte;
  selectedVehicle: (vehicle: Transporte | null) => void;
  setOpen: (open: boolean) => void;
  conduceData: any;
}) => {
  const [deleteTransporte] = useDeleteTransporteMutation();
  const [crearConduce] = useCrearConduceMutation();
  const [borrarConduce] = useBorrarConduceMutation();
  const handleDelete = async () => {
    try {
      await deleteTransporte(vehicle?.id ?? -1).unwrap();
      toast.success("Vehículo eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el vehículo");
    }
  };

  const handleConduce = async () => {
    try {
      await crearConduce({ transporteId: vehicle.id }).unwrap();
      toast.success("Vehículo asignado para la conducción");
    } catch (error) {
      toast.error("Error al asignar el vehículo para la conducción");
    }
  };

  const handleDeleteConduce = async () => {
    try {
      await borrarConduce({ transporteId: vehicle.id }).unwrap();
      toast.success("Ya no se conduce este vehículo");
    } catch (error) {
      toast.error("Error al dejar de conducir el vehículo");
    }
  };

  return (
    <div className="border p-4 m-2 rounded shadow shadow-secondary-light relative border-primary-light">
      <div className="absolute top-2 right-2 flex justify-center items-center">
        <MdEdit
          size={18}
          className="inline-block  mr-2 cursor-pointer text-primary-light"
          onClick={() => {
            selectedVehicle(vehicle);
            setOpen(true);
          }}
        />
        <RiDeleteBack2Fill
          size={18}
          className="inline-block cursor-pointer text-error-light"
          onClick={handleDelete}
        />
      </div>
      <h3 className="text-lg font-semibold">{vehicle.marca}</h3>
      <p className="text-gray-600">Matrícula: {vehicle.matricula}</p>
      <p className="text-gray-600">
        Capacidad de carga: {vehicle.capacidadCarga}
      </p>
      <p className="text-gray-600">Tipo de carga: {vehicle.tipoCarga}</p>
      <div className="flex items-center justify-center">
        <div className="w-30 h-30 object-cover">
          <img
            src={"/camionVehiculos.png"}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="justify-center items-center flex">
        {conduceData?.transporteId !== vehicle?.id ? (
          <Button variant="accent" onClick={handleConduce}>
            Conducir
          </Button>
        ) : (
          <Button variant="error" onClick={handleDeleteConduce}>
            Dejar de conducir
          </Button>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
