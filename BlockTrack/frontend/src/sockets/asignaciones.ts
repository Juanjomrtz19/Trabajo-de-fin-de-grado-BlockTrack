import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
let socket: Socket | null = null;

export function getAsignacionesSocket() {
  if (!socket) {
    socket = io(`${URL}/asignaciones`, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
}
