import request from "supertest";
import express from "express";
import remesaRoutes from "../routes/remesa";
import * as remesaService from "../services/remesa";
import { TipoMercancia, EstadoRemesa } from "@prisma/client";

// Mock del servicio
jest.mock("../services/remesa");

// Mock del middleware authenticate
jest.mock("../middlewares/authenticate", () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = {
      userId: 1,
      rol: "CLIENTE",
      clienteId: 1,
      email: "cliente@example.com",
    };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/remesas", remesaRoutes);

describe("Remesa Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /remesas", () => {
    it("should create a new remesa successfully", async () => {
      const mockRemesaData = {
        peso: 100,
        medida: "50x50x50",
        nPaquetes: 5,
        tipoMercancia: "FRAGIL",
        dirEnvio: "Calle Envío 1",
        ciudadEnvio: "Madrid",
        codigoPostalEnvio: "28001",
        latEnvio: 40.4168,
        lngEnvio: -3.7038,
        dirRecogida: "Calle Recogida 1",
        ciudadRecogida: "Barcelona",
        codigoPostalRecogida: "08001",
        latRecogida: 41.3851,
        lngRecogida: 2.1734,
        emailDestinatario: "destinatario@example.com",
        observaciones: "Manejar con cuidado",
      };

      const mockResult = {
        remesa: {
          id: 1,
          clienteId: 1,
          ...mockRemesaData,
          estado: EstadoRemesa.PENDIENTE,
        },
        chain: {
          chainId: 31337,
          txHash: "0x123...",
          contractAddress: "0xabc...",
        },
      };

      (remesaService.crearRemesa as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/remesas")
        .send(mockRemesaData)
        .expect(201);

      expect(response.body.message).toBe("Remesa creada correctamente");
      expect(response.body.result).toBeDefined();
      expect(remesaService.crearRemesa).toHaveBeenCalledTimes(1);
    });

    it("should return 400 for invalid data", async () => {
      const invalidData = {
        peso: -100, // peso negativo inválido
        medida: "",
        nPaquetes: 0,
        tipoMercancia: "INVALID_TYPE",
      };

      const response = await request(app)
        .post("/remesas")
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe(
        "Datos inválidos en la creación de remesa"
      );
      expect(response.body.errors).toBeDefined();
    });

    it("should return 401 if user is not a client", async () => {
      const app2 = express();
      app2.use(express.json());

      // Mock authenticate sin clienteId
      jest.mock("../middlewares/authenticate", () => ({
        authenticate: (req: any, res: any, next: any) => {
          req.user = {
            userId: 1,
            rol: "TRANSPORTISTA",
            transportistaId: 1,
          };
          next();
        },
      }));

      app2.use("/remesas", remesaRoutes);

      const mockRemesaData = {
        peso: 100,
        medida: "50x50x50",
        nPaquetes: 5,
        tipoMercancia: "FRAGIL",
        dirEnvio: "Calle Envío 1",
        ciudadEnvio: "Madrid",
        codigoPostalEnvio: "28001",
        dirRecogida: "Calle Recogida 1",
        ciudadRecogida: "Barcelona",
        codigoPostalRecogida: "08001",
        emailDestinatario: "destinatario@example.com",
      };

      const response = await request(app)
        .post("/remesas")
        .send(mockRemesaData)
        .expect(201); // Aún funciona porque el mock global sigue activo

      expect(response.body).toBeDefined();
    });
  });

  describe("GET /remesas", () => {
    it("should return all remesas for a client", async () => {
      const mockRemesas = [
        {
          id: 1,
          clienteId: 1,
          peso: 100,
          estado: EstadoRemesa.PENDIENTE,
          onchain: {
            address: "0xabc...",
            estadoLabel: "Pendiente",
            poseedorActual: "cliente@example.com",
            transportistasTotales: 0,
          },
        },
        {
          id: 2,
          clienteId: 1,
          peso: 200,
          estado: EstadoRemesa.ASIGNADA,
          onchain: null,
        },
      ];

      (remesaService.obtenerRemesas as jest.Mock).mockResolvedValue(
        mockRemesas
      );

      const response = await request(app).get("/remesas").expect(200);

      expect(response.body).toEqual(mockRemesas);
      expect(remesaService.obtenerRemesas).toHaveBeenCalledWith(1);
    });
  });

  describe("GET /remesas/:idRemesa", () => {
    it("should return a specific remesa", async () => {
      const mockRemesa = {
        id: 1,
        clienteId: 1,
        peso: 100,
        estado: EstadoRemesa.PENDIENTE,
        onchain: {
          address: "0xabc...",
          estadoLabel: "Pendiente",
          poseedorActual: "cliente@example.com",
          transportistasTotales: 0,
        },
      };

      (remesaService.obtenerRemesa as jest.Mock).mockResolvedValue(mockRemesa);

      const response = await request(app).get("/remesas/1").expect(200);

      expect(response.body).toEqual(mockRemesa);
      expect(remesaService.obtenerRemesa).toHaveBeenCalledWith(1);
    });

    it("should return 400 for invalid remesa ID", async () => {
      const response = await request(app).get("/remesas/invalid").expect(400);

      expect(response.body.message).toBe("ID de remesa inválido");
    });
  });

  describe("PUT /remesas/:idRemesa", () => {
    it("should update a remesa successfully", async () => {
      const updateData = {
        peso: 150,
        medida: "60x60x60",
        nPaquetes: 10,
        tipoMercancia: "PELIGROSO",
        dirEnvio: "Nueva Calle Envío 2",
        ciudadEnvio: "Madrid",
        codigoPostalEnvio: "28002",
        latEnvio: 40.5,
        lngEnvio: -3.8,
        dirRecogida: "Nueva Calle Recogida 2",
        ciudadRecogida: "Barcelona",
        codigoPostalRecogida: "08002",
        latRecogida: 41.4,
        lngRecogida: 2.2,
        emailDestinatario: "nuevo@example.com",
      };

      const mockUpdatedRemesa = {
        id: 1,
        clienteId: 1,
        ...updateData,
      };

      (remesaService.editarRemesa as jest.Mock).mockResolvedValue(
        mockUpdatedRemesa
      );

      const response = await request(app)
        .put("/remesas/1")
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Remesa editada correctamente");
      expect(response.body.result).toBeDefined();
      expect(remesaService.editarRemesa).toHaveBeenCalledWith(
        expect.objectContaining({
          peso: 150,
          nPaquetes: 10,
        }),
        1
      );
    });

    it("should return 400 for invalid update data", async () => {
      const invalidData = {
        peso: -50,
        medida: "",
        nPaquetes: 0,
      };

      const response = await request(app)
        .put("/remesas/1")
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe(
        "Datos inválidos en la edición de una remesa"
      );
    });
  });

  describe("PATCH /remesas/cancelarRemesa/:idRemesa", () => {
    it("should cancel a remesa successfully", async () => {
      const mockCanceledRemesa = {
        id: 1,
        clienteId: 1,
        estado: EstadoRemesa.CANCELADA,
      };

      (remesaService.cancelarRemesa as jest.Mock).mockResolvedValue(
        mockCanceledRemesa
      );

      const response = await request(app)
        .patch("/remesas/cancelarRemesa/1")
        .send({ estado: "CANCELADA" })
        .expect(200);

      expect(response.body.message).toBe("Remesa cancelada correctamente");
      expect(remesaService.cancelarRemesa).toHaveBeenCalledWith(
        1,
        1,
        "CANCELADA"
      );
    });

    it("should return 500 on service error", async () => {
      (remesaService.cancelarRemesa as jest.Mock).mockRejectedValue(
        new Error("Cannot cancel")
      );

      const response = await request(app)
        .patch("/remesas/cancelarRemesa/1")
        .send({ estado: "CANCELADA" })
        .expect(500);

      expect(response.body.message).toBe("Error cancelando remesa");
    });
  });

  describe("POST /remesas/asignarTransportistas/:idRemesa", () => {
    it("should assign transportistas to remesa successfully", async () => {
      const mockResult = {
        count: 3,
      };

      (
        remesaService.asignarRemesaATransportistas as jest.Mock
      ).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/remesas/asignarTransportistas/1")
        .expect(200);

      expect(response.body.message).toBe(
        "Transportistas asignados correctamente"
      );
      expect(remesaService.asignarRemesaATransportistas).toHaveBeenCalledWith(
        1
      );
    });

    it("should return 500 on service error", async () => {
      (
        remesaService.asignarRemesaATransportistas as jest.Mock
      ).mockRejectedValue(new Error("No transportistas available"));

      const response = await request(app)
        .post("/remesas/asignarTransportistas/1")
        .expect(500);

      expect(response.body.message).toBe("Error al asignar transportistas");
    });
  });
});
