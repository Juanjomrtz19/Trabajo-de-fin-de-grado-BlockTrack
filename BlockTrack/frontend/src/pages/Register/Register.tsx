import { useState } from "react";
import Button from "../../components/common/Button/Button";
import SelectField from "../../components/common/Inputs/SelectField";
import TextField from "../../components/common/Inputs/TextField";
import {
  DNI_REGEX,
  EMAIL_REGEX,
  PASSWORD_REGEX,
  PHONE_REGEX,
} from "../../utils/regex";
import { useRegisterUserMutation } from "../../services/api/userApi";
import toast from "react-hot-toast";
import type { RegisterUserPayload, UserRole } from "../../types/User";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<number | null>(null);
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [role, setRole] = useState<UserRole | "">("");
  const [dni, setDni] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    repeatPassword: "",
    dni: "",
    role: "",
  });
  const navigate = useNavigate();

  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const handleErrors = () => {
    const newErrors: Record<string, string> = {};

    if (firstName.trim() === "") {
      newErrors.firstName = "First Name cannot be empty";
    }

    if (lastName.trim() === "") {
      newErrors.lastName = "Last Name cannot be empty";
    }

    if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!PHONE_REGEX.test(phone !== null ? String(phone) : "")) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!DNI_REGEX.test(dni)) {
      newErrors.dni = "Please enter a valid phone dni";
    }

    if (!PASSWORD_REGEX.test(password)) {
      newErrors.password = "Password must be 8+ chars, 1 letter & 1 number";
    }

    if (password !== repeatPassword) {
      newErrors.repeatPassword = "Passwords do not match";
    }

    if (role.trim() === "") newErrors.role = "Role cannot be empty";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const isValid = handleErrors();
    if (!isValid) return;

    const body: RegisterUserPayload = {
      firstName,
      lastName,
      email,
      phone: phone ?? 0,
      password,
      role: role as UserRole,
      dni,
    };

    try {
      await registerUser(body).unwrap();
      toast.success("Account created!");
    } catch (err) {
      console.log("entro en el error");
      toast.error("Something went wrong");
    } finally {
      navigate("/login");
    }
  };

  return (
    <>
      <div className="relative h-screen w-full bg-[url('/landing.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-background-dark/50"></div>
        <form
          onSubmit={handleSubmit}
          className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
  bg-background-light/90 p-8 rounded shadow-2xl border border-border-light/30
  grid grid-cols-2 gap-4"
        >
          <TextField
            label="First Name"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            type="text"
            errorMessage={errors.firstName}
          />

          <TextField
            label="Last Name"
            onChange={(e) => setLastName(e.target.value)}
            value={lastName}
            type="text"
            errorMessage={errors.lastName}
          />

          <TextField
            label="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="text"
            errorMessage={errors.email}
          />

          <TextField
            label="Phone"
            onChange={(e) => {
              const value = e.target.value;
              setPhone(value === "" ? null : Number(value));
            }}
            value={phone !== null ? phone : ""}
            type="number"
            errorMessage={errors.phone}
          />

          <div className="col-span-2">
            <TextField
              label="DNI"
              onChange={(e) => {
                setDni(e.target.value);
              }}
              value={dni}
              type="text"
              errorMessage={errors.dni}
            />
          </div>
          <TextField
            label="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            errorMessage={errors.password}
          />

          <TextField
            label="Repeat password"
            onChange={(e) => setRepeatPassword(e.target.value)}
            value={repeatPassword}
            type="password"
            errorMessage={errors.repeatPassword}
            className="mb-5"
          />

          <div className="col-span-2">
            <SelectField
              options={[
                { label: "Receiver", value: "RECEIVER" },
                { label: "Sender", value: "SENDER" },
              ]}
              label="Role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "" | UserRole)}
              errorMessage={errors.role}
            />
          </div>

          <div className="col-span-2 flex justify-center items-center w-full ">
            <Button variant="primary" mode="light" type="submit">
              Log Up
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Register;
