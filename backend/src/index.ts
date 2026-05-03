import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 실제 배포 시에는 프론트엔드 주소로 제한 필요
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // 이미지 데이터를 받기 위해 한도 증가

// 1. 기본 라우트
app.get('/', (req, res) => {
  res.send('SafeWatch Backend is running!');
});

// 2. AI Worker로부터 낙상 감지 신호를 받는 API
app.post('/api/events/detect', async (req, res) => {
  const { status, image, confidence } = req.body;

  console.log(`[EVENT] ${status} 감지됨!`);

  try {
    // DB에 기록 저장
    const event = await prisma.fallEvent.create({
      data: {
        status: status,
        imageUrl: image, // Base64 이미지 데이터
        confidence: confidence || 0.0,
      }
    });

    // 실시간으로 프론트엔드에 소켓 전송
    io.emit('new-event', event);

    res.status(200).json({ message: 'Event recorded successfully', event });
  } catch (error) {
    console.error('DB 저장 실패:', error);
    res.status(500).json({ error: 'Failed to record event' });
  }
});

// 3. 전체 낙상 이력 조회 API
app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.fallEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// 소켓 연결 설정
io.on('connection', (socket) => {
  console.log('클라이언트가 연결되었습니다:', socket.id);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
