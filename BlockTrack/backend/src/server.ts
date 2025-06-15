import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

// Configuración de dotenv
dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req: Request, res: Response) => {
  res.send("Backend funcionando con TypeScript 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
