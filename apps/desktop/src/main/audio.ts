/**
 * Audio System Manager for Specter Copilot
 * Handles desktop loopback audio capture permissions, macOS privacy checks, and media streaming
 */
import { session, systemPreferences, desktopCapturer, shell } from 'electron';

export interface MediaPermissionsStatus {
  platform: string;
  microphone: 'granted' | 'denied' | 'restricted' | 'not-determined' | 'unknown';
  screen: 'granted' | 'denied' | 'restricted' | 'not-determined' | 'unknown';
}

export async function getMediaPermissions(): Promise<MediaPermissionsStatus> {
  if (process.platform !== 'darwin') {
    return {
      platform: process.platform,
      microphone: 'granted',
      screen: 'granted'
    };
  }

  let micStatus: any = 'unknown';
  let screenStatus: any = 'unknown';
  try {
    micStatus = systemPreferences.getMediaAccessStatus('microphone');
  } catch {}
  try {
    screenStatus = systemPreferences.getMediaAccessStatus('screen');
  } catch {}

  // Empirical check: on macOS 15+/26+/27+, getMediaAccessStatus('screen') can return stale 'denied'
  // even when desktopCapturer succeeds. Verify by requesting a tiny 8x8 thumbnail.
  if (screenStatus !== 'granted') {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 8, height: 8 }
      });
      if (sources && sources.length > 0 && !sources[0].thumbnail.isEmpty()) {
        screenStatus = 'granted';
      }
    } catch {}
  }

  return {
    platform: process.platform,
    microphone: micStatus,
    screen: screenStatus
  };
}

export async function requestMediaPermission(type: 'microphone' | 'screen'): Promise<{ granted: boolean; status: string }> {
  if (process.platform !== 'darwin') {
    return { granted: true, status: 'granted' };
  }

  if (type === 'microphone') {
    try {
      const current = systemPreferences.getMediaAccessStatus('microphone');
      if (current === 'granted') return { granted: true, status: 'granted' };
      const granted = await systemPreferences.askForMediaAccess('microphone');
      return { granted, status: systemPreferences.getMediaAccessStatus('microphone') };
    } catch (err) {
      console.warn('[Audio] Microphone access request failed:', err);
      return { granted: false, status: 'error' };
    }
  }

  if (type === 'screen') {
    const current = systemPreferences.getMediaAccessStatus('screen');
    if (current === 'granted') return { granted: true, status: 'granted' };
    // Trigger macOS Screen Recording prompt by querying desktopCapturer once
    try {
      await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1, height: 1 } });
    } catch {}
    const updated = systemPreferences.getMediaAccessStatus('screen');
    if (updated !== 'granted') {
      openPrivacySettings('screen');
    }
    return { granted: updated === 'granted', status: updated };
  }

  return { granted: false, status: 'unknown' };
}

export function openPrivacySettings(pane: 'microphone' | 'screen' | 'accessibility') {
  if (process.platform !== 'darwin') return;
  const urls: Record<string, string> = {
    microphone: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone',
    screen: 'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
    accessibility: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility'
  };
  if (urls[pane]) {
    shell.openExternal(urls[pane]).catch(() => {});
  }
}

export function setupAudioCapture() {
  const allowedPermissions = [
    'media',
    'microphone',
    'audioCapture',
    'desktopCapture',
    'display-capture'
  ];

  // Auto-grant media and loopback capture permissions to our internal renderer
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    if (allowedPermissions.includes(permission)) {
      callback(true);
      return;
    }
    callback(false);
  });

  if (session.defaultSession.setPermissionCheckHandler) {
    session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
      return allowedPermissions.includes(permission);
    });
  }

  // Intercept getDisplayMedia() requests to provide a valid screen source + system audio loopback.
  // Passing a valid video source is required by Chromium/Electron even when only audio is consumed.
  if (session.defaultSession.setDisplayMediaRequestHandler) {
    session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({
          types: ['screen'],
          thumbnailSize: { width: 16, height: 16 }
        });
        if (sources && sources.length > 0) {
          callback({
            video: sources[0],
            audio: 'loopback'
          });
          return;
        }
      } catch (err) {
        console.warn('[Audio] Failed to resolve display source for loopback:', err);
      }
      callback({});
    });
  }

  console.log('[Audio] System audio loopback, ScreenCaptureKit handler, and microphone permissions configured');
}
