import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

type Rol = "CLIENTE" | "TRANSPORTISTA";

export default function RequireRole({
  allowed,
  fallback = "/unauthorized",
}: {
  allowed: Rol[];
  fallback?: string;
}) {
  const location = useLocation();
  const user = useSelector(
    (s: RootState) => (s as any).user?.user ?? (s as any).user
  );

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!allowed.includes(user.rol as Rol))
    return <Navigate to={fallback} replace />;
  return <Outlet />;
}
