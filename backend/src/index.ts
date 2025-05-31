import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { initializeDatabase } from "./db/init";
import claimRoutes from "./routes/claimRoutes";
import evidenceRoutes from "./routes/evidenceRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 6900;

// ▶ CORS must be configured BEFORE other middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

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
