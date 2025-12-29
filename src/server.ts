import express from "express";
import userRouter from "./router/user.router";
import swaggerUi from "swagger-ui-express";
import * as YAML from "yaml";
import { join } from "path";
import { readFileSync } from "fs"; // Correct import from fs
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS: allow the frontend origin to access the API
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.options("*", cors());

// Load Swagger document with error handling
let swaggerDocument;
try {
  const swaggerPath = join(__dirname, "docs", "swagger.yaml");
  console.log("Attempting to load Swagger file from:", swaggerPath);
  const swaggerFile = readFileSync(swaggerPath, "utf8");
  swaggerDocument = YAML.parse(swaggerFile);
  console.log("Swagger document loaded successfully");
} catch (error: unknown) {
  console.error(
    "Error loading Swagger file:",
    error instanceof Error ? error.message : "Unknown error"
  );
  swaggerDocument = {
    openapi: "3.0.0",
    info: { title: "Error", version: "1.0.0" },
    paths: {},
  }; // Fallback
}

// Swagger UI setup
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "Psychotherapy API Docs",
  })
);
console.log("Swagger UI middleware applied");

// Routes
app.use("/api/v1/users", userRouter);
console.log("User routes applied");

// Server
const PORT = process.env.PORT || 7712;
app.listen(PORT, () => {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "Africa/Addis_Ababa",
  });
  console.log(`Server running on port ${PORT} at ${now}`);
  console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});

export { app };
