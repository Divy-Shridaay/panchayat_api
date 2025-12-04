import express from "express";
import cors from "cors";
import errorHandler from "./utils/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import registerRoutes from "./routes/register.routes.js";
import pedhinamuRoutes from "./routes/pedhinamu.routes.js";

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

app.use("/api/register", registerRoutes);

app.use("/api/pedhinamu", pedhinamuRoutes);
// global error handler
app.use(errorHandler);

export default app;
