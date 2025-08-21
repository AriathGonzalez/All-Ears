import React, { useState, useRef } from "react";
import ReactDOM from "react-dom/client";

function Sidepanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("meow");
  const streamRef = useRef(null);
  const outputRef = useRef(null);
  const wssRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  function handleWebSocketOpen() {
    console.log("WebSocket connection established");

    mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
      mimeType: "audio/webm",
    });

    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start(1000);
  }

  function handleDataAvailable(event) {
    if (event.data.size > 0 && wssRef.current?.readyState === WebSocket.OPEN) {
      event.data.arrayBuffer().then((buffer) => {
        wssRef.current.send(new Uint8Array(buffer));
      });
    }
  }

  function handleWebSocketMessage(event) {
    const data = JSON.parse(event.data);

    if (data.transcript) {
      setTranscript((prev) => prev + "\n" + data.transcript);
    }
  }

  function handleWebSocketClose() {
    console.log("WebSocket connection closed");
  }

  const startCounter = () => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev + 1 === 60) {
          setMinutes((m) => m + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopCounter = () => {
    clearInterval(intervalRef.current);
    setSeconds(0);
    setMinutes(0);
  };

  const startCapture = () => {
    chrome.tabCapture.capture(
      {
        audio: true,
        video: false,
      },
      (stream) => {
        if (chrome.runtime.lastError || !stream) {
          console.error("Error capturing audio:", chrome.runtime.lastError);
          return;
        }

        startCounter();
        console.log("Captured stream:", stream);

        // Play back audio
        streamRef.current = stream;
        outputRef.current = new AudioContext();
        const source = outputRef.current.createMediaStreamSource(
          streamRef.current
        );
        source.connect(outputRef.current.destination);

        wssRef.current = new WebSocket("ws://localhost:8080");

        wssRef.current.onopen = handleWebSocketOpen;
        wssRef.current.onmessage = handleWebSocketMessage;
        wssRef.current.onclose = handleWebSocketClose;

        console.log("Audio capture started");
      }
    );
  };

  const stopCapture = () => {
    stopCounter();

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (outputRef.current) {
      outputRef.current.close();
      outputRef.current = null;
    }
    if (wssRef.current) {
      wssRef.current.close();
      wssRef.current = null;
    }

    console.log("Capture stopped.");
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startCapture();
    } else {
      stopCapture();
    }

    setIsRecording(!isRecording);
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex" }} className="timer">
        <p id="min">{formattedMinutes}</p>
        <p>:</p>
        <p id="sec">{formattedSeconds}</p>
      </div>
      <button onClick={toggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <h3>Live Transcript</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>{transcript}</pre>
      <button onClick={() => downloadTranscript()}>Download</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Sidepanel />);
