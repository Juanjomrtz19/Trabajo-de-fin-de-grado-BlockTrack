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

const Admin = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState<string>(user?.firstName ?? "");
  const [lastName, setLastName] = useState<string>(user?.lastName ?? "");
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [phone, setPhone] = useState<string>(user?.phone ?? "");
  const [dni, setDni] = useState<string>(user?.dni ?? "");
  const [cantEdit, setCanEdit] = useState<boolean>(false);

  const [updateUser, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setFirstName(user.name);
      setLastName(user.lastName);
      setEmail(user.email);
      setPhone(user.phone);
      setDni(user.dni);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await updateUser({
        name: firstName,
        lastName,
        email,
        phone,
        dni,
        role: user?.role!,
        id: user?.id!,
      }).unwrap();

      dispatch(setUser(result));
      toast.success("Account created!");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setCanEdit(false);
    }
  };

  return (
    <>
      <Title text="Configure your profile" />

      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl px-4">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-20 w-full"
          >
            <TextField
              label="First Name"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              type="text"
              disabled={!cantEdit}
            />

            <TextField
              label="Last Name"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
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
                setPhone(value);
              }}
              value={phone !== null ? phone : ""}
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
    </>
  );
};

export default Admin;
