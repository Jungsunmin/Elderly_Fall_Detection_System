import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { PrismaClient } from "@prisma/client";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const DANGER_MS = 10 * 60 * 1000; // 10분

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (_req, res) => {
  res.send("SafeWatch Backend is running!");
});

/**
 * AI-worker -> 낙상 이벤트 수신
 * body: { status: "FALL" | "STILL", image?: string, confidence?: number, userId?: number }
 */
app.post("/api/events/detect", async (req, res) => {
  try {
    const { status, image, confidence, userId } = req.body as {
      status?: string;
      image?: string;
      confidence?: number;
      userId?: number;
    };

    if (!status || (status !== "FALL" && status !== "STILL")) {
      return res.status(400).json({ error: "status는 FALL 또는 STILL 이어야 합니다." });
    }

    const event = await prisma.fallEvent.create({
      data: {
        status,
        imageUrl: image ?? null,
        confidence: typeof confidence === "number" ? confidence : null,
        userId: typeof userId === "number" ? userId : null,
      },
    });

    // 프론트로 실시간 전송
    io.emit("FALL_DETECTED", {
      id: event.id,
      status: event.status,
      confidence: event.confidence,
      imageUrl: event.imageUrl,
      timestamp: event.timestamp.toISOString(),
    });

    return res.status(201).json({ ok: true, eventId: event.id });
  } catch (error) {
    console.error("POST /api/events/detect error:", error);
    return res.status(500).json({ error: "이벤트 저장 실패" });
  }
});

/**
 * 최근 이벤트 조회
 */
app.get("/api/events/recent", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const safeLimit = Number.isNaN(limit) ? 10 : Math.min(Math.max(limit, 1), 50);

    const items = await prisma.fallEvent.findMany({
      orderBy: { timestamp: "desc" },
      take: safeLimit,
    });

    return res.json({
      items: items.map((e) => ({
        id: e.id,
        status: e.status,
        confidence: e.confidence,
        imageUrl: e.imageUrl,
        timestamp: e.timestamp.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/events/recent error:", error);
    return res.status(500).json({ error: "최근 이벤트 조회 실패" });
  }
});

/**
 * 대시보드 상태 조회 (최근 FALL 기준 10분 danger)
 */
app.get("/api/dashboard/status", async (_req, res) => {
  try {
    const lastFall = await prisma.fallEvent.findFirst({
      where: { status: "FALL" },
      orderBy: { timestamp: "desc" },
      select: { timestamp: true },
    });

    if (!lastFall) {
      return res.json({
        status: "normal",
        dangerUntil: null,
        lastFallAt: null,
        serverNow: new Date().toISOString(),
      });
    }

    const dangerUntilDate = new Date(lastFall.timestamp.getTime() + DANGER_MS);
    const now = new Date();
    const status = now < dangerUntilDate ? "danger" : "normal";

    return res.json({
      status,
      dangerUntil: dangerUntilDate.toISOString(),
      lastFallAt: lastFall.timestamp.toISOString(),
      serverNow: now.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/dashboard/status error:", error);
    return res.status(500).json({ error: "상태 조회 실패" });
  }
});

io.on("connection", (socket) => {
  console.log("클라이언트 연결:", socket.id);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});