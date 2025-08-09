import TextField from "../../../components/common/Inputs/TextField";
import { useRegisterUserMutation } from "../../../services/api/userApi";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../app/store";
import {
  setApellidos,
  setConfirmarContrasenia,
  setContrasenia,
  setDni,
  setEmail,
  setNombre,
  setTelefono,
} from "../../../services/registerSlice";

const UsuarioGeneral = () => {
  const {
    nombre,
    apellidos,
    dni,
    email,
    telefono,
    contrasenia,
    confirmarContrasenia,
  } = useSelector((state: RootState) => state.register);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [registerUser, { isLoading }] = useRegisterUserMutation();

  return (
    <>
      <form className="grid grid-cols-2 gap-4">
        <TextField
          label="First Name"
          onChange={(e) => dispatch(setNombre({ nombre: e.target.value }))}
          value={nombre}
          type="text"
        />

        <TextField
          label="Last Name"
          onChange={(e) =>
            dispatch(setApellidos({ apellidos: e.target.value }))
          }
          value={apellidos}
          type="text"
        />

        <TextField
          label="Email"
          onChange={(e) => dispatch(setEmail({ email: e.target.value }))}
          value={email}
          type="text"
        />

        <TextField
          label="Phone"
          onChange={(e) => {
            dispatch(setTelefono({ telefono: e.target.value }));
          }}
          value={telefono !== null ? telefono : ""}
          type="number"
        />

        <div className="col-span-2">
          <TextField
            label="DNI"
            onChange={(e) => {
              dispatch(setDni({ dni: e.target.value }));
            }}
            value={dni}
            type="text"
          />
        </div>
        <TextField
          label="Password"
          onChange={(e) =>
            dispatch(setContrasenia({ contrasenia: e.target.value }))
          }
          value={contrasenia}
          type="password"
        />

        <TextField
          label="Repeat password"
          onChange={(e) =>
            dispatch(
              setConfirmarContrasenia({ confirmarContrasenia: e.target.value })
            )
          }
          value={confirmarContrasenia}
          type="password"
          className="mb-5"
        />
      </form>
    </>
  );
};

export default UsuarioGeneral;
