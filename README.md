# 🎙️ Chrome Extension: Real-Time Audio Transcription

A **Chrome extension** that captures **tab audio** and provides **real-time transcription** in a sleek sidepanel interface.  
Includes a session timer, connection status indicators, and transcript download functionality.

---

## 📄 Pages

- **Sidepanel**
  - ![Sidepanel Demo](./assets/live-transcript.gif)

## ✨ Features

- 🎧 **Tab Audio Capture** — Captures audio from the **active tab**.
- 📝 **Live Transcription Display** — Real-time transcript updates.
- ⏱️ **Meeting Timer** — Displays session duration.
- ✅ **Status Indicators** —
  - **Recording State** → Start/Stop button
  - **Connection Status** → Green check or red alert
  - **Error Notifications** → Bootstrap toasts for warnings & errors
- 📥 **Transcript Export** — Download transcript as a `.txt` file.

---

## 🛠️ Technologies Used

- **React** — Frontend UI framework
- **React-Bootstrap** — Components & styling
- **Bootstrap 5** — Utility classes & responsive design
- **Chrome Extensions API** — Tab audio capture & sidepanel integration
- **WebSockets** — Streaming transcript data from the backend
- **JavaScript (ES6+)** — Core logic

---

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AriathGonzalez/All-Ears.git
   cd real-time-transcription-extension
   ```
2. **Install dependencies**
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```
3. **Build the extension | Run Server**
   ```bash
   cd client
   npm run build
   cd ../server
   npm run dev
   ```
4. **Load the extension in Chrome**
   - Go to chrome://extensions
   - Enable Developer Mode
   - Click Load unpacked
   - Select the dist or build folder

## 📌 Usage

1. Click the extension icon to open the sidepanel.
2. Press Start Recording to begin capturing tab audio.
3. Watch the live transcript update in real-time.
4. Press Stop Recording when finished.
5. Download transcript as .txt with one click.
