import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../app/store";
import {
  setDireccionPrincipal,
  setZonaOperativa,
} from "../../../services/registerSlice";
import TextField from "../../../components/common/Inputs/TextField";

const UsuarioEspecifico = () => {
  const { direccionPrincipal, zonaOperativa, rol } = useSelector(
    (state: RootState) => state.register
  );
  const dispatch = useDispatch();

  return (
    <form className="grid">
      {rol === "TRANSPORTISTA" ? (
        <TextField
          label="Zona operativa"
          onChange={(e) =>
            dispatch(setZonaOperativa({ zonaOperativa: e.target.value }))
          }
          value={zonaOperativa ?? ""}
          type="text"
        />
      ) : (
        <TextField
          label="Direccion principal"
          onChange={(e) =>
            dispatch(
              setDireccionPrincipal({ direccionPrincipal: e.target.value })
            )
          }
          value={direccionPrincipal ?? ""}
          type="text"
        />
      )}
    </form>
  );
};

export default UsuarioEspecifico;
