import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user";

const app: Application = express();

dotenv.config();

app.use(express.json());

app.use("/users", userRoutes);

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
