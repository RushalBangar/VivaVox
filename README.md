# ◈ VIVAVOX: Neural Interview Intelligence

> **The state-of-the-art AI interview coach that runs entirely on your machine.**

VivaVox is a professional mock-interview desktop application designed to provide high-fidelity, private, and real-time performance analysis. Powered by **Google's Gemma AI**, it parses your resume to generate personalized "Neural Queries" and evaluates your answers across multiple dimensions—all within an immersive 3D HUD environment.

---

## 🚀 Key Features

*   **On-Device Intelligence**: Powered by **Gemma** models running locally via **Ollama**. Your resume and interview data never leave your computer.
*   **Total Privacy**: 100% offline-capable. No cloud APIs, no latency, zero data collection.
*   **Immersive 3D Experience**: A cinematic interview room built with **Three.js** and **React Three Fiber**, featuring real-time HUD overlays.
*   **Multimodal Analysis**: Evaluates technical accuracy, communication clarity, confidence, and depth of knowledge.
*   **Real-time Transcription**: Integrated speech-to-text allows for seamless interaction with the AI.
*   **Privacy First**: Built with **Electron** and local execution for maximum security.

---

## 📂 Project Structure

This repository is organized into two primary workstreams:

1.  **[`vivavox-desktop/`](./vivavox-desktop/)**: The core Electron application.
    *   **Main Process**: TypeScript-based Electron shell managing AI and hardware.
    *   **Renderer**: Next.js 14 frontend with TailwindCSS and Framer Motion.
    *   **3D Engine**: Three.js visualizations.
2.  **[`vivavox-website/`](./vivavox-website/)**: The premium landing page.
    *   **OS Detection**: Smart download logic to serve the correct installer (.exe, .dmg, .AppImage).
    *   **Animations**: Lightweight IntersectionObserver reveal effects.

---

## 🛠️ Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Ollama](https://ollama.com/) (Installed and running)
*   **Gemma Model**: Run `ollama pull gemma:2b` in your terminal.

### Running Locally
```bash
# 1. Clone and enter desktop directory
cd vivavox-desktop

# 2. Install dependencies
npm install

# 3. Start development environment
npm run electron:dev
```

---

## 📦 Distribution & Builds

We use **electron-builder** to package the application for all major platforms:

*   **Windows**: `.exe` (NSIS Installer)
*   **macOS**: `.dmg` (Intel & Apple Silicon)
*   **Linux**: `.AppImage`

To build for your current platform:
```bash
npm run electron:build
```

---

## 🛡️ Privacy & Security

VivaVox is designed for absolute privacy.
*   **100% Local**: Gemma AI runs via Ollama on your own CPU/GPU. No data is sent to the cloud.
*   **Independent**: The app functions entirely offline once the model is downloaded.
*   **Encrypted Storage**: Local settings and session data are stored securely.

---

## 👨‍💻 Author
**Rushal Bangar** — Lead Developer & Designer

---
*VivaVox 2026 // Neural Dynamics*
