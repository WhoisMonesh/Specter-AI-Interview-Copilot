# Case Study: Reverse-Engineering Ghotly AI to Build Specter AI

> Documented in the style of [Awesome REA (Reverse Engineer Anything)](https://github.com/AIshihzong/awesome-reverse-engineer-anything)

---

## 🎯 Target Overview
- **Target Application:** Ghotly AI (Ghostly AI) v4.3.3
- **Original Platform:** Windows 10 & 11 (64-bit) only
- **Original URL:** `https://www.ghotlyai.in/download/`
- **Rebuilt Project:** **Specter AI** (macOS Apple Silicon/Intel, Windows 10/11, Linux, Web)

---

## 🔍 Investigation & Reverse-Engineering Methodology

| Step | Method | Tools Used | What Was Extracted |
| :--- | :--- | :--- | :--- |
| **1. Installer Unpacking** | NSIS deconstruction | `7zz` | Decompressed `$PLUGINSDIR/app-64.7z` from `ghostly-4.3.3-setup.exe`. |
| **2. ASAR Extraction** | ASAR archive parsing | Python ASAR parser + Node.js | Unpacked `resources/app.asar` into raw JavaScript main, preload, and renderer bundles. |
| **3. Main Process Analysis** | Static JS AST analysis | Python regex & JS AST | Identified why Ghotly failed on macOS/Linux: hardcoded `koffi` calls to Win32 `user32.dll` (`SetWindowDisplayAffinity(hwnd, 0x11)`). |
| **4. Audio Capture Deconstruction** | Chromium media session tracing | Code inspection | Discovered how interviewer loopback audio was captured without prompt dialogs via `session.setDisplayMediaRequestHandler({ audio: "loopback" })`. |
| **5. AI Prompt Extraction** | Prompt reverse-engineering | String literal analysis | Extracted the complete classification prompt (MCQ, DSA Coding with Time/Space complexity, Bug debugging, System Design, STAR behavioral). |

---

## 💡 Key Architectural Findings

### 1. The Screen-Share Invisibility Gap
Ghotly stated on their website: *"macOS is in development; Linux is not planned: its overlay and audio capture use Windows features (display exclusion, system loopback audio)."*
- **Reverse-Engineering Insight:** Electron already possesses cross-platform content protection natively. By binding `win.setContentProtection(true)` on macOS, Chromium automatically calls AppKit's `[window setSharingType:NSWindowSharingNone]`, which excludes the window from Apple's ScreenCaptureKit, Zoom, Google Meet, and Teams without needing Win32 FFI!

### 2. Audio Loopback Pipeline
- Interviewer system audio is intercepted through Chromium's `setDisplayMediaRequestHandler` set to `loopback`.
- Candidate microphone audio is captured via `navigator.mediaDevices.getUserMedia`.
- Speech audio chunks are transmitted to Whisper API endpoints (`https://api.groq.com/openai/v1/audio/transcriptions` or Gemini Speech).

---

## 🛠️ The Clean Rebuild: Specter AI

Specter AI was rebuilt as a clean-room, multi-platform commercial product:

1. **Multi-Platform Support:**
   - **macOS:** Universal binary (Apple Silicon M1–M4 + Intel) with `NSWindowSharingNone` stealth.
   - **Windows:** Hardware-level `WDA_EXCLUDEFROMCAPTURE` + `WDA_MONITOR` fallback.
   - **Linux:** X11/Wayland transparent floating overlay.
2. **Dual Inference Modes:**
   - **Specter Cloud AI:** Built-in inference pool with 15 free trial questions and Pro Pass subscription. No user API key needed.
   - **BYOK (Bring Your Own Key):** 100% free forever for Groq, Gemini, OpenAI, Claude, OpenRouter, and NVIDIA.
3. **Full Commercial Website:**
   - Interactive live simulator, OS platform auto-detection, pricing comparison, keyboard shortcuts reference table, and GitHub Pages release structure.
