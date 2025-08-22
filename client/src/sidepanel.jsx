import { useState, useRef } from "react";
import { CheckCircleFill, ExclamationCircleFill } from "react-bootstrap-icons";
import { Toast, ToastContainer, Button, Card, Spinner } from "react-bootstrap";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";

const CAPTURE_INTERVAL = 30000;

function Sidepanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const streamRef = useRef(null);
  const outputRef = useRef(null);
  const wssRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null);

  const showErrorToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleWebSocketOpen = () => {
    console.log("WebSocket connection established");
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
      mimeType: "audio/webm",
    });
    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start(CAPTURE_INTERVAL);
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0 && wssRef.current?.readyState === WebSocket.OPEN) {
      event.data.arrayBuffer().then((buffer) => {
        wssRef.current.send(new Uint8Array(buffer));
      });
    }
  };

  const handleWebSocketMessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.transcript) {
      setTranscript((prev) => prev + "\n" + data.transcript);
    }
  };

  const handleWebSocketClose = () => {
    console.log("WebSocket connection closed");
    setIsConnected(false);
    showErrorToast("WebSocket connection lost.");
  };

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
    setMinutes(0);
    setSeconds(0);
  };

  const startCapture = () => {
    if (!chrome.tabCapture) {
      showErrorToast(
        "Tab capture is not available. Are you running the extension unpacked?"
      );
      return;
    }

    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      if (chrome.runtime.lastError || !stream) {
        console.error("Error capturing audio:", chrome.runtime.lastError);
        showErrorToast("Error capturing audio");
        return;
      }

      startCounter();
      console.log("Captured stream:", stream);

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

      setIsConnected(true);
    });
  };

  const stopCapture = () => {
    stopCounter();

    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    outputRef.current?.close();
    outputRef.current = null;

    wssRef.current?.close();
    wssRef.current = null;

    console.log("Capture stopped.");
  };

  const toggleRecording = () => {
    isRecording ? stopCapture() : startCapture();
    setIsRecording((prev) => !prev);
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
    <div className="p-3" style={{ fontFamily: "sans-serif" }}>
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999 }}
      >
        <Toast
          bg="danger"
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <ExclamationCircleFill className="me-2" color="white" />
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Card className="mb-3 p-3 text-center">
        {isConnected ? (
          <p className="text-success mb-0">
            <CheckCircleFill size={20} className="me-2" />
            Connected
          </p>
        ) : (
          <p className="text-danger mb-0">
            <ExclamationCircleFill size={20} className="me-2" />
            Not Connected
          </p>
        )}
      </Card>

      <div className="d-flex justify-content-center mb-3 fs-4">
        <span>{formattedMinutes}</span>
        <span className="mx-1">:</span>
        <span>{formattedSeconds}</span>
      </div>

      <Button
        variant={isRecording ? "danger" : "primary"}
        onClick={toggleRecording}
        className="w-100 mb-3"
      >
        {isRecording ? (
          <>
            <Spinner animation="grow" size="sm" className="me-2" />
            Stop Recording
          </>
        ) : (
          "Start Recording"
        )}
      </Button>

      <Card className="p-3">
        <h5>Live Transcript</h5>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {transcript}
        </pre>
        <Button variant="secondary" onClick={downloadTranscript}>
          Download Transcript
        </Button>
      </Card>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Sidepanel />);
