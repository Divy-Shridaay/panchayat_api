import express from "express";
import cors from "cors";
import errorHandler from "./utils/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import registerRoutes from "./routes/register.routes.js";
import pedhinamuRoutes from "./routes/pedhinamu.routes.js";
import cashmelRoutes from "./routes/cashmel.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import bankRoutes from "./routes/bank.routes.js";

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// routes
app.use("/api/auth", authRoutes);

app.use("/api/register", registerRoutes);

app.use("/api/pedhinamu", pedhinamuRoutes);
app.use("/api/cashmel", cashmelRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banks", bankRoutes);
// global error handler
app.use(errorHandler);

export default app;
