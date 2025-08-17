import express from "express";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// HTTP server
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`HTTP server is running at http://localhost:${port}`);
});

// Websocket server for audio streaming
const wss = new WebSocketServer({ port: process.env.WS_PORT || 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    console.log("Received audio chunk: ", msg.byteLength);
    // TODO: Forward this to GOOGLE API
    // TODO: Send transcript back: ws.send("partial transcript...")
  });

  ws.on("close", () => console.log("Client disconnected"));

  console.log(
    `WebSocket server running at ws://localhost:${process.env.WS_PORT || 8080}`
  );
});
