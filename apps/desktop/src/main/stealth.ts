/**
 * Cross-Platform Stealth Engine for Specter AI
 * Makes overlay windows invisible to screen recording and screen sharing tools
 * (Zoom, Google Meet, MS Teams, Slack, OBS, Discord, ScreenCaptureKit, etc.)
 * while maintaining 100% interactive clickability for buttons, tabs and inputs.
 */
import { BrowserWindow } from 'electron';

export const WDA_NONE = 0;
export const WDA_MONITOR = 1;
export const WDA_EXCLUDEFROMCAPTURE = 17; // 0x00000011

let win32AffinityFunc: ((hwnd: number | bigint, affinity: number) => number) | null = null;
let win32Tested = false;

function initWin32Affinity() {
  if (win32Tested || process.platform !== 'win32') return;
  win32Tested = true;
  try {
    const koffi = require('koffi');
    const user32 = koffi.load('user32.dll');
    win32AffinityFunc = user32.func('int __stdcall SetWindowDisplayAffinity(intptr hwnd, uint32 dwAffinity)');
    console.log('[Stealth] Win32 SetWindowDisplayAffinity loaded via Koffi');
  } catch (e) {
    console.warn('[Stealth] Koffi Win32 FFI not available, falling back to Electron setContentProtection:', e);
  }
}

export function applyStealthMode(win: BrowserWindow, enable: boolean = true) {
  if (!win || win.isDestroyed()) return;

  try {
    // 1. Core Electron Native Content Protection
    // - On macOS: invokes [window setSharingType:NSWindowSharingNone], excluding the window from ScreenCaptureKit,
    //   Zoom, Google Meet, Microsoft Teams, OBS, QuickTime Screen Record, etc.
    // - On Windows: calls SetWindowDisplayAffinity internally.
    win.setContentProtection(enable);

    // 2. Platform-specific stealth & interaction optimizations
    if (process.platform === 'darwin') {
      // macOS: Use 'floating' level instead of 'screen-saver' so that mouse clicks,
      // text inputs, and tabs receive full OS focus and are NOT swallowed by macOS window server!
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      win.setAlwaysOnTop(true, 'floating');
    } else if (process.platform === 'win32') {
      // Windows: Apply deepest hardware-level capture exclusion (WDA_EXCLUDEFROMCAPTURE)
      initWin32Affinity();
      if (win32AffinityFunc) {
        try {
          const hwndBuf = win.getNativeWindowHandle();
          const hwnd = process.arch === 'x64' || process.arch === 'arm64'
            ? hwndBuf.readBigUInt64LE(0)
            : hwndBuf.readUInt32LE(0);

          const affinity = enable ? WDA_EXCLUDEFROMCAPTURE : WDA_NONE;
          const res = win32AffinityFunc(hwnd, affinity);
          if (!res && enable) {
            win32AffinityFunc(hwnd, WDA_MONITOR);
          }
        } catch (err) {
          console.warn('[Stealth] Direct Win32 SetWindowDisplayAffinity error:', err);
        }
      }
      win.setAlwaysOnTop(true, 'floating');
    } else {
      // Linux: Window manager floating flags
      win.setAlwaysOnTop(true);
      win.setSkipTaskbar(true);
    }

    console.log(`[Stealth] Stealth mode ${enable ? 'ENABLED' : 'DISABLED'} on ${process.platform} with interactive floating tier`);
  } catch (err) {
    console.error('[Stealth] Failed to apply stealth mode:', err);
  }
}

export function setClickThrough(win: BrowserWindow, clickThrough: boolean) {
  if (!win || win.isDestroyed()) return;
  try {
    if (clickThrough) {
      win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      win.setIgnoreMouseEvents(false);
    }
  } catch (err) {
    console.error('[Stealth] Error setting click-through:', err);
  }
}

export function setWindowOpacity(win: BrowserWindow, opacity: number) {
  if (!win || win.isDestroyed()) return;
  try {
    const clamped = Math.max(0.1, Math.min(1.0, opacity));
    win.setOpacity(clamped);
  } catch (err) {
    console.error('[Stealth] Error setting opacity:', err);
  }
}
