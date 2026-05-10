# SafeWatch: 웹캠 기반 노인 낙상 감지 및 알림 시스템

SafeWatch는 별도의 웨어러블 장치 없이 고정된 카메라(IP 카메라, 웹캠 등) 영상을 실시간으로 분석하여 고령자의 낙상 사고를 감지하고 보호자에게 즉시 알리는 웹 기반 안전 모니터링 시스템입니다.

## 🏗 시스템 아키텍처

1.  **Frontend (React/TS):** 보호자용 대시보드. 실시간 상태 모니터링, 알림 수신 및 이벤트 기록 조회.
2.  **Main Backend (Node.js):** 비즈니스 로직, 데이터베이스 관리, 실시간 알림 중계(Socket.io).
3.  **AI Worker (Python):** YOLOv8 기반 실시간 영상 분석 및 낙상 감지.
4.  **Database (PostgreSQL):** 사용자 정보 및 낙상 이벤트 이력(상태, 이미지, 신뢰도 등) 저장.

## 📦 기술 스택 및 주요 라이브러리

### Frontend
- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **State & Routing**: Zustand, React Router DOM
- **Network & Real-time**: Axios, Socket.io-client

### Backend
- **Core**: Node.js, Express, TypeScript
- **Database & ORM**: PostgreSQL, Prisma
- **Real-time**: Socket.io
- **Etc**: dotenv, cors

### AI Worker
- **Core**: Python 3
- **AI & Vision**: Ultralytics (YOLOv8), OpenCV (`opencv-python-headless`), NumPy
- **Server**: FastAPI, Uvicorn
- **Network**: Requests

## 🛠 현재 구현 완료된 내용

### 1. 시스템 인프라 및 환경 구축
- [x] 서비스별 폴더 구조화 (`frontend`, `backend`, `ai-worker`)
- [x] Docker 및 Docker Compose를 이용한 전체 시스템 컨테이너화
- [x] PostgreSQL 데이터베이스 및 Prisma ORM 연동

### 2. AI Worker (영상 분석)
- [x] **YOLOv8 (`best.pt`) 모델 통합:** 실시간 프레임 분석 및 낙상 객체 탐지
- [x] **카메라 유연성:** USB 웹캠 및 IP 카메라(HTTP/RTSP) 연동 지원
- [x] **상태 추적:** 카메라 연결 상태(`ONLINE`, `OFFLINE`) 실시간 감시 및 자동 재연결
- [x] **이미지 캡처:** 낙상 감지 시 해당 프레임을 Base64로 인코딩하여 백엔드 전송

### 3. Backend (API & 실시간 서버)
- [x] **Event API:** AI 워커로부터 낙상 데이터를 수신하여 DB 저장 및 클라이언트 전파
- [x] **Socket.io 실시간 통신:** 낙상 발생 시 프론트엔드에 `FALL_DETECTED` 이벤트 즉시 발송
- [x] **상태 관리 로직:** 최근 낙상 발생 후 10분간 시스템 상태를 `danger`로 유지하는 비즈니스 로직 구현
- [x] **RESTful API:** 최근 이벤트 목록 및 대시보드 상태 조회 기능

### 4. Frontend (보호자 대시보드)
- [x] **실시간 모니터링 UI:** 카메라 라이브 스트림(더미) 및 시스템 상태 대시보드 구축
- [x] **실시간 알림 통합:** Socket.io를 통해 백엔드 알림을 실시간으로 반영하여 UI 업데이트
- [x] **이벤트 히스토리 리스트:** 최근 10개의 낙상/정상 탐지 기록을 신뢰도와 함께 출력
- [x] **반응형 레이아웃:** 모바일 환경에 최적화된 앱 스타일의 UI 구현 (Sidebar, Header 적용)

---

## 🚀 시작하기 (로컬 테스트)

### 사전 준비
- Docker Desktop이 설치되어 있어야 합니다.
- (테스트용) 스마트폰에 'IP Webcam' 앱 설치 혹은 USB 웹캠 준비.

### 실행 명령어
```bash
# 1. 환경 변수 설정 (docker-compose.yml 내 CAMERA_SOURCE 수정)
# 2. 시스템 일괄 실행
docker-compose up --build
```

---

## 📝 향후 구현 로드맵 (To-Do)

### 1단계: 인증 및 알림 시스템 고도화
- [ ] **Google OAuth 2.0 연동:** 백엔드 Passport.js 연동 및 실제 로그인 세션 관리
- [ ] **이메일 알림 시스템:** 낙상 발생 시 보호자에게 즉시 이메일 전송 (Nodemailer)
- [ ] **이벤트 기록 페이지 완성:** 과거 모든 기록 조회 및 캡처 이미지 상세보기 기능

### 2단계: AI 로직 정교화 (Post-Processing)
- [ ] **무동작 감지(Stillness Detection):** 낙상 감지 후 일정 시간 움직임이 없을 때만 최종 경보 발령
- [ ] **오탐지 필터링:** AI 모델 임계값(Confidence Threshold) 최적화 및 다중 프레임 검증 logic
- [ ] **통계 시각화:** 주간/월간 낙상 발생 통계 차트 구현

### 3단계: 배포 (Deployment)
- [ ] **서버 배포:** 가상 서버(OpenStack 등) 환경에 Docker Compose를 이용한 실서비스 배포
- [ ] **Nginx 설정:** 보안 및 트래픽 관리를 위한 리버스 프록시 설정
