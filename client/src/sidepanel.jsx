import React, { useState, useRef } from "react";
import ReactDOM from "react-dom/client";

function Sidepanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const streamRef = useRef(null);
  const outputRef = useRef(null);

  const toggleRecording = () => {
    if (!isRecording) {
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

          console.log("Captured stream:", stream);

          streamRef.current = stream;
          outputRef.current = new AudioContext();
          const source = outputRef.current.createMediaStreamSource(stream);
          source.connect(outputRef.current.destination);

          const analyzer = outputRef.current.createAnalyser();
          source.connect(analyzer);

          console.log("Audio capture started");
        }
      );
    } else {
      stopCapture();
    }

    setIsRecording(!isRecording);
  };

  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (outputRef.current) {
      outputRef.current.close();
      outputRef.current = null;
    }
    console.log("Capture stopped.");
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <button onClick={toggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <h3>Live Transcript</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>{transcript}</pre>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Sidepanel />);
