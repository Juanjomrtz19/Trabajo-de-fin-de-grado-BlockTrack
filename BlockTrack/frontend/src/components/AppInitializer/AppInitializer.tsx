// components/AppInitializer.tsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "../../services/api/userApi";
import { setUser, clearUser } from "../../services/userSlice";

const AppInitializer = () => {
  const dispatch = useDispatch();
  const { data: me, isError, isSuccess } = useGetMeQuery();

  useEffect(() => {
    if (isSuccess && me) {
      dispatch(setUser(me));
    } else if (isError) {
      dispatch(clearUser());
    }
  }, [me, isSuccess, isError, dispatch]);

  return null; // no renderiza nada
};

export default AppInitializer;
