import { Server, Socket } from "socket.io";
import prisma from "../config/prisma";

export function useSocketAsignaciones(io: Server) {
  const nsp = io.of("/asignaciones");
  nsp.on("connection", (socket: Socket) => {
    console.log("Nuevo cliente conectado al namespace /asignaciones");
    const transportista = socket.data.user as {
      transportistaId: number;
      rol: string;
    };
    const room = `transportista:${transportista.transportistaId}`;
    socket.join(room);
    socket.on("asignaciones:pendientes", async () => {
      const count = await prisma.lleva.count({
        where: {
          status: "PENDIENTE",
          conduce: { transportistaId: transportista.transportistaId },
        },
      });

      socket.emit("asignaciones:pendientes", count);
    });
  });
}
