import express, { type Express } from "express";
import cors from "cors";
import type { Server as SocketIOServer } from "socket.io";
import { createDashboardRouter } from "./routes/dashboard";
import { createEventsRouter } from "./routes/events";
import { createStatusRouter } from "./routes/status";
import { createAuthRouter } from "./routes/auth";

export function configureApp(app: Express, io: SocketIOServer): void {
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  app.get("/", (_req, res) => {
    res.send("SafeWatch Backend is running!");
  });

  app.use("/api/events", createEventsRouter(io));
  app.use("/api/dashboard", createDashboardRouter());
  app.use("/api/status", createStatusRouter(io));
  app.use("/oauth2", createAuthRouter());
}