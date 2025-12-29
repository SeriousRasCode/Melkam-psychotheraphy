import express from "express";
// We'll import routers and swagger dynamically to catch import-time errors
import * as YAML from "yaml";
import { join } from "path";
import { readFileSync } from "fs"; // Correct import from fs
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const SKIP_IMPORTS = process.env.SKIP_IMPORTS === "true";

const app = express();

// Instrument app.use to log registrations and stack traces to find bad route patterns
{
  const _use = app.use.bind(app) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use = function (...args: any[]) {
    try {
      const paths = args
        .map((a) => (typeof a === "string" ? a : a && a.name ? `<fn:${a.name}>` : typeof a))
        .join(", ");
      console.log("REGISTER ROUTE ->", paths);
      console.trace();
    } catch (e) {
      /* ignore */
    }
    try {
      return _use(...args);
    } catch (err) {
      console.error("Error during app.use:", err instanceof Error ? err.message : err);
      throw err;
    }
  } as any;
}

// Middleware
app.use(express.json());
app.use(cookieParser());

// Debug: log incoming requests and headers (helps diagnose CORS preflight)
app.use((req, res, next) => {
  console.log(`>> ${req.method} ${req.path}`);
  if (Object.keys(req.headers).length) {
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
  }
  next();
});

// CORS: allow the frontend origin to access the API
// CORS: allow the frontend origin to access the API and handle preflight
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    maxAge: 600,
    optionsSuccessStatus: 204,
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

// Swagger UI setup (skippable via SKIP_IMPORTS=true)
if (!SKIP_IMPORTS) {
  try {
    console.log("Loading swagger-ui-express...");
    // Use require to avoid top-level await in CommonJS
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swaggerUi: any = require("swagger-ui-express");
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        customSiteTitle: "Psychotherapy API Docs",
      })
    );
    console.log("Swagger UI middleware applied");
  } catch (err) {
    console.error("Failed to apply Swagger UI middleware:", err instanceof Error ? err.message : err);
  }
} else {
  console.log("SKIP_IMPORTS=true — skipping Swagger UI setup");
}

// Routes
if (!SKIP_IMPORTS) {
  try {
    console.log("Loading user router...");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const userRouterMod: any = require("./router/user.router");
    const userRouter = userRouterMod.default || userRouterMod;
    app.use("/api/v1/users", userRouter);
    console.log("User routes applied");
  } catch (err) {
    console.error("Failed to mount user router:", err instanceof Error ? err.message : err);
  }
} else {
  console.log("SKIP_IMPORTS=true — skipping user router mount");
}

// CORS: allow the frontend origin to access the API and handle preflight
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    maxAge: 600,
    optionsSuccessStatus: 204,
  })
);
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(cookieParser());

// Debug: log incoming requests and headers (helps diagnose CORS preflight)
app.use((req, res, next) => {
  console.log(`>> ${req.method} ${req.path}`);
  if (Object.keys(req.headers).length) {
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
  }
  next();
});
