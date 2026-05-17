import { Router } from "express";
import type { Server as SocketIOServer } from "socket.io";

// 메모리 기반 카메라 상태 저장
let cameraStatus = "OFFLINE";

export function createStatusRouter(io: SocketIOServer): Router {
  const router = Router();

  // 미디어 서버(MediaMTX)의 스트림 상태를 직접 체크하는 로직
  // 2초마다 HLS 엔드포인트에 접속 시도하여 스트림이 살아있는지 확인
  setInterval(async () => {
    try {
      // native fetch 사용 (Node.js 18+ 지원)
      // host.docker.internal은 도커 내부에서 호스트의 포트로 접속하기 위함
      const response = await fetch("http://host.docker.internal:8888/webcam/index.m3u8", {
        signal: AbortSignal.timeout(1000) // 1초 타임아웃
      });

      const newStatus = response.ok ? "ONLINE" : "OFFLINE";

      if (cameraStatus !== newStatus) {
        cameraStatus = newStatus;
        io.emit("CAMERA_STATUS_CHANGED", { status: cameraStatus });
        console.log(`[MediaServer] 카메라 스트림 감지됨: ${cameraStatus}`);
      }
    } catch (error) {
      // 연결 실패 시 OFFLINE으로 간주
      if (cameraStatus !== "OFFLINE") {
        cameraStatus = "OFFLINE";
        io.emit("CAMERA_STATUS_CHANGED", { status: "OFFLINE" });
        console.log(`[MediaServer] 카메라 스트림 끊김: ${cameraStatus}`);
      }
    }
  }, 2000);

  /** AI-worker -> 카메라 상태 보고 (하위 호환성을 위해 유지) */
  router.post("/camera", (req, res) => {
    return res.json({ ok: true });
  });

  /** 프론트엔드 -> 카메라 상태 조회 */
  router.get("/camera", (_req, res) => {
    res.json({ status: cameraStatus });
  });

  return router;
}
