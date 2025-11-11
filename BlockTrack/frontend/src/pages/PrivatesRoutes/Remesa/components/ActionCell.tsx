import Button from "../../../../components/common/Button/Button";
import { Remesa } from "../../../../types/remesa";
import { useDispatch } from "react-redux";
import {
  setRemesa,
  setEstaEditando,
} from "../../../../services/crearRemesaSlice";
import {
  useCancelarRemesaMutation,
  useAsignarRemesaTransportistasMutation,
} from "../../../../services/api/remesaApi";
import toast from "react-hot-toast";
import {
  ButtonAsignar,
  ButtonCambiarPoseedor,
  ButtonCancelar,
  ButtonEditar,
  ButtonVisualizacion,
} from "./Buttons";
import TopLoadingBar from "../../../../components/common/LoadingBar/LoadingBar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../app/store";
import { useCambiarProveedorRemesaMutation } from "../../../../services/api/remesaApi";

const ActionCell = ({
  remesa,
  setOpen,
}: {
  remesa: Remesa;
  setOpen: (open: boolean) => void;
}) => {
  console.log("ActionCell remesa prop:", remesa);
  const user = useSelector((state: RootState) => state.user.user);
  console.log("user", user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [cancelarRemesa] = useCancelarRemesaMutation();
  const [asignarRemesaTransportistas, { isLoading: isLoadingAsignar }] =
    useAsignarRemesaTransportistasMutation();
  const [cambiarProveedorRemesa] = useCambiarProveedorRemesaMutation();

  const handleCancelarRemesa: () => Promise<void> = async () => {
    try {
      const result = await cancelarRemesa({
        id: Number(remesa.id),
        estado: "CANCELADA",
      }).unwrap();
      toast.success(result.message);
    } catch (err) {
      toast.error("Error canceling remesa");
    }
  };
  const handleEditarRemesa = async () => {
    dispatch(setRemesa(remesa));
    dispatch(setEstaEditando(true));
    setOpen(true);
  };
  const handleAsignarRemesa: () => Promise<void> = async () => {
    try {
      const result = await asignarRemesaTransportistas(remesa.id).unwrap();
      toast.success(result.message);
    } catch (err) {
      toast.error("Error assigning remesa");
    }
  };

  const handleCambiarProveedor = async (email: string) => {
    try {
      const result = await cambiarProveedorRemesa({
        id: Number(remesa.id),
        email,
      }).unwrap();
      toast.success(result.message);
    } catch (err) {
      toast.error("Error cambiando proveedor");
    }
  };

  console.log("Rendering ActionCell for remesa:", remesa);

  const getBotones = () => {
    switch (remesa.estado) {
      case "PENDIENTE":
        return (
          <div className="flex gap-2 flex-wrap">
            <ButtonEditar accion={handleEditarRemesa} />
            <ButtonCancelar action={handleCancelarRemesa} />
            <ButtonAsignar action={handleAsignarRemesa} />
            <ButtonVisualizacion
              action={() =>
                navigate(`/admin/remesas/${remesa.id}/historial-remesas`)
              }
            />
          </div>
        );

      default:
        return (
          <div className="flex gap-2 flex-wrap">
            <ButtonVisualizacion
              action={() =>
                navigate(`/admin/remesas/${remesa.id}/historial-remesas`)
              }
            />
            {remesa?.onchain?.poseedorActual === user?.email && (
              <ButtonCambiarPoseedor
                action={async () => {
                  handleCambiarProveedor(user?.email || "");
                }}
              />
            )}
          </div>
        );
    }
  };

  return (
    <>
      <TopLoadingBar active={isLoadingAsignar} />
      {getBotones()}
    </>
  );
};

export default ActionCell;
