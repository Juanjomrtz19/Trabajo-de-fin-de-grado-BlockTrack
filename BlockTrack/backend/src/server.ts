import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user";
import remesaRoutes from "./routes/remesa";
import transportistaRoutes from "./routes/transportista";
import transporteRoutes from "./routes/transporte";
import conduceRoutes from "./routes/conduce";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./sockets";
import helmet from "helmet";
import xss from "xss";

const app: Application = express();
dotenv.config();

app.use(
  helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: "no-referrer" },
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json({ type: "application/json" }));

app.use((req, res, next) => {
  res.type("application/json");
  next();
});

app.use((req, _res, next) => {
  const cleanse = (v: any): any => {
    if (typeof v === "string") return xss(v);
    if (Array.isArray(v)) return v.map(cleanse);
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) v[k] = cleanse(v[k]);
    }
    return v;
  };
  if (req.body) req.body = cleanse(req.body);
  if (req.query) {
    const q = req.query as any;
    for (const k of Object.keys(q)) {
      q[k] = cleanse(q[k]);
    }
  }

  next();
});

app.use("/users", userRoutes);
app.use("/remesas", remesaRoutes);
app.use("/transportistas", transportistaRoutes);
app.use("/transportes", transporteRoutes);
app.use("/conduce", conduceRoutes);

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor y websocket escuchando en el puerto ${PORT}`);
});
