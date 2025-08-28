import Button from "../../../../components/common/Button/Button";

export const ButtonEditar = ({ accion }: any) => {
  return (
    <Button variant="primary" onClick={accion} size="small">
      Editar
    </Button>
  );
};

export const ButtonCancelar = ({ action }: any) => {
  return (
    <Button variant="error" onClick={action} size="small">
      Cancelar
    </Button>
  );
};

export const ButtonAsignar = ({ action }: any) => {
  return (
    <Button variant="success" onClick={action} size="small">
      Asignar
    </Button>
  );
};

export const ButtonVisualizacion = ({ action }: any) => {
  return (
    <Button variant="accent" onClick={action} size="small">
      Historial
    </Button>
  );
};
