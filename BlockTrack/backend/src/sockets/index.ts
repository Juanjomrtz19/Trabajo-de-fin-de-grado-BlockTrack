// src/sockets/init.ts
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { useSocketAuth } from "./auth";
import { useSocketAsignaciones } from "./asignacion";

let io: IOServer | null = null;

export function initSocket(server: HTTPServer) {
  io = new IOServer(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  useSocketAuth(io);
  useSocketAsignaciones(io);
}

export function getSocket() {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
}
