// components/AppInitializer.tsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "../../services/api/userApi";
import { setUser, clearUser } from "../../services/userSlice";
import { useNavigate } from "react-router-dom";

const AppInitializer = () => {
  const dispatch = useDispatch();
  const { data: me, isError, isSuccess } = useGetMeQuery();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess && me) {
      dispatch(setUser(me));
      navigate("/admin");
    } else if (isError) {
      dispatch(clearUser());
      navigate("/");
    }
  }, [me, isSuccess, isError, dispatch]);

  return null;
};

export default AppInitializer;
