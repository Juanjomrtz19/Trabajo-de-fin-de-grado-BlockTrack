import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "../routes/user";
import * as userService from "../services/user";
import { Rol } from "@prisma/client";

// Mock de los servicios
jest.mock("../services/user");
jest.mock("../middlewares/authenticate", () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 1, rol: "CLIENTE" };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/users", userRoutes);

describe("User Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /users/register", () => {
    it("should register a new client user successfully", async () => {
      const mockUser = {
        dni: "12345678A",
        nombre: "Juan",
        apellidos: "Pérez",
        email: "juan@example.com",
        telefono: "600000000",
        contrasenia: "password123",
        rol: "CLIENTE",
        direccionPrincipal: "Calle Principal 123",
        direccionPrincipalCP: 28001,
        direccionPrincipalCiudad: "Madrid",
        direccionPrincipalLat: 40.4168,
        direccionPrincipalLon: -3.7038,
      };

      (userService.registerUser as jest.Mock).mockResolvedValue({
        message: "User registered successfully",
        wallet: {
          index: 0,
          address: "0x1234567890abcdef",
        },
      });

      const response = await request(app)
        .post("/users/register")
        .send(mockUser)
        .expect(201);

      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.wallet).toBeDefined();
      expect(userService.registerUser).toHaveBeenCalledTimes(1);
    });

    it("should register a new transporter user successfully", async () => {
      const mockUser = {
        dni: "87654321B",
        nombre: "María",
        apellidos: "García",
        email: "maria@example.com",
        telefono: "611111111",
        contrasenia: "password456",
        rol: "TRANSPORTISTA",
        zonaOperativa: "Madrid Centro",
        zonaOperativaCP: 28013,
        zonaOperativaCiudad: "Madrid",
        zonaOperativaLat: 40.4,
        zonaOperativaLon: -3.7,
      };

      (userService.registerUser as jest.Mock).mockResolvedValue({
        message: "User registered successfully",
        wallet: {
          index: 1,
          address: "0xabcdef1234567890",
        },
      });

      const response = await request(app)
        .post("/users/register")
        .send(mockUser)
        .expect(201);

      expect(response.body.message).toBe("User registered successfully");
      expect(userService.registerUser).toHaveBeenCalledTimes(1);
    });

    it("should return 400 for invalid data", async () => {
      const invalidUser = {
        email: "invalid-email",
        // faltan campos requeridos
      };

      const response = await request(app)
        .post("/users/register")
        .send(invalidUser)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it("should return 500 on service error", async () => {
      (userService.registerUser as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const mockUser = {
        dni: "12345678A",
        nombre: "Juan",
        apellidos: "Pérez",
        email: "juan@example.com",
        telefono: "600000000",
        contrasenia: "password123",
        rol: "CLIENTE",
        direccionPrincipal: "Calle Principal 123",
      };

      const response = await request(app)
        .post("/users/register")
        .send(mockUser)
        .expect(500);

      expect(response.body.message).toBe("Error registering user");
    });
  });

  describe("POST /users/login", () => {
    it("should login user successfully and set cookie", async () => {
      const mockToken = "mock-jwt-token-12345";

      (userService.loginUser as jest.Mock).mockResolvedValue(mockToken);

      const credentials = {
        email: "juan@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/users/login")
        .send(credentials)
        .expect(200);

      expect(response.body.message).toBe("Login successful");
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(userService.loginUser).toHaveBeenCalledWith(
        credentials.email,
        credentials.password
      );
    });

    it("should return 401 for invalid credentials", async () => {
      (userService.loginUser as jest.Mock).mockRejectedValue(
        new Error("Credenciales inválidas")
      );

      const credentials = {
        email: "wrong@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/users/login")
        .send(credentials)
        .expect(401);

      expect(response.body.message).toBe("There was something wrong");
    });

    it("should return 401 when user not found", async () => {
      (userService.loginUser as jest.Mock).mockRejectedValue(
        new Error("Usuario no encontrado")
      );

      const credentials = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      await request(app).post("/users/login").send(credentials).expect(401);
    });
  });

  describe("POST /users/logout", () => {
    it("should logout user and clear cookie", async () => {
      const response = await request(app).post("/users/logout").expect(200);

      expect(response.body.message).toBe("Logout successful");
      expect(response.headers["set-cookie"]).toBeDefined();
      // Verificar que la cookie se elimina
      const setCookieHeader = response.headers["set-cookie"];
      expect(setCookieHeader[0]).toContain("token=;");
    });
  });

  describe("GET /users/me", () => {
    it("should return current user data", async () => {
      const mockUser = {
        id: 1,
        dni: "12345678A",
        nombre: "Juan",
        apellidos: "Pérez",
        email: "juan@example.com",
        telefono: "600000000",
        rol: "CLIENTE" as Rol,
        clienteId: 1,
        transportistaId: null,
      };

      (userService.verifyToken as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get("/users/me")
        .set("Cookie", ["token=valid-token"])
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe("juan@example.com");
    });

    it("should return 401 when no token provided", async () => {
      const response = await request(app).get("/users/me").expect(401);

      expect(response.body.message).toBe("Unauthorized");
    });
  });

  describe("PUT /users/updateUser", () => {
    it("should update user successfully", async () => {
      const updatedUser = {
        id: 1,
        dni: "12345678A",
        nombre: "Juan Actualizado",
        apellidos: "Pérez García",
        email: "juan.nuevo@example.com",
        telefono: "611111111",
        rol: "CLIENTE" as Rol,
      };

      (userService.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      const updateData = {
        dni: "12345678A",
        nombre: "Juan Actualizado",
        apellidos: "Pérez García",
        email: "juan.nuevo@example.com",
        telefono: "611111111",
        rol: "CLIENTE",
      };

      const response = await request(app)
        .put("/users/updateUser")
        .send(updateData)
        .expect(200);

      expect(response.body.nombre).toBe("Juan Actualizado");
      expect(userService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          dni: updateData.dni,
          nombre: updateData.nombre,
          apellidos: updateData.apellidos,
          email: updateData.email,
          telefono: updateData.telefono,
          rol: updateData.rol,
          id: 1, // del mock de authenticate
        })
      );
    });

    it("should return 500 on update error", async () => {
      (userService.updateUser as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const updateData = {
        dni: "12345678A",
        nombre: "Juan",
        apellidos: "Pérez",
        email: "juan@example.com",
        telefono: "600000000",
        rol: "CLIENTE",
      };

      const response = await request(app)
        .put("/users/updateUser")
        .send(updateData)
        .expect(500);

      expect(response.body.message).toBe("Error updating user");
    });
  });
});
