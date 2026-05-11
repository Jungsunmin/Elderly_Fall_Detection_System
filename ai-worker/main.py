import cv2
import asyncio
import os
import requests
import base64
import time
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
        print(f"모델 로드 중: {self.model_path}", flush=True)
        try:
            self.model = YOLO(self.model_path)
            print(f"모델 로드 완료. 클래스 목록: {self.model.names}", flush=True)
        except Exception as e:
            print(f"모델 로드 실패: {e}. 기본 모델(yolov8n.pt) 사용", flush=True)
            self.model = YOLO("yolov8n.pt")
            print(f"기본 모델 로드 완료. 클래스 목록: {self.model.names}", flush=True)

    async def check_camera(self):
        """카메라 연결 상태를 명확히 확인합니다."""
        if self.cap is None or not self.cap.isOpened():
            self.status = "CONNECTING"
            
            is_url = isinstance(self.source, str) and (
                self.source.startswith("rtsp://") or 
                self.source.startswith("http://") or 
                self.source.startswith("https://")
            )

            if is_url:
                # URL 형태인 경우 FFMPEG 백엔드 우선 시도
                print(f"카메라 연결 시도 (URL/FFMPEG): {self.source}", flush=True)
                self.cap = cv2.VideoCapture(self.source, cv2.CAP_FFMPEG)
                if not self.cap.isOpened():
                    print(f"FFMPEG 백엔드 실패, 기본 백엔드로 재시도: {self.source}", flush=True)
                    self.cap = cv2.VideoCapture(self.source)
            else:
                # 숫자(Device ID) 또는 로컬 파일 경로
                print(f"카메라 연결 시도 (Local/Device): {self.source}", flush=True)
                self.cap = cv2.VideoCapture(self.source)
            
            if self.cap.isOpened():
                print(f"카메라 연결 성공: {self.source}", flush=True)
                # 버퍼 크기를 1로 제한하여 지연(Lag) 최소화
                self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                self.status = "ONLINE"
                self.notify_backend_status("ONLINE") # 여기서 보고 누락됨
                return True
            else:
                print(f"카메라 연결 실패: {self.source}", flush=True)
                self.status = "OFFLINE"
                self.notify_backend_status("OFFLINE")
                return False
        return True

    def notify_backend_status(self, status):
        """백엔드에 카메라 상태를 보고합니다."""
        try:
            url = f"{BACKEND_URL}/api/status/camera"
            res = requests.post(
                url, 
                json={"status": status},
                timeout=2
            )
            if res.status_code != 200:
                print(f"⚠️ 상태 보고 실패 (HTTP {res.status_code}): {url}", flush=True)
        except Exception as e:
            # 백엔드가 아직 안 떴을 경우 대비 (조용히 넘어감)
            pass 

    async def run_detection(self):
        self.is_running = True
        self.load_model()
        frame_count = 0
        last_status_time = time.time()
        last_event_time = 0 # 이벤트 전송 쿨타임 관리용
        
        while self.is_running:
            if not await self.check_camera():
                await asyncio.sleep(5) # 실패 시 5초 후 재시도
                continue

            ret, frame = self.cap.read()
            if not ret:
                print("프레임 읽기 실패. 연결 끊김 감지.", flush=True)
                self.status = "OFFLINE"
                self.cap.release()
                self.notify_backend_status("OFFLINE")
                await asyncio.sleep(2)
                continue

            frame_count += 1
            if frame_count % 30 == 0:
                print(f"분석 중... (누적 {frame_count} 프레임)", flush=True)

            # 시간 기반으로 2초마다 백엔드에 상태를 강제 동기화 (프레임 처리 속도와 무관하게)
            current_time = time.time()
            if current_time - last_status_time > 2:
                self.notify_backend_status(self.status)
                last_status_time = current_time

            # YOLO 분석
            results = self.model(frame, verbose=False)
            
            fall_detected = False
            current_frame_detections = []
            
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    class_name = self.model.names[cls]
                    
                    # 현재 프레임에서 감지된 정보 저장
                    current_frame_detections.append(f"{class_name}({conf:.2f})")
                    
                    # 낙상 감지 로직 (70% 임계값)
                    if "fall" in class_name.lower() and conf > 0.7:
                        fall_detected = True
                        print(f"\n[!] ⚠️ 낙상 감지 확정! -----------------------", flush=True)
                        print(f"    클래스: {class_name}, 신뢰도: {conf:.2f}", flush=True)
                        print(f"    전체 감지: {', '.join(current_frame_detections)}", flush=True)
                        print(f"--------------------------------------------", flush=True)
                        break
                if fall_detected:
                    break
            
            # 실시간 분석 로그 출력 (매 30프레임마다 강제 출력)
            if frame_count % 30 == 0:
                if current_frame_detections:
                    print(f"[분석] {', '.join(current_frame_detections)}", flush=True)
                else:
                    print(f"[분석] 감지된 물체 없음", flush=True)

            if fall_detected:
                current_time = time.time()
                # 마지막 전송 후 5초가 지나야만 다시 전송 (중복 전송 방지)
                if current_time - last_event_time > 5:
                    try:
                        _, buffer = cv2.imencode('.jpg', frame)
                        img_base64 = base64.b64encode(buffer).decode('utf-8')
                        requests.post(
                            f"{BACKEND_URL}/api/events/detect", 
                            json={
                                "status": "FALL", 
                                "image": img_base64,
                                "confidence": conf
                            },
                            timeout=1
                        )
                        print(f"✅ 백엔드로 낙상 이벤트 전송 완료 (신뢰도: {conf:.2f})", flush=True)
                        last_event_time = current_time
                    except Exception as e:
                        print(f"❌ 이벤트 전송 실패: {e}", flush=True)
                else:
                    print(f"⏳ 낙상 감지 중... (전송 쿨타임 대기 중)", flush=True)

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
