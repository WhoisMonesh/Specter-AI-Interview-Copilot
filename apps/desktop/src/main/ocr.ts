/**
 * Specter AI On-Device OCR Engine
 * Preprocesses screenshots (lossless PNG + 2x upscaling for small regions) and uses
 * tesseract.js to extract text, code, MCQs, and equations locally.
 */
import { createWorker } from 'tesseract.js';
import { nativeImage } from 'electron';

let workerInstance: any = null;
let isInitializing = false;

async function getOCRWorker() {
  if (workerInstance) return workerInstance;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 100));
    }
    if (workerInstance) return workerInstance;
  }

  isInitializing = true;
  try {
    const worker = await createWorker('eng');
    try {
      await worker.setParameters({
        preserve_interword_spaces: '1',
      });
    } catch {}
    workerInstance = worker;
    console.log('[OCR] Tesseract OCR engine initialized successfully');
    return workerInstance;
  } catch (err) {
    console.error('[OCR] Failed to initialize Tesseract worker:', err);
    return null;
  } finally {
    isInitializing = false;
  }
}

function preprocessImageForOcr(imageDataUrl: string): Buffer {
  try {
    let img = nativeImage.createFromDataURL(imageDataUrl);
    if (!img.isEmpty()) {
      const size = img.getSize();
      // Upscale smaller region captures (2x) so small exponents/symbols are crisp for Tesseract
      if (size.width > 0 && size.width < 1400) {
        const scale = size.width < 700 ? 2.5 : 2;
        img = img.resize({
          width: Math.round(size.width * scale),
          height: Math.round(size.height * scale),
          quality: 'best',
        });
      }
      return img.toPNG();
    }
  } catch (err) {
    console.warn('[OCR] Image preprocessing fallback:', err);
  }

  const base64Data = imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

function cleanOcrText(raw: string): string {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;
      // Drop pure UI-chrome noise lines made of many short 1-3 char uppercase fragments
      const tokens = line.split(/\s+/);
      if (tokens.length >= 6 && tokens.every(t => t.length <= 3 && /^[A-Z0-9©®™|()[\]]+$/.test(t))) {
        return false;
      }
      return true;
    })
    .join('\n')
    .trim();
}

export async function extractTextFromScreenshot(imageDataUrl: string): Promise<string> {
  try {
    const worker = await getOCRWorker();
    if (!worker) {
      console.warn('[OCR] Worker unavailable');
      return '';
    }

    const imgBuffer = preprocessImageForOcr(imageDataUrl);
    const ret = await worker.recognize(imgBuffer);
    const rawText = ret.data.text ? ret.data.text.trim() : '';
    const cleaned = cleanOcrText(rawText);

    console.log(`[OCR] Extracted ${cleaned.length} characters (raw ${rawText.length}) from screen capture`);
    return cleaned || rawText;
  } catch (err) {
    console.error('[OCR] OCR extraction error:', err);
    return '';
  }
}
