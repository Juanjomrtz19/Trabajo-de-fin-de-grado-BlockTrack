// src/sockets/auth.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

export function useSocketAuth(io: Server) {
  const authMw = (socket: Socket, next: any) => {
    try {
      const cookie = socket.handshake.headers.cookie || "";
      const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
      const token = match ? decodeURIComponent(match[1]) : null;
      if (!token) return next(new Error("Not authenticated"));

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      if (decoded.rol !== "TRANSPORTISTA") {
        return next(new Error("Forbidden: role not allowed"));
      }

      socket.data.user = decoded;
      return next();
    } catch {
      return next(new Error("Invalid token"));
    }
  };

  io.use(authMw);
  io.of("/asignaciones").use(authMw);
}
