import { Router } from "express";
import { DANGER_MS } from "../config/constants";
import { prisma } from "../lib/prisma";

export function createDashboardRouter(): Router {
  const router = Router();

  /** 대시보드 상태 조회 (최근 FALL 기준 10분 danger) */
  router.get("/status", async (_req, res) => {
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

  return router;
}