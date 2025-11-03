import Button from "../../../../components/common/Button/Button";
import { LLeva } from "../../../../types/lleva";
import {
  ButtonCambiarPoseedor,
  ButtonVisualizacion,
} from "../../Remesa/components/Buttons";
import { useNavigate } from "react-router-dom";
import {
  useAceptarLlevaMutation,
  useRechazarLlevaMutation,
} from "../../../../services/api/transportistaApi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../../../app/store";
import { useCambiarProveedorRemesaMutation } from "../../../../services/api/remesaApi";

const ActionButtons = ({ lleva }: { lleva: LLeva }) => {
  const user = useSelector((state: RootState) => state.user.user);
  console.log("lleva", lleva);
  console.log("user", user);
  const navigate = useNavigate();
  const [aceptarLleva] = useAceptarLlevaMutation();
  const [rechazarLleva] = useRechazarLlevaMutation();
  const [cambiarProveedorRemesa] = useCambiarProveedorRemesaMutation();
  const handleCambiarProveedor = async (email: string) => {
    try {
      const result = await cambiarProveedorRemesa({
        id: Number(lleva.remesaId),
        email,
      }).unwrap();
      toast.success(result.message);
    } catch (err) {
      toast.error("Error cambiando proveedor");
    }
  };

  const handleAceptarLleva = () => {
    try {
      const result: any = aceptarLleva({ llevaId: lleva.id }).unwrap();
      toast.success("Tramo aceptado");
    } catch (error) {
      toast.error("Error al aceptar el tramo");
    }
  };

  const handleRechazarLleva = () => {
    try {
      const result: any = rechazarLleva({ llevaId: lleva.id }).unwrap();
      toast.success("Tramo rechazado");
    } catch (error) {
      toast.error("Error al rechazar el tramo");
    }
  };

  const getBotones = () => {
    switch (lleva.status) {
      case "PENDIENTE":
        return (
          <div className="flex gap-2 flex-wrap">
            <Button size="small" variant="success" onClick={handleAceptarLleva}>
              Aceptar
            </Button>
            <Button size="small" variant="error" onClick={handleRechazarLleva}>
              Rechazar
            </Button>
          </div>
        );

      case "CANCELADA":
        break;
      default:
        return (
          <div className="flex gap-2 flex-wrap">
            <ButtonVisualizacion
              action={() =>
                navigate(`/admin/remesas/${lleva.remesaId}/historial-remesas`)
              }
            />
            {lleva?.onchain.poseedorActual === user?.email && (
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
  return <div>{getBotones()}</div>;
};

export default ActionButtons;
