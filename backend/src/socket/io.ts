import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export function attachSocketIO(server: HttpServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("클라이언트 연결:", socket.id);
  });

  return io;
}