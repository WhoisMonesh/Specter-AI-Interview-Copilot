/**
 * Screen & Region Capture Engine for Specter AI Copilot
 * Supports multi-monitor displays, window capture, Retina high-DPI scaling, and macOS permission checks.
 */
import { desktopCapturer, screen, systemPreferences, nativeImage } from 'electron';

export interface CaptureSourceInfo {
  id: string;
  name: string;
  display_id: string;
  type: 'screen' | 'window';
  thumbnail: string;
}

export interface DisplayInfo {
  id: string;
  label: string;
  width: number;
  height: number;
  scaleFactor: number;
  isPrimary: boolean;
}

export function checkScreenCapturePermission(): { granted: boolean; status: string } {
  if (process.platform !== 'darwin') {
    return { granted: true, status: 'granted' };
  }
  try {
    const status = systemPreferences.getMediaAccessStatus('screen');
    return { granted: status === 'granted', status };
  } catch {
    return { granted: false, status: 'unknown' };
  }
}

export function getDisplays(): DisplayInfo[] {
  const primary = screen.getPrimaryDisplay();
  return screen.getAllDisplays().map((d, idx) => ({
    id: String(d.id),
    label: d.label || `Display ${idx + 1} (${d.size.width}x${d.size.height})`,
    width: d.size.width,
    height: d.size.height,
    scaleFactor: d.scaleFactor || 1,
    isPrimary: d.id === primary.id
  }));
}

export async function getCaptureSources(): Promise<CaptureSourceInfo[]> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 320, height: 180 },
      fetchWindowIcons: false
    });
    return sources
      .filter(s => s.name && s.name !== 'Specter AI Copilot' && s.name !== 'Notes')
      .map(s => ({
        id: s.id,
        name: s.name,
        display_id: s.display_id || '',
        type: s.id.startsWith('screen:') ? 'screen' : 'window',
        thumbnail: s.thumbnail && !s.thumbnail.isEmpty()
          ? `data:image/jpeg;base64,${s.thumbnail.toJPEG(70).toString('base64')}`
          : ''
      }));
  } catch (err) {
    console.error('[Capture] Failed to enumerate desktop sources:', err);
    return [];
  }
}

export async function captureFullScreen(targetDisplayId?: string): Promise<string> {
  const allDisplays = screen.getAllDisplays();
  const display = targetDisplayId
    ? (allDisplays.find(d => String(d.id) === targetDisplayId) || screen.getPrimaryDisplay())
    : screen.getDisplayNearestPoint(screen.getCursorScreenPoint());

  const { width, height } = display.size;
  const scale = display.scaleFactor || 1;
  // Cap width at 2400px for crisp OCR without excessive payload size
  const targetW = Math.min(Math.round(width * scale), 2400);
  const targetH = Math.round((targetW / width) * height);

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: targetW, height: targetH }
  });

  if (!sources || sources.length === 0) {
    throw new Error('No screen sources returned by OS. Check Screen Recording permissions.');
  }

  const source = sources.find(s => s.display_id && String(display.id) === s.display_id) ?? sources[0];
  if (!source || source.thumbnail.isEmpty()) {
    throw new Error('Captured screen image is empty. Grant Screen Recording permission in macOS System Settings.');
  }

  return `data:image/jpeg;base64,${source.thumbnail.toJPEG(95).toString('base64')}`;
}

export async function captureSourceById(sourceId: string): Promise<string> {
  const primary = screen.getPrimaryDisplay();
  const scale = primary.scaleFactor || 1;
  const targetW = Math.min(Math.round(primary.size.width * scale), 2400);
  const targetH = Math.min(Math.round(primary.size.height * scale), 1600);

  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: { width: targetW, height: targetH }
  });

  const source = sources.find(s => s.id === sourceId);
  if (!source) {
    throw new Error(`Selected capture source (${sourceId}) is no longer available.`);
  }
  if (source.thumbnail.isEmpty()) {
    throw new Error('Captured window/screen is empty. Ensure the window is not minimized and Screen Recording permission is granted.');
  }

  return `data:image/jpeg;base64,${source.thumbnail.toJPEG(95).toString('base64')}`;
}

export async function cropImageRect(
  fullImageDataUrl: string,
  rect: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const img = nativeImage.createFromDataURL(fullImageDataUrl);
  const size = img.getSize();

  const primaryDisplay = screen.getPrimaryDisplay();
  const scale = primaryDisplay.scaleFactor || 1;

  const cropX = Math.max(0, Math.min(size.width, Math.floor(rect.x * scale)));
  const cropY = Math.max(0, Math.min(size.height, Math.floor(rect.y * scale)));
  const cropW = Math.max(1, Math.min(size.width - cropX, Math.floor(rect.width * scale)));
  const cropH = Math.max(1, Math.min(size.height - cropY, Math.floor(rect.height * scale)));

  const cropped = img.crop({
    x: cropX,
    y: cropY,
    width: cropW,
    height: cropH
  });

  return `data:image/jpeg;base64,${cropped.toJPEG(95).toString('base64')}`;
}
