import express from "express";
import { WebSocketServer } from "ws";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({});

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
    const tmpPath = path.join("./tmp", `chunk-${Date.now()}.webm`);
    fs.writeFileSync(tmpPath, Buffer.from(data));

    try {
      const fileUpload = await ai.files.upload({
        file: tmpPath,
        config: { mimeType: "audio/webm" },
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: createUserContent([
          createPartFromUri(fileUpload.uri, fileUpload.mimeType),
          "Generate a transcript of the speech.",
        ]),
      });

      socket.send(JSON.stringify({ transcript: response.text }));
    } catch (err) {
      console.error("Gemini API error: ", err);
    } finally {
      fs.unlinkSync(tmpPath);
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});
