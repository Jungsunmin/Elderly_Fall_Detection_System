import cv2
import asyncio
import os
import requests
import base64
from fastapi import FastAPI
from dotenv import load_dotenv
from ultralytics import YOLO

load_dotenv()

app = FastAPI()

# 환경 변수 설정
CAMERA_SOURCE = os.getenv("CAMERA_SOURCE", "0")
if CAMERA_SOURCE.isdigit():
    CAMERA_SOURCE = int(CAMERA_SOURCE)

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:4000")
MODEL_PATH = os.getenv("MODEL_PATH", "best.pt")

class FallDetector:
    def __init__(self, source, model_path):
        self.source = source
        self.model_path = model_path
        self.cap = None
        self.model = None
        self.status = "INIT"  # INIT, CONNECTING, ONLINE, OFFLINE
        self.is_running = False

    def load_model(self):
        print(f"모델 로드 중: {self.model_path}")
        try:
            self.model = YOLO(self.model_path)
        except Exception as e:
            print(f"모델 로드 실패: {e}. 기본 모델(yolov8n.pt) 사용")
            self.model = YOLO("yolov8n.pt")

    async def check_camera(self):
        """카메라 연결 상태를 명확히 확인합니다."""
        if self.cap is None or not self.cap.isOpened():
            self.status = "CONNECTING"
            self.cap = cv2.VideoCapture(self.source)
            
            if self.cap.isOpened():
                print(f"카메라 연결 성공: {self.source}")
                self.status = "ONLINE"
                self.notify_backend_status("ONLINE")
                return True
            else:
                print(f"카메라 연결 실패: {self.source}")
                self.status = "OFFLINE"
                self.notify_backend_status("OFFLINE")
                return False
        return True

    def notify_backend_status(self, status):
        """백엔드에 카메라 상태를 보고합니다."""
        try:
            requests.post(
                f"{BACKEND_URL}/api/status/camera", 
                json={"status": status},
                timeout=1
            )
        except:
            pass # 백엔드가 아직 안 떴을 경우 무시

    async def run_detection(self):
        self.is_running = True
        self.load_model()
        
        while self.is_running:
            if not await self.check_camera():
                await asyncio.sleep(5) # 실패 시 5초 후 재시도
                continue

            ret, frame = self.cap.read()
            if not ret:
                print("프레임 읽기 실패. 연결 끊김 감지.")
                self.status = "OFFLINE"
                self.cap.release()
                self.notify_backend_status("OFFLINE")
                await asyncio.sleep(2)
                continue

            # YOLO 분석
            results = self.model(frame, verbose=False)
            
            fall_detected = False
            for r in results:
                if len(r.boxes) > 0:
                    # 실제 프로젝트에서는 r.boxes.cls 값을 확인하여 'fall' 클래스인지 체크
                    fall_detected = True
                    break

            if fall_detected:
                try:
                    _, buffer = cv2.imencode('.jpg', frame)
                    img_base64 = base64.b64encode(buffer).decode('utf-8')
                    requests.post(
                        f"{BACKEND_URL}/api/events/detect", 
                        json={"status": "FALL", "image": img_base64},
                        timeout=1
                    )
                except Exception as e:
                    print(f"이벤트 전송 실패: {e}")

            await asyncio.sleep(0.01)

detector = FallDetector(CAMERA_SOURCE, MODEL_PATH)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(detector.run_detection())

@app.get("/")
async def root():
    return {
        "camera_source": str(CAMERA_SOURCE),
        "status": detector.status,
        "model": MODEL_PATH
    }

@app.get("/api/health")
async def health_check():
    """카메라 연결 상태를 직접 응답하는 API"""
    return {
        "camera_connected": detector.status == "ONLINE",
        "status": detector.status
    }
