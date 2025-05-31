import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import claimRoutes from "./routes/claimRoutes";
import evidenceRoutes from "./routes/evidenceRoutes";
import { initializeDatabase } from "./db/init";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Parse JSON bodies:
app.use(express.json());

// ▶ MOUNT each router under its own path:
app.use("/api/users", userRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/evidence", evidenceRoutes);

// A simple healthcheck:
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: Date.now() });
});

// Global error handler:
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

app.listen(PORT, () => {
  initializeDatabase()
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
