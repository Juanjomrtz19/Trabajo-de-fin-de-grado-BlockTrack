import Button from "../../../../components/common/Button/Button";
import { LLeva } from "../../../../types/lleva";
import { ButtonVisualizacion } from "../../Remesa/components/Buttons";
import { useNavigate } from "react-router-dom";

const ActionButtons = ({ lleva }: { lleva: LLeva }) => {
  const navigate = useNavigate();

  const getBotones = () => {
    switch (lleva.status) {
      case "PENDIENTE":
        return (
          <div className="flex gap-2 flex-wrap">
            <Button size="small" variant="success">
              Aceptar
            </Button>
            <Button size="small" variant="error">
              Rechazar
            </Button>
          </div>
        );

      default:
        return (
          <ButtonVisualizacion
            action={() =>
              navigate(`/admin/remesas/${lleva.id}/historial-remesas`)
            }
          />
        );
    }
  };
  return <div>{getBotones()}</div>;
};

export default ActionButtons;
