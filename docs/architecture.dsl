workspace "SafeWatch" "웹캠 기반 노인 낙상 감지 및 알림 시스템" {

    model {
        # 1. 사용자 및 외부 시스템 정의
        guardian = person "보호자" "웹 대시보드를 통해 실시간으로 노인의 안전 상태를 모니터링하고 알림을 받습니다."
        elderly = person "고령자" "모니터링의 대상이며 별도의 장치를 착용하지 않습니다."
        camera = softwareSystem "카메라 (USB/IP Webcam)" "고령자의 활동 영상을 실시간으로 촬영하여 AI Worker에 전달합니다." "External System"

        googleOAuth = softwareSystem "Google OAuth" "보호자 로그인을 위한 인증 메커니즘을 제공합니다. (예정)" "External System"
        emailSystem = softwareSystem "이메일 시스템" "위험 상황 발생 시 보호자에게 이메일 알림을 발송합니다. (예정)" "External System"

        # 2. SafeWatch 내부 시스템 정의 (Containers)
        safeWatch = softwareSystem "SafeWatch System" "웹캠 영상을 분석하여 낙상을 자동 감지하고 보호자에게 알리는 핵심 시스템입니다." {
            
            frontend = container "Frontend Dashboard" "보호자에게 실시간 모니터링, 이벤트 기록, 시스템 상태를 시각적으로 제공합니다." "React 19, TypeScript, TailwindCSS 4" "Web Browser"
            
            backend = container "Main Backend API" "비즈니스 로직 처리, 이벤트 데이터 관리, 클라이언트로의 실시간 알림 중계를 담당합니다." "Node.js, Express, Socket.io" "API"
            
            aiWorker = container "AI Analysis Worker" "실시간 비디오 스트림을 수신하고 YOLOv8 모델을 통해 낙상을 감지합니다." "Python, FastAPI, OpenCV, Ultralytics" "Worker"
            
            database = container "Database" "사용자 정보, 낙상 이벤트 로그 및 스냅샷 이미지 URL을 저장합니다." "PostgreSQL 15" "Database"
        }

        # 3. 관계(Relationships) 정의
        
        # 외부-내부 상호작용
        elderly -> camera "촬영됨"
        guardian -> frontend "대시보드를 조회하고 실시간 알림을 수신합니다."
        
        frontend -> googleOAuth "소셜 로그인을 요청합니다. (예정)"
        backend -> googleOAuth "OAuth 토큰을 검증합니다. (예정)"
        backend -> emailSystem "이메일 발송을 요청합니다. (예정)"
        emailSystem -> guardian "낙상 경고 이메일을 전송합니다."

        # 내부 컨테이너 간의 상호작용
        camera -> aiWorker "실시간 영상 프레임을 전송합니다." "HTTP/RTSP/USB"
        
        frontend -> backend "이벤트 기록 및 대시보드 상태를 조회합니다." "HTTP/REST API"
        backend -> frontend "낙상 감지 이벤트를 실시간으로 푸시합니다." "WebSocket (Socket.io)"
        
        aiWorker -> backend "낙상 감지 이벤트(이미지, 신뢰도 포함) 및 카메라 상태를 전송합니다." "HTTP/REST API"
        
        backend -> database "사용자 및 이벤트 데이터를 읽고 씁니다." "Prisma ORM (TCP)"
    }

    views {
        # View 1: 시스템 컨텍스트 (전체 그림)
        systemContext safeWatch "SystemContext" {
            include *
            autoLayout tb
            description "SafeWatch 시스템이 사용자와 외부 시스템(카메라, 인증, 이메일)과 어떻게 상호작용하는지 보여주는 System Context 다이어그램입니다."
        }

        # View 2: 컨테이너 뷰 (내부 아키텍처)
        container safeWatch "Containers" {
            include *
            autoLayout tb
            description "SafeWatch 시스템 내부의 프론트엔드, 백엔드, AI 워커, 데이터베이스 간의 데이터 흐름과 기술 스택을 보여주는 Container 다이어그램입니다."
        }

        # 다이어그램 스타일링
        theme default
        
        styles {
            element "External System" {
                background #999999
                color #ffffff
            }
            element "Database" {
                shape Cylinder
                background #336699
                color #ffffff
            }
            element "Web Browser" {
                shape WebBrowser
                background #438dd5
                color #ffffff
            }
            element "API" {
                background #85bbf0
                color #000000
            }
            element "Worker" {
                background #f0a30a
                color #000000
                shape Hexagon
            }
        }
    }
}
