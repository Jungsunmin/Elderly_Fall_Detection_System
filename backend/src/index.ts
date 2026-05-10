import dotenv from "dotenv";
import express from "express";
import http from "http";
import { configureApp } from "./app";
import { attachSocketIO } from "./socket/io";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

const app = express();
const server = http.createServer(app);
const io = attachSocketIO(server);

configureApp(app, io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});