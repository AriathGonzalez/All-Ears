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

wss.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", async (data) => {
    console.log("Received audio chunk: ", data.byteLength || data.length);

    const demoTranscript = "test transcript";

    socket.send(JSON.stringify({ transcript: demoTranscript }));
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});
