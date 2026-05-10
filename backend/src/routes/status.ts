import { Router } from "express";
import type { Server as SocketIOServer } from "socket.io";

// 메모리 기반 카메라 상태 저장
let cameraStatus = "OFFLINE";

export function createStatusRouter(io: SocketIOServer): Router {
  const router = Router();

  /** AI-worker -> 카메라 상태 보고 */
  router.post("/camera", (req, res) => {
    console.log("--- 카메라 상태 보고 요청 수신 ---");
    console.log("Body:", req.body);
    const { status } = req.body as { status: string };
    if (status === "ONLINE" || status === "OFFLINE") {
      cameraStatus = status;
      io.emit("CAMERA_STATUS_CHANGED", { status: cameraStatus });
      console.log(`카메라 상태가 성공적으로 변경됨: ${cameraStatus}`);
      return res.json({ ok: true });
    }
    console.log("잘못된 상태 값 수신:", status);
    return res.status(400).json({ error: "Invalid status" });
  });

  /** 프론트엔드 -> 카메라 상태 조회 */
  router.get("/camera", (_req, res) => {
    res.json({ status: cameraStatus });
  });

  return router;
}
