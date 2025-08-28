import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user";
import remesaRoutes from "./routes/remesa";
import transportistaRoutes from "./routes/transportista";
import transporteRoutes from "./routes/transporte";
import conduceRoutes from "./routes/conduce";

import cookieParser from "cookie-parser";

const app: Application = express();

dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());

app.use("/users", userRoutes);
app.use("/remesas", remesaRoutes);
app.use("/transportistas", transportistaRoutes);
app.use("/transportes", transporteRoutes);
app.use("/conduce", conduceRoutes);

// Middlewares

app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
