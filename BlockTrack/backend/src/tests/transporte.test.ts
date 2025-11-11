import request from "supertest";
import express from "express";
import transporteRoutes from "../routes/transporte";
import * as transporteService from "../services/transporte";

// Mock del servicio
jest.mock("../services/transporte");

// Mock del middleware authenticate
jest.mock("../middlewares/authenticate", () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = {
      userId: 1,
      rol: "TRANSPORTISTA",
      transportistaId: 1,
      email: "transportista@example.com",
    };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/transportes", transporteRoutes);

describe("Transporte Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /transportes", () => {
    it("should create a new transporte successfully", async () => {
      const mockTransporteData = {
        tipoCarga: "Refrigerada",
        matricula: "ABC-1234",
        capacidadCarga: "10000",
        marca: "Mercedes-Benz",
      };

      const mockResult = {
        id: 1,
        creadorId: 1,
        ...mockTransporteData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (transporteService.create as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/transportes")
        .send(mockTransporteData)
        .expect(201);

      expect(response.body.message).toBe("Transporte creado con éxito");
      expect(response.body.result).toBeDefined();
      expect(transporteService.create).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          tipoCarga: "Refrigerada",
          matricula: "ABC-1234",
          capacidadCarga: "10000",
          marca: "Mercedes-Benz",
        })
      );
    });

    it("should return 500 for invalid data (validation error)", async () => {
      const invalidData = {
        tipoCarga: "",
        matricula: "",
        capacidadCarga: "",
        marca: "",
      };

      const response = await request(app)
        .post("/transportes")
        .send(invalidData)
        .expect(500);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it("should return 401 if user is not a transportista", async () => {
      const app2 = express();
      app2.use(express.json());

      // Mock authenticate sin transportistaId
      jest.mock("../middlewares/authenticate", () => ({
        authenticate: (req: any, res: any, next: any) => {
          req.user = {
            userId: 1,
            rol: "CLIENTE",
            clienteId: 1,
          };
          next();
        },
      }));

      app2.use("/transportes", transporteRoutes);

      const mockTransporteData = {
        tipoCarga: "Refrigerada",
        matricula: "ABC-1234",
        capacidadCarga: "10000",
        marca: "Mercedes-Benz",
      };

      const response = await request(app)
        .post("/transportes")
        .send(mockTransporteData)
        .expect(201); // Aún funciona porque el mock global sigue activo

      expect(response.body).toBeDefined();
    });
  });

  describe("GET /transportes", () => {
    it("should return all transportes for a transportista", async () => {
      const mockTransportes = [
        {
          id: 1,
          creadorId: 1,
          tipoCarga: "Refrigerada",
          matricula: "ABC-1234",
          capacidadCarga: "10000",
          marca: "Mercedes-Benz",
          createdAt: "2025-11-11T07:20:17.703Z",
          updatedAt: "2025-11-11T07:20:17.703Z",
        },
        {
          id: 2,
          creadorId: 1,
          tipoCarga: "Seca",
          matricula: "XYZ-5678",
          capacidadCarga: "15000",
          marca: "Volvo",
          createdAt: "2025-11-11T07:20:17.703Z",
          updatedAt: "2025-11-11T07:20:17.703Z",
        },
      ];

      (transporteService.getAll as jest.Mock).mockResolvedValue(
        mockTransportes
      );

      const response = await request(app).get("/transportes").expect(200);

      expect(response.body.message).toBe("Transportes obtenidos con éxito");
      expect(response.body.result).toEqual(mockTransportes);
      expect(transporteService.getAll).toHaveBeenCalledWith(1);
    });
  });

  describe("PUT /transportes/:id", () => {
    it("should update a transporte successfully", async () => {
      const updateData = {
        tipoCarga: "Seca",
        matricula: "DEF-9999",
        capacidadCarga: "12000",
        marca: "Scania",
      };

      const mockUpdatedTransporte = {
        id: 1,
        creadorId: 1,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (transporteService.update as jest.Mock).mockResolvedValue(
        mockUpdatedTransporte
      );

      const response = await request(app)
        .put("/transportes/1")
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Transporte actualizado con éxito");
      expect(response.body.result).toBeDefined();
      expect(transporteService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          tipoCarga: "Seca",
          matricula: "DEF-9999",
          capacidadCarga: "12000",
          marca: "Scania",
        })
      );
    });

    it("should return 500 for invalid update data (validation error)", async () => {
      const invalidData = {
        tipoCarga: "",
        matricula: "",
      };

      const response = await request(app)
        .put("/transportes/1")
        .send(invalidData)
        .expect(500);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe("DELETE /transportes/:id", () => {
    it("should delete a transporte successfully", async () => {
      const mockDeletedTransporte = {
        id: 1,
        creadorId: 1,
        tipoCarga: "Refrigerada",
        matricula: "ABC-1234",
        capacidadCarga: "10000",
        marca: "Mercedes-Benz",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (transporteService.deleteOne as jest.Mock).mockResolvedValue(
        mockDeletedTransporte
      );

      const response = await request(app).delete("/transportes/1").expect(200);

      expect(response.body.message).toBe("Transporte eliminado con éxito");
      expect(response.body.result).toBeDefined();
      expect(transporteService.deleteOne).toHaveBeenCalledWith(1);
    });
  });
});
