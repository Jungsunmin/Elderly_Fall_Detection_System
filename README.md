# SafeWatch: 웹캠 기반 노인 낙상 감지 및 알림 시스템

SafeWatch는 별도의 웨어러블 장치 없이 고정된 카메라(IP 카메라, 웹캠 등) 영상을 실시간으로 분석하여 고령자의 낙상 사고를 감지하고 보호자에게 즉시 알리는 웹 기반 안전 모니터링 시스템입니다.

## 🏗 시스템 아키텍처

1.  **Frontend (React/TS):** 보호자용 대시보드. 실시간 상태 모니터링 및 알림 수신.
2.  **Main Backend (Node.js):** 비즈니스 로직, 데이터베이스 관리, 실시간 알림 중계(Socket.io).
3.  **AI Worker (Python):** YOLOv8 기반 실시간 영상 분석 및 낙상 감지.
4.  **Database (PostgreSQL):** 사용자 정보 및 낙상 이벤트 이력 저장.


## 🛠 현재 구현 완료된 내용

### 1. 프로젝트 기초 환경 구축
- [x] 서비스별 폴더 구조화 (`frontend`, `backend`, `ai-worker`)
- [x] Docker 및 Docker Compose를 이용한 전체 시스템 컨테이너화
- [x] PostgreSQL 데이터베이스 연동 환경 설정

### 2. AI Worker (영상 분석 파트)
- [x] FastAPI 기반 AI 워커 서버 구축
- [x] **YOLOv8 (`best.pt`) 모델 통합:** 실시간 프레임 분석 로직 구현
- [x] **카메라 유연성 확보:** USB 웹캠 및 스마트폰 IP 카메라(HTTP/RTSP) 연동 지원
- [x] **상태 관리 로직:** 카메라 연결 상태(`ONLINE`, `OFFLINE`) 실시간 추적 및 자동 재연결

### 3. Backend (API 파트)
- [x] Express.js 기반 메인 서버 구축
- [x] **Prisma ORM 적용:** PostgreSQL 스키마 설계 (User, FallEvent 테이블)
- [x] **낙상 이벤트 API:** AI 워커로부터 신호를 받아 DB에 저장하고 Socket.io로 전송하는 로직 구현

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

### 1단계: 프론트엔드 대시보드 완성
- [ ] **실시간 모니터링 UI:** 카메라 상태(ON/OFF) 표시 및 최근 이벤트 리스트 출력
- [ ] **Socket.io 연동:** 백엔드에서 전송되는 낙상 이벤트를 실시간 팝업으로 알림
- [ ] **이벤트 히스토리 페이지:** 과거 낙상 기록 및 캡처 이미지 조회 기능

### 2단계: 인증 및 보조 알림 시스템
- [ ] **Google OAuth 2.0:** 보호자 로그인을 위한 구글 인증 연동
- [ ] **이메일 알림:** 낙상 발생 시 Nodemailer를 이용한 보호자 이메일 발송 기능

### 3단계: AI 로직 정교화 (Post-Processing)
- [ ] **무동작 감지 규칙:** 낙상 감지 후 일정 시간 동안 움직임이 없는지 추가 판단 로직
- [ ] **오탐지 최적화:** 신뢰도(Confidence) 임계값 조정 및 필터링 강화

### 4단계: 배포 (Deployment)
- [ ] **OpenStack 서버 배포:** 가상 서버 환경에 Docker Compose를 이용한 실서비스 배포
- [ ] **Nginx 설정:** 프론트엔드 서빙 및 리버스 프록시 설정
