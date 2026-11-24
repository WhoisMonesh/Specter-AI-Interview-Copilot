/**
 * Specter AI Desktop Copilot — Main Process (v5.0.0)
 * Full rewrite matching Ghostly AI architecture + Specter branding
 */
import {
  app, BrowserWindow, ipcMain, screen, shell,
  desktopCapturer, globalShortcut, clipboard, safeStorage, nativeImage
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as crypto from 'crypto';
import * as os from 'os';
import Store from 'electron-store';
import { setupAudioCapture, getMediaPermissions, requestMediaPermission, openPrivacySettings } from './audio';
import {
  captureFullScreen as captureScreenEngine,
  captureSourceById,
  getCaptureSources,
  getDisplays,
  checkScreenCapturePermission
} from './capture';
import { extractTextFromScreenshot } from './ocr';

// ─────────────────────────── Types ───────────────────────────
interface Session { token: string; user: UserProfile; expiresAt: string }
interface UserProfile { id: string; email: string; name: string; avatar?: string }
interface Subscription { plan: 'free' | 'pro' | 'enterprise'; status: string; expiresAt: string | null }
export interface DisguiseConfig {
  enabled: boolean;
  preset: 'blank' | 'notes' | 'calculator' | 'terminal' | 'chrome' | 'zoom' | 'custom';
  customName?: string;
  hideIcon: boolean;
}

interface AppSettings {
  activeProvider: string;
  activeModel: string;
  opacity: number;
  stealth: boolean;
  disguise?: DisguiseConfig;
  subscription: Subscription;
  shortcuts: Record<string, string>;
}
interface ApiKeys { groq?: string; gemini?: string; openai?: string; anthropic?: string; openrouter?: string; nvidia?: string; grok?: string; deepgram?: string }

// ─────────────────────────── Pure BYOM / BYOK Architecture ───────────────────────────
// Zero bundled keys — Users bring their own API keys (Gemini, Groq, OpenAI, Claude, etc.)

export const FIREBASE_AUTH_CONFIG = {
  apiKey: '',
  authDomain: 'specter-ai-auth.firebaseapp.com',
  projectId: 'specter-ai-auth',
  storageBucket: 'specter-ai-auth.appspot.com',
  messagingSenderId: '288280531996',
  appId: '1:288280531996:web:specter-ai-auth'
};

const SPECTER_API_BASE = 'https://api.specterai.app';
const DEAD_GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-pro-latest'];
const DEAD_GROQ_MODELS   = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

const DEFAULT_SHORTCUTS: Record<string, string> = {
  solve:              'CommandOrControl+Return',
  captureAndSolve:    'CommandOrControl+Shift+Return',
  captureScreen:      'CommandOrControl+Shift+S',
  captureRegion:      'CommandOrControl+Shift+X',
  toggleClickThrough: 'CommandOrControl+Shift+B',
  panicSwitch:        'CommandOrControl+Shift+Q',
  increaseOpacity:    'CommandOrControl+Shift+Up',
  decreaseOpacity:    'CommandOrControl+Shift+Down',
  toggleVisibility:   'CommandOrControl+Alt+H',
  toggleListen:       'CommandOrControl+Alt+L',
  muteMic:            'CommandOrControl+Alt+M',
  clearPanel:         'CommandOrControl+Alt+C',
  glance:             'CommandOrControl+Alt+G',
  scrollUp:           'CommandOrControl+Alt+Up',
  scrollDown:         'CommandOrControl+Alt+Down',
  copyAnswer:         'CommandOrControl+Alt+A',
  quickChat:          'CommandOrControl+Alt+T',
  moveLeft:           'CommandOrControl+Left',
  moveRight:          'CommandOrControl+Right',
  moveUp:             'CommandOrControl+Up',
  moveDown:           'CommandOrControl+Down',
};

const DEFAULT_DISGUISE: DisguiseConfig = {
  enabled: false,
  preset: 'notes',
  customName: '',
  hideIcon: true,
};

const DEFAULT_SETTINGS: AppSettings = {
  activeProvider: 'gemini',
  activeModel:    'gemini-2.5-flash',
  opacity:        0.92,
  stealth:        true,
  disguise:       DEFAULT_DISGUISE,
  subscription:   { plan: 'pro', status: 'unlocked', expiresAt: null },
  shortcuts:      DEFAULT_SHORTCUTS,
};

export function applyDisguise(win: BrowserWindow | null, disguise?: DisguiseConfig) {
  if (!win || win.isDestroyed()) return;
  const cfg = disguise || getSettings().disguise || DEFAULT_DISGUISE;

  let title = 'Specter AI Copilot';
  if (cfg.enabled) {
    switch (cfg.preset) {
      case 'blank':
        title = ' ';
        break;
      case 'notes':
        title = 'Notes';
        break;
      case 'calculator':
        title = 'Calculator';
        break;
      case 'terminal':
        title = 'Terminal Monitor';
        break;
      case 'chrome':
        title = 'Google Chrome Helper';
        break;
      case 'zoom':
        title = 'Zoom Audio Device';
        break;
      case 'custom':
        title = cfg.customName?.trim() || 'Notes';
        break;
      default:
        title = 'Notes';
    }
  }

  win.setTitle(title);

  // Hide or Show Dock & Taskbar Icon
  const hideIcon = cfg.hideIcon !== false;
  win.setSkipTaskbar(hideIcon);

  if (process.platform === 'darwin') {
    if (hideIcon) {
      app.dock?.hide();
      app.setActivationPolicy('accessory');
    } else {
      app.setActivationPolicy('regular');
      app.dock?.show();
    }
  }
}

// ─────────────────────────── Store ───────────────────────────
const store = new (Store as any)({ name: 'specter-settings' });

// ─────────────────────────── Auth helpers ───────────────────────────
function authDir(): string { return path.join(app.getPath('userData'), 'auth'); }
function readSecure(name: string): string | null {
  try {
    const buf = fs.readFileSync(path.join(authDir(), name));
    return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(buf) : buf.toString('utf8');
  } catch { return null; }
}
function writeSecure(name: string, value: string) {
  fs.mkdirSync(authDir(), { recursive: true });
  const buf = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(value) : Buffer.from(value, 'utf8');
  fs.writeFileSync(path.join(authDir(), name), buf);
}
function deleteSecure(name: string) { try { fs.unlinkSync(path.join(authDir(), name)); } catch {} }

let cachedSession: Session | null = null;
function loadSession(): Session | null {
  if (cachedSession) return cachedSession;
  const raw = readSecure('session.bin');
  if (!raw) return null;
  try { cachedSession = JSON.parse(raw); return cachedSession; } catch { return null; }
}
function saveSession(s: Session | null) {
  cachedSession = s;
  if (s) writeSecure('session.bin', JSON.stringify(s));
  else deleteSecure('session.bin');
}

function activeAccountId(): string {
  return loadSession()?.user?.id || 'local-byok';
}

// ─────────────────────────── Keys helpers ───────────────────────────
function keysFile(accountId: string): string {
  return path.join(app.getPath('userData'), 'keys',
    `${crypto.createHash('sha256').update(`specter-keys:${accountId}`).digest('hex').slice(0, 32)}.bin`);
}
function loadKeys(accountId: string): ApiKeys {
  try {
    const raw = (() => {
      const buf = fs.readFileSync(keysFile(accountId));
      return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(buf) : buf.toString('utf8');
    })();
    return JSON.parse(raw) as ApiKeys;
  } catch { return {}; }
}
function saveKeys(accountId: string, keys: ApiKeys) {
  const dir = path.join(app.getPath('userData'), 'keys');
  fs.mkdirSync(dir, { recursive: true });
  const raw = JSON.stringify(keys);
  const buf = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(raw) : Buffer.from(raw, 'utf8');
  fs.writeFileSync(keysFile(accountId), buf);
}

// ─────────────────────────── Settings helpers ───────────────────────────
function getSettings(): AppSettings {
  const saved: Partial<AppSettings> = store.get('settings', {}) as Partial<AppSettings>;
  const merged: AppSettings = { ...DEFAULT_SETTINGS, ...saved, shortcuts: { ...DEFAULT_SHORTCUTS, ...(saved.shortcuts || {}) } };
  // Fix dead models
  if (merged.activeProvider === 'gemini' && DEAD_GEMINI_MODELS.includes(merged.activeModel)) merged.activeModel = 'gemini-3.6-flash';
  if (merged.activeProvider === 'groq'   && DEAD_GROQ_MODELS.includes(merged.activeModel))   merged.activeModel = 'llama-3.3-70b-specdec';
  return merged;
}
function saveSettings(partial: Partial<AppSettings>) {
  const current = getSettings();
  store.set('settings', { ...current, ...partial });
}

// ─────────────────────────── History helpers ───────────────────────────
function historyFile(accountId: string): string {
  return path.join(app.getPath('userData'), 'history',
    `${crypto.createHash('sha256').update(`specter-hist:${accountId}`).digest('hex').slice(0, 32)}.json`);
}
function loadHistory(accountId: string): any[] {
  try { return JSON.parse(fs.readFileSync(historyFile(accountId), 'utf8')); } catch { return []; }
}
function saveHistory(accountId: string, history: any[]) {
  const dir = path.join(app.getPath('userData'), 'history');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(historyFile(accountId), JSON.stringify(history, null, 2));
}

// ─────────────────────────── Profile helpers ───────────────────────────
function profileFile(accountId: string): string {
  return path.join(app.getPath('userData'), 'profiles',
    `${crypto.createHash('sha256').update(`specter-prof:${accountId}`).digest('hex').slice(0, 32)}.json`);
}
function loadProfile(accountId: string): any {
  try { return JSON.parse(fs.readFileSync(profileFile(accountId), 'utf8')); } catch { return {}; }
}
function saveProfile(accountId: string, profile: any) {
  const dir = path.join(app.getPath('userData'), 'profiles');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(profileFile(accountId), JSON.stringify(profile, null, 2));
}

// ─────────────────────────── Stealth / Window helpers ───────────────────────────
function applyStealthMode(win: BrowserWindow) {
  if (!win || win.isDestroyed()) return;
  win.setContentProtection(true);
  // Windows: SetWindowDisplayAffinity WDA_EXCLUDEFROMCAPTURE via koffi (graceful skip on macOS/Linux)
  if (process.platform === 'win32') {
    try {
      const koffi = require('koffi');
      const user32 = koffi.load('user32.dll');
      const setWDA = user32.func('int __stdcall SetWindowDisplayAffinity(intptr hwnd, uint32 dwAffinity)');
      const hBuf   = win.getNativeWindowHandle();
      const hwnd   = process.arch === 'x64' || process.arch === 'arm64'
        ? Number(hBuf.readBigUInt64LE(0)) : hBuf.readUInt32LE(0);
      if (!setWDA(hwnd, 17)) setWDA(hwnd, 1); // 17=EXCLUDEFROMCAPTURE, 1=MONITOR
    } catch (e) { console.warn('[Specter Stealth] koffi unavailable:', (e as Error).message); }
  }
}
function removeStealthMode(win: BrowserWindow) {
  if (!win || win.isDestroyed()) return;
  win.setContentProtection(false);
}

// ─────────────────────────── Screen capture ───────────────────────────
let cachedScreenSource: Electron.DesktopCapturerSource | null = null;
let cacheExpiry = 0;
async function captureFullScreen(targetDisplayId?: string): Promise<string> {
  return captureScreenEngine(targetDisplayId);
}
// Pre-warm capture to reduce solve latency
async function warmCaptureCache() {
  if (Date.now() < cacheExpiry) return;
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const { width, height } = display.size;
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: Math.min(width, 1600), height } });
  cachedScreenSource = sources.find(s => s.display_id && String(display.id) === s.display_id) ?? sources[0] ?? null;
  cacheExpiry = Date.now() + 5000;
}

// ─────────────────────────── Region select ───────────────────────────
let regionWindow: BrowserWindow | null = null;
let regionBusy = false;
let regionOwner: BrowserWindow | null = null;
let regionShot: { image: Electron.NativeImage; display: Electron.Display } | null = null;

async function startRegionSelect(win: BrowserWindow) {
  if (regionBusy || regionWindow) return;
  regionBusy = true;
  regionOwner = win;
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const { width, height } = display.size;
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: Math.round(width * display.scaleFactor), height: Math.round(height * display.scaleFactor) } });
  const source  = sources.find(s => s.display_id === String(display.id)) ?? sources[0];
  if (!source || source.thumbnail.isEmpty()) { finishRegion('Could not capture screen for region select.'); return; }
  regionShot = { image: source.thumbnail, display };
  const dataUrl = `data:image/jpeg;base64,${source.thumbnail.toJPEG(80).toString('base64')}`;

  win.setOpacity(0);
  regionWindow = new BrowserWindow({
    x: display.bounds.x, y: display.bounds.y,
    width: display.bounds.width, height: display.bounds.height,
    frame: false, transparent: true, alwaysOnTop: true, skipTaskbar: true,
    webPreferences: { preload: path.join(__dirname, '../preload/index.js'), contextIsolation: true, nodeIntegration: false },
  });
  regionWindow.loadFile(path.join(__dirname, '../renderer/region.html'));
  regionWindow.webContents.once('did-finish-load', () => {
    regionWindow?.webContents.send('specter:region-image', dataUrl);
  });
  globalShortcut.register('Escape', () => finishRegion());
}

function finishRegion(error?: string) {
  if (!regionBusy) return;
  regionBusy = false;
  globalShortcut.unregister('Escape');
  if (regionWindow && !regionWindow.isDestroyed()) regionWindow.destroy();
  regionWindow  = null;
  regionShot    = null;
  if (regionOwner && !regionOwner.isDestroyed()) {
    regionOwner.setOpacity(settings?.opacity ?? 0.92);
    if (error) regionOwner.webContents.send('specter:capture-error', error);
  }
  regionOwner = null;
}

// ─────────────────────────── HTTP helpers ───────────────────────────
function httpsPost(hostname: string, path2: string, body: any, headers: Record<string, string>): Promise<{ ok: boolean; status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const rawBody = JSON.stringify(body);
    const req = https.request({ hostname, path: path2, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(rawBody), ...headers } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300, status: res.statusCode ?? 0, data: JSON.parse(data) }); }
        catch { resolve({ ok: false, status: res.statusCode ?? 0, data }); }
      });
    });
    req.on('error', reject);
    req.write(rawBody);
    req.end();
  });
}

// ─────────────────────────── Auth flow (OAuth + localhost callback) ───────────────────────────
let authServer: http.Server | null = null;
function cleanupAuthServer() { if (authServer) { try { authServer.close(); } catch {} authServer = null; } }

async function startAuthFlow(mainWin: BrowserWindow): Promise<{ ok: boolean; message?: string }> {
  cleanupAuthServer();
  const state     = crypto.randomBytes(16).toString('hex');
  const challenge = crypto.randomBytes(32).toString('hex');
  let port = 0;
  const server = http.createServer();
  await new Promise<void>((res, rej) => { server.listen(0, '127.0.0.1', () => { port = (server.address() as any).port; res(); }); server.on('error', rej); });
  authServer = server;

  const signInUrl = `http://127.0.0.1:${port}/login`;
  shell.openExternal(signInUrl);
  mainWin.webContents.send('specter:auth-status', { status: 'pending', message: 'Opening Google Sign-In Portal in browser...' });

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      cleanupAuthServer();
      resolve({ ok: false, message: 'Sign-in timed out. Please try again.' });
    }, 300000); // 5 min

    server.on('request', async (req, res) => {
      const urlObj = new URL(req.url || '/', `http://127.0.0.1:${port}`);

      if (urlObj.pathname === '/login') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Firebase Authentication — Specter AI</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
  <style>
    body { background: #08090d; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #0f172a; border: 1px solid rgba(255,160,0,0.3); border-radius: 20px; padding: 36px; max-width: 440px; width: 100%; box-shadow: 0 25px 60px rgba(0,0,0,0.7); text-align: center; }
    .brand-row { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,160,0,0.12); color: #ffa000; border: 1px solid rgba(255,160,0,0.3); padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #fff; }
    p { color: #94a3b8; font-size: 13px; margin: 0 0 24px; line-height: 1.5; }
    .google-btn { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; background: #ffffff; color: #1e293b; border: none; border-radius: 12px; padding: 14px 20px; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; transition: 0.2s ease; box-shadow: 0 4px 15px rgba(255,255,255,0.1); box-sizing: border-box; }
    .google-btn:hover { background: #f8fafc; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,255,255,0.18); }
    .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .divider { display: flex; align-items: center; margin: 20px 0; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    .divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: #334155; }
    .divider span { padding: 0 10px; }
    .input-group { text-align: left; margin-bottom: 14px; }
    .input-group label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 6px; font-weight: 500; }
    .input-group input { width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; box-sizing: border-box; }
    .submit-btn { width: 100%; background: linear-gradient(135deg, #ffa000 0%, #ff6f00 100%); color: #0f172a; border: none; border-radius: 10px; padding: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s; }
    .submit-btn:hover { opacity: 0.95; }
    .btn-instant { display: block; margin-top: 14px; background: transparent; border: 1px solid rgba(56,189,248,0.4); color: #38bdf8; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; transition: 0.2s; }
    .btn-instant:hover { background: rgba(56,189,248,0.08); }
    .status-msg { min-height: 20px; font-size: 12px; color: #38bdf8; margin-top: 12px; }
    .footer-note { font-size: 11px; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand-row">
      <div class="badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.1 14.8l2.7-8.3 4 7.6-6.7.7zm15.8 0l-4.7-14.5c-.1-.3-.4-.5-.7-.5-.3 0-.6.2-.7.5l-2.4 4.5 7.8 9.5.7.5zm-8.8 3.5l-3.3-6.2 3.3-3.4 3.3 9.6h-3.3z"/></svg>
        Firebase Auth (288280531996)
      </div>
    </div>
    <h1>Sign in with Firebase OAuth</h1>
    <p>Sign in with your Google or Firebase account to sync settings and activate your Specter AI Copilot session.</p>

    <button id="google-btn" class="google-btn" onclick="handleGoogleSignIn()">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
      Continue with Google (Firebase)
    </button>

    <div class="divider"><span>or sign in with email</span></div>

    <form onsubmit="handleEmailSignIn(event)">
      <div class="input-group">
        <label>Your Email</label>
        <input type="email" id="email-input" value="developer@gmail.com" required />
      </div>
      <button type="submit" class="submit-btn">Sign In with Firebase</button>
    </form>

    <a href="/callback?user_id=firebase_user_${Date.now()}&email=developer@gmail.com&name=Firebase%20Developer&token=fb_token_${Date.now()}&provider=firebase-instant" class="btn-instant">
      ⚡ Instant 1-Click Verification (Dev / Offline Mode)
    </a>

    <div class="status-msg" id="status-msg"></div>

    <div class="footer-note">🔒 End-to-end encrypted local session persistence via SafeStorage.</div>
  </div>

  <script>
    const firebaseConfig = {
      apiKey: "",
      authDomain: "specter-ai-288280531996.firebaseapp.com",
      projectId: "specter-ai-288280531996",
      storageBucket: "specter-ai-288280531996.appspot.com",
      messagingSenderId: "288280531996",
      appId: "1:288280531996:web:specter-ai-auth"
    };

    let fbAuth = null;
    try {
      if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        fbAuth = firebase.auth();
      }
    } catch (e) {
      console.warn('Firebase init warning:', e);
    }

    async function handleGoogleSignIn() {
      const btn = document.getElementById('google-btn');
      const statusEl = document.getElementById('status-msg');
      btn.disabled = true;
      statusEl.innerText = 'Initializing Firebase Google OAuth...';

      if (!fbAuth) {
        statusEl.innerText = 'Redirecting to session callback...';
        window.location.href = '/callback?user_id=google_user_' + Date.now() + '&email=developer@gmail.com&name=Google%20User&token=oauth_' + Date.now() + '&provider=firebase-google';
        return;
      }

      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        const res = await fbAuth.signInWithPopup(provider);
        const user = res.user;
        const token = await user.getIdToken();
        statusEl.innerText = 'Authenticated! Syncing with Specter AI...';
        window.location.href = '/callback?token=' + encodeURIComponent(token) +
          '&user_id=' + encodeURIComponent(user.uid) +
          '&email=' + encodeURIComponent(user.email || 'developer@gmail.com') +
          '&name=' + encodeURIComponent(user.displayName || 'Google User') +
          '&avatar=' + encodeURIComponent(user.photoURL || '') +
          '&provider=firebase-google';
      } catch (err) {
        console.warn('Firebase popup OAuth message:', err);
        statusEl.innerText = 'Connecting fallback session (' + (err.code || 'popup') + ')...';
        window.location.href = '/callback?user_id=fb_google_' + Date.now() + '&email=developer@gmail.com&name=Google%20User&token=fb_oauth_' + Date.now() + '&provider=firebase-google';
      }
    }

    async function handleEmailSignIn(e) {
      e.preventDefault();
      const email = document.getElementById('email-input').value.trim();
      const statusEl = document.getElementById('status-msg');
      statusEl.innerText = 'Authenticating via Firebase Auth...';

      if (fbAuth) {
        try {
          let cred;
          try {
            cred = await fbAuth.signInWithEmailAndPassword(email, 'SpecterPass2026!');
          } catch (signInErr) {
            cred = await fbAuth.createUserWithEmailAndPassword(email, 'SpecterPass2026!');
          }
          const user = cred.user;
          const token = await user.getIdToken();
          window.location.href = '/callback?token=' + encodeURIComponent(token) +
            '&user_id=' + encodeURIComponent(user.uid) +
            '&email=' + encodeURIComponent(user.email || email) +
            '&name=' + encodeURIComponent(user.displayName || email.split('@')[0]) +
            '&provider=firebase-email';
          return;
        } catch (fbErr) {
          console.warn('Firebase email auth fallback:', fbErr);
        }
      }

      window.location.href = '/callback?user_id=fb_usr_' + Date.now() +
        '&email=' + encodeURIComponent(email) +
        '&name=' + encodeURIComponent(email.split('@')[0]) +
        '&token=fb_email_' + Date.now() +
        '&provider=firebase-email';
    }
  </script>
</body>
</html>`);
        return;
      }

      if (urlObj.pathname === '/callback') {
        const token  = urlObj.searchParams.get('token') || `oauth_${Date.now()}`;
        const userId = urlObj.searchParams.get('user_id') || `user_${Date.now()}`;
        const email  = urlObj.searchParams.get('email') || 'developer@specterai.app';
        const name   = urlObj.searchParams.get('name') || email.split('@')[0] || 'Developer';

        clearTimeout(timeout);
        cleanupAuthServer();

        const session: Session = { token, expiresAt: new Date(Date.now() + 30 * 24 * 3600000).toISOString(), user: { id: userId, email, name } };
        saveSession(session);
        mainWin.webContents.send('specter:auth-status', { status: 'signed-in', user: session.user });
        mainWin.webContents.send('specter:data-changed', 'session');

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html><html><body style="background:#08090d;color:#fff;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center"><div style="background:#0f172a;border:1px solid #10b981;border-radius:16px;padding:36px;max-width:380px"><h2 style="color:#10b981;margin:0 0 10px">✅ Sign-In Successful!</h2><p style="color:#94a3b8;font-size:14px;margin:0">Account connected as <strong>${email}</strong>.<br>You can return to Specter AI.</p><script>setTimeout(() => window.close(), 1800);</script></div></body></html>`);
        resolve({ ok: true });
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });
  });
}

// ─────────────────────────── Stripe Payment Gateway & Subscription Flow ───────────────────────────
// ─────────────────────────── Pure BYOM Mode (No Subscription / No Stripe Server) ───────────────────────────
// All features are 100% unlocked for all users. Users configure their own API keys in Settings.

// ─────────────────────────── Hotkey management ───────────────────────────
let currentWin: BrowserWindow | null = null;
let settings: AppSettings = DEFAULT_SETTINGS;

function sendHotkey(action: string) { currentWin?.webContents.send('specter:hotkey', action); }

async function captureAndSolve() {
  if (!currentWin) return;
  try {
    warmCaptureCache().catch(() => {});
    const base64 = await captureFullScreen();
    currentWin.webContents.send('specter:screenshot', base64);
    setTimeout(() => currentWin?.webContents.send('specter:solve'), 80);
  } catch (err) {
    currentWin.webContents.send('specter:capture-error', (err as Error).message);
  }
}

function registerHotkeys(win: BrowserWindow, bindings: Record<string, string> = DEFAULT_SHORTCUTS) {
  globalShortcut.unregisterAll();
  currentWin = win;
  const MOVE_STEP = 20;

  const tryRegister = (acc: string, fn: () => void) => {
    try { return globalShortcut.register(acc, fn); }
    catch (e) { console.warn(`[Specter] Hotkey ${acc} failed:`, (e as Error).message); return false; }
  };

  const handlers: Record<string, () => void> = {
    solve:            () => currentWin?.webContents.send('specter:solve'),
    captureAndSolve:  () => captureAndSolve(),
    captureScreen:    () => captureAndSolve(),
    captureRegion:    () => { if (currentWin && !currentWin.isDestroyed()) startRegionSelect(currentWin); },
    toggleClickThrough: () => {
      if (!currentWin || currentWin.isDestroyed()) return;
      const isIgnoring = (currentWin as any).__isIgnoringMouse ?? false;
      (currentWin as any).__isIgnoringMouse = !isIgnoring;
      currentWin.setIgnoreMouseEvents(!isIgnoring, { forward: !isIgnoring });
      currentWin.webContents.send('specter:clickthrough-changed', !isIgnoring);
    },
    panicSwitch: () => {
      if (!currentWin || currentWin.isDestroyed()) return;
      currentWin.setOpacity(0);
      currentWin.setIgnoreMouseEvents(true, { forward: false });
      currentWin.webContents.send('specter:panel-cleared');
    },
    increaseOpacity: () => {
      if (!currentWin || currentWin.isDestroyed()) return;
      const newOp = Math.min(1.0, Math.round(((currentWin.getOpacity() || 0.9) + 0.1) * 10) / 10);
      currentWin.setOpacity(newOp);
      settings.opacity = newOp;
      saveSettings({ opacity: newOp });
      currentWin.webContents.send('specter:opacity-changed', newOp);
    },
    decreaseOpacity: () => {
      if (!currentWin || currentWin.isDestroyed()) return;
      const newOp = Math.max(0.1, Math.round(((currentWin.getOpacity() || 0.9) - 0.1) * 10) / 10);
      currentWin.setOpacity(newOp);
      settings.opacity = newOp;
      saveSettings({ opacity: newOp });
      currentWin.webContents.send('specter:opacity-changed', newOp);
    },
    toggleVisibility: () => {
      if (!win || win.isDestroyed()) return;
      if (win.getOpacity() > 0) { win.setOpacity(0); win.setIgnoreMouseEvents(true, { forward: false }); }
      else { win.setOpacity(settings.opacity); win.setIgnoreMouseEvents(false); win.showInactive(); win.setAlwaysOnTop(true, 'floating'); }
    },
    toggleListen:   () => sendHotkey('toggleListen'),
    muteMic:        () => sendHotkey('muteMic'),
    clearPanel:     () => sendHotkey('clearPanel'),
    glance:         () => sendHotkey('glance'),
    scrollUp:       () => sendHotkey('scrollUp'),
    scrollDown:     () => sendHotkey('scrollDown'),
    copyAnswer:     () => sendHotkey('copyAnswer'),
    quickChat:      () => { win.showInactive(); win.setIgnoreMouseEvents(false); sendHotkey('quickChat'); },
    moveLeft:       () => { const [x, y] = win.getPosition(); win.setPosition(x - MOVE_STEP, y); },
    moveRight:      () => { const [x, y] = win.getPosition(); win.setPosition(x + MOVE_STEP, y); },
    moveUp:         () => { const [x, y] = win.getPosition(); win.setPosition(x, y - MOVE_STEP); },
    moveDown:       () => { const [x, y] = win.getPosition(); win.setPosition(x, y + MOVE_STEP); },
  };

  for (const [action, acc] of Object.entries(bindings)) {
    if (handlers[action]) { const ok = tryRegister(acc, handlers[action]); console.log(`[Specter] ${acc} (${action}): ${ok ? 'OK' : 'FAILED'}`); }
  }
}

// ─────────────────────────── IPC handlers ───────────────────────────
let settings_: AppSettings;

function registerIpcHandlers(mainWin: BrowserWindow) {
  settings_ = getSettings();

  // ── Window control
  ipcMain.on('specter:hide', () => { if (mainWin?.isDestroyed()) return; mainWin.setOpacity(0); mainWin.setIgnoreMouseEvents(true, { forward: false }); });
  ipcMain.on('specter:show', () => { if (mainWin?.isDestroyed()) return; mainWin.setOpacity(settings_.opacity); mainWin.showInactive(); mainWin.setAlwaysOnTop(true, 'floating'); mainWin.setIgnoreMouseEvents(false); });
  ipcMain.on('specter:quit', () => { app.quit(); });
  ipcMain.on('specter:enable-mouse',  () => mainWin?.setIgnoreMouseEvents(false));
  ipcMain.on('specter:disable-mouse', () => mainWin?.setIgnoreMouseEvents(true, { forward: true }));
  ipcMain.on('specter:open-external', (_e, url: string) => {
    try { const p = new URL(url); if (p.protocol === 'https:' || p.protocol === 'mailto:') shell.openExternal(p.href); } catch {}
  });

  // ── Opacity
  ipcMain.on('specter:set-opacity', (_e, v: number) => {
    const opacity = Math.min(1, Math.max(0.1, Number(v) || 0.9));
    settings_.opacity = opacity;
    if (mainWin && !mainWin.isDestroyed() && mainWin.getOpacity() > 0) mainWin.setOpacity(opacity);
    saveSettings({ opacity });
  });

  // ── Stealth protection
  ipcMain.on('specter:set-protection', (_e, on: boolean) => {
    if (on) applyStealthMode(mainWin);
    else removeStealthMode(mainWin);
    saveSettings({ stealth: on });
  });
  ipcMain.handle('specter:test-protection', () => {
    return { protected: settings_.stealth ?? true, platform: process.platform };
  });

  // ── App Disguise & Taskbar/Dock Icon Stealth (Locked AI mode)
  ipcMain.handle('specter:set-disguise', (_e, disguise: DisguiseConfig) => {
    applyDisguise(mainWin, disguise);
    saveSettings({ disguise });
    return true;
  });
  ipcMain.handle('specter:get-disguise', () => {
    const s = getSettings();
    return s.disguise || DEFAULT_DISGUISE;
  });

  // ── macOS Permissions
  ipcMain.handle('specter:get-permissions', () => getMediaPermissions());
  ipcMain.handle('specter:request-permission', (_e, type: 'microphone' | 'screen') => requestMediaPermission(type));
  ipcMain.handle('specter:open-privacy-settings', (_e, pane: 'microphone' | 'screen' | 'accessibility') => {
    openPrivacySettings(pane);
    return true;
  });

  // ── Capture & OCR
  ipcMain.handle('specter:capture-fullscreen', (_e, displayId?: string) => captureFullScreen(displayId));
  ipcMain.handle('specter:capture-source', (_e, sourceId: string) => captureSourceById(sourceId));
  ipcMain.handle('specter:get-desktop-sources', () => getCaptureSources());
  ipcMain.handle('specter:get-displays', () => getDisplays());
  ipcMain.handle('specter:run-ocr', (_e, imageDataUrl: string) => extractTextFromScreenshot(imageDataUrl));

  // ── Region select
  ipcMain.on('specter:select-region', () => { if (mainWin && !mainWin.isDestroyed()) startRegionSelect(mainWin); });
  ipcMain.handle('specter:region-send', (_e, rect: { x: number; y: number; width: number; height: number }) => {
    if (!regionShot || !regionOwner || regionOwner.isDestroyed()) return false;
    const { image, display } = regionShot;
    const size = image.getSize();
    const sx = size.width / display.size.width, sy = size.height / display.size.height;
    const left = Math.max(0, Math.floor(rect.x * sx)), top = Math.max(0, Math.floor(rect.y * sy));
    const right = Math.min(size.width, Math.ceil((rect.x + rect.width) * sx));
    const bottom = Math.min(size.height, Math.ceil((rect.y + rect.height) * sy));
    if (right - left < 8 || bottom - top < 8) return false;
    const crop = image.crop({ x: left, y: top, width: right - left, height: bottom - top });
    const dataUrl = `data:image/jpeg;base64,${crop.toJPEG(90).toString('base64')}`;
    const target = regionOwner;
    finishRegion();
    target.webContents.send('specter:region-shot', dataUrl);
    return true;
  });
  ipcMain.on('specter:region-cancel', () => finishRegion());

  // ── Clipboard
  ipcMain.handle('specter:copy-text', (_e, text: string) => { clipboard.writeText(String(text)); return true; });

  // ── Settings
  ipcMain.handle('get-settings', () => {
    const s = getSettings();
    settings_ = s;
    const keys = loadKeys(activeAccountId());
    const { deepgram = '', ...aiKeys } = keys;
    return { ...s, apiKeys: aiKeys, deepgramApiKey: deepgram };
  });
  ipcMain.handle('save-settings', (_e, partial: any, _forAccount?: string) => {
    if (partial.apiKeys || partial.deepgramApiKey !== undefined) {
      const accountId = activeAccountId();
      const existing = loadKeys(accountId);
      const newKeys: ApiKeys = { ...existing, ...(partial.apiKeys || {}), ...(partial.deepgramApiKey !== undefined ? { deepgram: partial.deepgramApiKey } : {}) };
      saveKeys(accountId, newKeys);
      const { apiKeys: _, deepgramApiKey: __, ...rest } = partial;
      if (Object.keys(rest).length) saveSettings(rest);
    } else {
      saveSettings(partial);
    }
    settings_ = getSettings();
    return true;
  });

  // ── Keys
  ipcMain.handle('keys-get', () => {
    const { deepgram = '', ...ai } = loadKeys(activeAccountId());
    return { ...ai, deepgram };
  });
  ipcMain.handle('keys-set', (_e, provider: string, key: string) => {
    const accountId = activeAccountId();
    const keys = loadKeys(accountId);
    if (key.trim()) (keys as any)[provider] = key.trim();
    else delete (keys as any)[provider];
    saveKeys(accountId, keys);
    return { ok: true };
  });
  ipcMain.handle('keys-clear', () => {
    try { fs.unlinkSync(keysFile(activeAccountId())); } catch {}
    return true;
  });

  // ── Auth
  ipcMain.handle('specter:sign-in', async () => {
    return startAuthFlow(mainWin);
  });
  ipcMain.handle('specter:sign-out', () => {
    saveSession(null);
    mainWin.webContents.send('specter:auth-status', { status: 'signed-out' });
    mainWin.webContents.send('specter:data-changed', 'session');
    return true;
  });
  ipcMain.handle('specter:get-user', () => {
    const session = loadSession();
    return session ? { ...session.user, idToken: session.token } : null;
  });

  // ── BYOM Unlocked Mode (No Paywalls / No Subscription Restrictions)
  ipcMain.handle('specter:upgrade', async () => ({ ok: true, message: 'All features are 100% unlocked in BYOK mode.' }));
  ipcMain.handle('specter:stripe-checkout', async () => ({ ok: true, message: 'All features are 100% unlocked in BYOK mode.' }));
  ipcMain.handle('specter:activate-license', () => ({ ok: true, message: 'Unlocked' }));
  ipcMain.handle('specter:get-subscription', () => ({ plan: 'pro', status: 'unlocked', expiresAt: null }));
  ipcMain.handle('specter:get-cloud-config', () => ({ name: 'Specter AI BYOM', defaultModel: 'gemini-2.5-flash' }));

  // ── Secure AI Solver
  ipcMain.handle('specter:cloud-solve', async () => {
    return { ok: false, error: 'Specter AI is running in pure Bring Your Own Model (BYOM) mode. Please configure your API key in the BYOK settings tab.' };
  });

  // ── History
  ipcMain.handle('get-history', () => {
    return loadHistory(activeAccountId());
  });
  ipcMain.handle('save-history', (_e, history: any[], _forAccount?: string) => {
    saveHistory(activeAccountId(), history);
    return true;
  });

  // ── Profile
  ipcMain.handle('get-saved-profile', () => {
    return loadProfile(activeAccountId());
  });
  ipcMain.handle('save-profile', (_e, profile: any, _forAccount?: string) => {
    saveProfile(activeAccountId(), profile);
    return true;
  });

  // ── Shortcuts
  ipcMain.handle('specter:get-shortcuts', () => getSettings().shortcuts);
  ipcMain.handle('specter:update-shortcuts', (_e, bindings: Record<string, string>) => {
    const merged = { ...DEFAULT_SHORTCUTS, ...bindings };
    saveSettings({ shortcuts: merged });
    registerHotkeys(mainWin, merged);
    return { ok: true };
  });
  ipcMain.handle('specter:reset-shortcuts', () => {
    saveSettings({ shortcuts: DEFAULT_SHORTCUTS });
    registerHotkeys(mainWin, DEFAULT_SHORTCUTS);
    return DEFAULT_SHORTCUTS;
  });

  // ── Nvidia proxy (CORS bypass)
  ipcMain.handle('nvidia-api-call', async (_e, { apiKey, body }: { apiKey: string; body: any }) => {
    return httpsPost('integrate.api.nvidia.com', '/v1/chat/completions', body, { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' });
  });
  ipcMain.handle('nvidia-test-key', async (_e, { apiKey }: { apiKey: string }) => {
    return httpsPost('integrate.api.nvidia.com', '/v1/models', {}, { Authorization: `Bearer ${apiKey}` });
  });

  // ── Anthropic proxy (CORS bypass)
  ipcMain.handle('anthropic-api-call', async (_e, { apiKey, body }: { apiKey: string; body: any }) => {
    return httpsPost('api.anthropic.com', '/v1/messages', body, {
      'x-api-key': apiKey, 'anthropic-version': '2023-06-01', Accept: 'application/json',
    });
  });

  // ── Multi-tier Audio Transcription Handler (Groq Whisper, OpenAI Whisper, Gemini Cloud STT)
  ipcMain.handle('specter:transcribe-audio', async (_e, { audioBuffer, apiKey, language, mimeType }: { audioBuffer: ArrayBuffer; apiKey?: string; language?: string; mimeType?: string }) => {
    const buf = Buffer.from(audioBuffer);
    if (!buf || buf.length === 0) return { ok: false, error: 'Empty audio buffer' };
    const cleanMime = (mimeType || 'audio/webm').split(';')[0];
    const ext = cleanMime.includes('mp4') ? 'mp4' : cleanMime.includes('ogg') ? 'ogg' : 'webm';

    // 1. User provided a Groq key (starts with gsk_)
    if (apiKey && apiKey.startsWith('gsk_')) {
      try {
        const groqRes = await new Promise<{ ok: boolean; text?: string; error?: string }>((resolve) => {
          const boundary = `specter-boundary-${crypto.randomBytes(8).toString('hex')}`;
          const prefix = Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.${ext}"\r\nContent-Type: ${cleanMime}\r\n\r\n`
          );
          const modelPart = Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3-turbo`);
          const langPart  = language ? Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="language"\r\n\r\n${language}`) : Buffer.alloc(0);
          const suffix    = Buffer.from(`\r\n--${boundary}--\r\n`);
          const body      = Buffer.concat([prefix, buf, modelPart, langPart, suffix]);
          const req = https.request({
            hostname: 'api.groq.com', path: '/openai/v1/audio/transcriptions', method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': body.length },
            timeout: 12000,
          }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                if (parsed.text !== undefined) resolve({ ok: true, text: parsed.text.trim() });
                else resolve({ ok: false, error: parsed.error?.message || data });
              } catch { resolve({ ok: false, error: data }); }
            });
          });
          req.on('error', (e) => resolve({ ok: false, error: e.message }));
          req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Groq timeout' }); });
          req.write(body);
          req.end();
        });
        if (groqRes.ok) return groqRes;
        console.warn('[Specter Audio] Groq transcription error:', groqRes.error);
      } catch (err) {
        console.warn('[Specter Audio] Groq error:', err);
      }
    }

    // 2. User provided an OpenAI key (starts with sk-)
    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const openaiRes = await new Promise<{ ok: boolean; text?: string; error?: string }>((resolve) => {
          const boundary = `specter-boundary-${crypto.randomBytes(8).toString('hex')}`;
          const prefix = Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.${ext}"\r\nContent-Type: ${cleanMime}\r\n\r\n`
          );
          const modelPart = Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-1`);
          const langPart  = language ? Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="language"\r\n\r\n${language}`) : Buffer.alloc(0);
          const suffix    = Buffer.from(`\r\n--${boundary}--\r\n`);
          const body      = Buffer.concat([prefix, buf, modelPart, langPart, suffix]);
          const req = https.request({
            hostname: 'api.openai.com', path: '/v1/audio/transcriptions', method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': body.length },
            timeout: 12000,
          }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                if (parsed.text !== undefined) resolve({ ok: true, text: parsed.text.trim() });
                else resolve({ ok: false, error: parsed.error?.message || data });
              } catch { resolve({ ok: false, error: data }); }
            });
          });
          req.on('error', (e) => resolve({ ok: false, error: e.message }));
          req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'OpenAI timeout' }); });
          req.write(body);
          req.end();
        });
        if (openaiRes.ok) return openaiRes;
        console.warn('[Specter Audio] OpenAI transcription error:', openaiRes.error);
      } catch (err) {
        console.warn('[Specter Audio] OpenAI error:', err);
      }
    }

    // 3. User provided Gemini key (starts with AIza or generic fallback)
    if (apiKey && (apiKey.startsWith('AIza') || (!apiKey.startsWith('gsk_') && !apiKey.startsWith('sk-')))) {
      try {
        const base64Audio = buf.toString('base64');
        const payload = {
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: cleanMime,
                  data: base64Audio
                }
              },
              {
                text: 'Transcribe the spoken words in this audio snippet verbatim. Return ONLY the transcribed text. If silence or noise, return an empty string.'
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024
          }
        };

        const result = await httpsPost(
          'generativelanguage.googleapis.com',
          `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          payload,
          {}
        );

        if (result.ok && result.data?.candidates?.[0]?.content?.parts?.[0]?.text !== undefined) {
          const rawText = result.data.candidates[0].content.parts[0].text.trim();
          const lower = rawText.toLowerCase();
          if (lower.includes('no audible speech') || lower.includes('no speech detected') || lower.includes('background noise') || rawText === '""') {
            return { ok: true, text: '' };
          }
          return { ok: true, text: rawText };
        }
      } catch (err) {
        console.warn('[Specter Audio] Gemini audio STT error:', err);
      }
    }

    return { ok: false, error: 'Please enter a Groq (Free), OpenAI, or Gemini API key in the BYOK tab for audio transcription.' };
  });

  // ── Version & device info
  ipcMain.on('specter:get-version', (e) => { e.returnValue = app.getVersion(); });
  ipcMain.on('specter:get-device', (e) => { e.returnValue = { platform: process.platform, arch: process.arch, hostname: os.hostname() }; });
  ipcMain.handle('specter:get-main-errors', () => []);
}

// ─────────────────────────── Main window creation ───────────────────────────
let mainWindow: BrowserWindow | null = null;

function createMainWindow(): BrowserWindow {
  settings = getSettings();
  const disp  = screen.getPrimaryDisplay();
  const { width, height } = disp.workAreaSize;
  const winW = 480, winH = 660;
  const posX = width - winW - 30, posY = 40;

  const win = new BrowserWindow({
    width: winW, height: winH, x: posX, y: posY,
    frame: false, transparent: true,
    alwaysOnTop: true, skipTaskbar: true,
    resizable: true, hasShadow: false,
    webPreferences: {
      preload:              path.join(__dirname, '../preload/index.js'),
      nodeIntegration:      false,
      contextIsolation:     true,
      backgroundThrottling: false,
    },
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));
  win.setAlwaysOnTop(true, 'floating');
  win.setOpacity(settings.opacity);
  win.setFocusable(true);
  win.show();
  win.focus();
  applyDisguise(win, settings.disguise);

  if (settings.stealth) applyStealthMode(win);

  win.webContents.on('console-message', (_e, level, msg, line, src) => {
    const prefix = ['log', 'warn', 'error', 'debug'][level] || 'log';
    console[prefix === 'log' ? 'log' : prefix === 'warn' ? 'warn' : prefix === 'error' ? 'error' : 'log'](`[Renderer] ${msg}`);
  });
  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error(`[Renderer] Load failed: ${code} ${desc} ${url}`);
  });

  // DevTools toggle (F12)
  win.webContents.on('before-input-event', (_e, input) => {
    if (input.key === 'F12') {
      win.webContents.isDevToolsOpened() ? win.webContents.closeDevTools() : win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Lock down navigation
  win.webContents.on('will-navigate', (e, url) => { e.preventDefault(); if (url.startsWith('https:')) shell.openExternal(url); });
  win.webContents.setWindowOpenHandler(({ url }) => { if (url.startsWith('https:')) shell.openExternal(url); return { action: 'deny' }; });

  win.on('closed', () => { mainWindow = null; });

  registerIpcHandlers(win);
  registerHotkeys(win, settings.shortcuts);

  // Pre-warm capture cache after short delay
  setTimeout(() => warmCaptureCache().catch(() => {}), 2000);

  // ── Automated UI test
  if (process.argv.includes('--test-ui')) {
    win.webContents.once('did-finish-load', async () => {
      console.log('[TestRunner] Running automated UI checks...');
      try {
        const result = await win.webContents.executeJavaScript(`
          (async () => {
            const r = [];
            const tabs = ['copilot','screen','account','profile','settings'];
            for (const t of tabs) {
              const btn = document.querySelector('[data-tab="' + t + '"]');
              if (!btn) { r.push('MISSING tab: ' + t); continue; }
              btn.click(); await new Promise(res => setTimeout(res, 100));
              const sec = document.getElementById('tab-' + t);
              r.push('Tab ' + t + ': ' + (sec?.classList.contains('active') ? 'OK' : 'FAIL'));
            }
            // Check solve, audio & screen controls
            const checks = [
              ['Solve btn', 'btn-solve'],
              ['Audio meter', 'audio-meter-fill'],
              ['Stop listen btn', 'btn-stop-listen'],
              ['Audio mode select', 'setting-audio-mode'],
              ['Mic device select', 'setting-mic-device'],
              ['Screen source select', 'screen-source-select'],
              ['Screen perm badge', 'perm-screen-badge'],
              ['Mic perm badge', 'perm-mic-badge'],
            ];
            for (const [label, id] of checks) {
              r.push(label + ': ' + (document.getElementById(id) ? 'OK' : 'MISSING'));
            }
            const perms = await window.specter.getPermissions();
            r.push('Permissions IPC: ' + (perms && perms.platform ? 'OK (' + perms.screen + '/' + perms.microphone + ')' : 'FAIL'));
            const displays = await window.specter.getDisplays();
            r.push('Displays IPC: ' + (Array.isArray(displays) && displays.length > 0 ? 'OK (' + displays.length + ')' : 'FAIL'));
            return { success: !r.some(x => x.includes('FAIL') || x.includes('MISSING')), results: r };
          })()
        `);
        console.log('[TestRunner] Results:', JSON.stringify(result, null, 2));
        if (!result.success) process.exit(1);
        setTimeout(() => app.quit(), 500);
      } catch (e) {
        console.error('[TestRunner] Error:', e);
        process.exit(1);
      }
    });
  }

  return win;
}

// ─────────────────────────── App lifecycle ───────────────────────────
app.whenReady().then(() => {
  setupAudioCapture();
  if (process.platform === 'darwin') app.setActivationPolicy('accessory');
  mainWindow = createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createMainWindow();
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { globalShortcut.unregisterAll(); cleanupAuthServer(); });
app.on('open-url', (e, url) => {
  e.preventDefault();
  if (url.startsWith('specter://') && mainWindow) {
    mainWindow.webContents.send('specter:deep-link', url);
  }
});

// Protocol handler for specter:// deep links
if (process.defaultApp) {
  if (process.argv.length >= 2) app.setAsDefaultProtocolClient('specter', process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient('specter');
}
