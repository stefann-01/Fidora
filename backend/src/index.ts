import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config(); // loads variables from .env into process.env

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// A simple healthcheck route
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: Date.now() });
});

// (You’ll add more routes below, e.g. to trigger on‐chain calls)

// Global error handler (basic)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong", message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
