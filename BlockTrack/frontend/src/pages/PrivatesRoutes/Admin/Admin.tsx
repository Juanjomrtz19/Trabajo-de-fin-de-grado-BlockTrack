import Title from "../../../components/common/Title/Title";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import TextField from "../../../components/common/Inputs/TextField";
import { useEffect, useState } from "react";
import Button from "../../../components/common/Button/Button";
import { motion, AnimatePresence } from "framer-motion";
import {
  useUpdateUserMutation,
  useGetMeQuery,
} from "../../../services/api/userApi";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../../../services/userSlice";
import { useDarDeBajaTransportistaMutation } from "../../../services/api/transportistaApi";
import envioFactory from "../../../../../ethereum/deployments/localhost/EnvioFactory.json";

const Admin = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  const [nombre, setNombre] = useState<string>(user?.nombre ?? "");
  const [apellidos, setApellidos] = useState<string>(user?.apellidos ?? "");
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [telefono, setTelefono] = useState<string>(user?.telefono ?? "");
  const [dni, setDni] = useState<string>(user?.dni ?? "");
  const [cantEdit, setCanEdit] = useState<boolean>(false);

  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [darDeBajaTransportista] = useDarDeBajaTransportistaMutation();
  console.log("EnvioFactory address:", envioFactory.address);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setApellidos(user.apellidos);
      setEmail(user.email);
      setTelefono(user.telefono);
      setDni(user.dni);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await updateUser({
        nombre,
        apellidos,
        email,
        telefono,
        dni,
        rol: user?.rol!,
        id: user?.id!,
      }).unwrap();

      dispatch(setUser(result));
      toast.success("Account updated successfully!");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setCanEdit(false);
    }
  };

  const handleDarDeBaja = async () => {
    try {
      await darDeBajaTransportista({ baja: true }).unwrap();
      toast.success("Transportista dado de baja con éxito");
    } catch (error) {
      toast.error("Error al dar de baja al transportista");
    }
  };

  return (
    <>
      <Title text="Configure your account" />
      <div>
        {user?.rol === "TRANSPORTISTA" && (
          <div className="flex justify-end items-center pr-8">
            <Button
              variant="error"
              mode="light"
              type="button"
              onClick={handleDarDeBaja}
            >
              Dar de baja
            </Button>
          </div>
        )}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl px-4">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-20 w-full"
            >
              <TextField
                label="First Name"
                onChange={(e) => setNombre(e.target.value)}
                value={nombre}
                type="text"
                disabled={!cantEdit}
              />

              <TextField
                label="Last Name"
                onChange={(e) => setApellidos(e.target.value)}
                value={apellidos}
                type="text"
                disabled={!cantEdit}
              />

              <TextField
                label="Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="text"
                disabled={!cantEdit}
              />

              <TextField
                label="Phone"
                onChange={(e) => {
                  const value = e.target.value;
                  setTelefono(value);
                }}
                value={telefono !== null ? telefono : ""}
                type="number"
                disabled={!cantEdit}
              />

              <div className="col-span-1 md:col-span-2">
                <TextField
                  label="DNI"
                  onChange={(e) => {
                    setDni(e.target.value);
                  }}
                  value={dni}
                  type="text"
                  disabled={!cantEdit}
                />
              </div>

              <AnimatePresence mode="wait">
                {!cantEdit ? (
                  <motion.div
                    key="edit-button"
                    className="col-span-1 md:col-span-2 flex justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Button
                      variant="primary"
                      mode="light"
                      type="button"
                      onClick={() => setCanEdit(true)}
                    >
                      Edit
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-actions"
                    className="col-span-1 md:col-span-2 flex justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Button
                      variant="error"
                      mode="light"
                      type="button"
                      onClick={() => setCanEdit(false)}
                    >
                      Cancel
                    </Button>

                    <Button variant="success" mode="light" type="submit">
                      Accept
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
