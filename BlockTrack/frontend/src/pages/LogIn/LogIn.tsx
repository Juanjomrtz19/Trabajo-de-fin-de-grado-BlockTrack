import { useState } from "react";
import TextField from "../../components/common/Inputs/TextField";
import {
  useLazyGetMeQuery,
  useLoginUserMutation,
} from "../../services/api/userApi";
import toast from "react-hot-toast";
import Button from "../../components/common/Button/Button";
import { setUser } from "../../services/userSlice";
import { useDispatch } from "react-redux";

import type { User } from "../../types/User";
import { useNavigate } from "react-router-dom";

const LogIn = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [getMe] = useLazyGetMeQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userData = {
      email: email,
      password: password,
    };

    try {
      const result = await loginUser(userData).unwrap();
      const me: User = await getMe().unwrap();
      dispatch(setUser(me));
      navigate("/admin");
      toast.success(result?.message);
    } catch (err: any) {
      console.log("err", err);

      toast.error(err.data.message);
    }
  };

  return (
    <div className="relative h-screen w-full bg-[url('/landing.png')] bg-cover bg-center justify-center items-center">
      <div className="absolute inset-0 bg-background-dark/50"></div>
      <form
        onSubmit={handleSubmit}
        className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background-light/90 p-8 rounded shadow-md border-border-light/30"
      >
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-center">
          <Button
            variant="primary"
            mode="light"
            type="submit"
            disabled={email === "" || password === ""}
          >
            Log In
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LogIn;
