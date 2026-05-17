import { Router, Request, Response } from "express";
import type { Server as SocketIOServer } from "socket.io";
import { prisma } from "../lib/prisma";

export function createEventsRouter(io: SocketIOServer): Router {
  const router = Router();

  /**
   * AI-worker -> 낙상 이벤트 수신
   * body: { status: "FALL" | "STILL", image?: string, confidence?: number, userId?: number }
   */
  router.post("/detect", async (req: Request, res: Response) => {
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

      if (event.status === "FALL") {
        io.emit("FALL_DETECTED", {
          id: event.id,
          status: event.status,
          confidence: event.confidence,
          imageUrl: event.imageUrl,
          timestamp: event.timestamp.toISOString(),
        });
      }

      return res.status(201).json({ ok: true, eventId: event.id });
    } catch (error) {
      console.error("POST /api/events/detect error:", error);
      return res.status(500).json({ error: "이벤트 저장 실패" });
    }
  });

  /** 최근 이벤트 조회 */
  router.get("/recent", async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit ?? 10);
      const safeLimit = Number.isNaN(limit) ? 10 : Math.min(Math.max(limit, 1), 50);

      const items = await prisma.fallEvent.findMany({
        orderBy: { timestamp: "desc" },
        take: safeLimit,
      });

      return res.json({
        items: items.map((e: any) => ({
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

  /** CSV 다운로드 */
  router.get("/download", async (req: Request, res: Response) => {
    try {
      const items = await prisma.fallEvent.findMany({
        select: {
          id: true,
          timestamp: true,
          status: true,
          confidence: true,
        },
        orderBy: { timestamp: "desc" },
      });

      let csv = "\uFEFFID,Timestamp,Status,Confidence\n"; // UTF-8 BOM for Excel
      items.forEach((item: any) => {
        const timeStr = item.timestamp ? item.timestamp.toISOString() : "";
        const confStr = item.confidence !== null ? item.confidence.toFixed(4) : "";
        csv += `${item.id},${timeStr},${item.status},${confStr}\n`;
      });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=fall_events.csv");
      return res.status(200).send(csv);
    } catch (error) {
      console.error("GET /api/events/download error:", error);
      return res.status(500).json({ error: "CSV 다운로드 실패" });
    }
  });

  /** 기록 전체 삭제 */
  router.delete("/all", async (req: Request, res: Response) => {
    try {
      await prisma.fallEvent.deleteMany({});
      return res.json({ ok: true });
    } catch (error) {
      console.error("DELETE /api/events/all error:", error);
      return res.status(500).json({ error: "기록 삭제 실패" });
    }
  });

  return router;
}