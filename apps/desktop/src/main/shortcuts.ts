/**
 * Global Keyboard Shortcut Engine for Ghostly Copilot
 * Supports configurable hotkeys across macOS (Cmd/Opt) and Windows/Linux (Ctrl/Alt)
 */
import { globalShortcut, BrowserWindow } from 'electron';

export interface ShortcutBindings {
  toggleOverlay: string;
  screenshotSolve: string;
  selectRegion: string;
  toggleListening: string;
  askAi: string;
  clearAnswer: string;
  toggleClickThrough: string;
  muteMic: string;
}

export const DEFAULT_SHORTCUTS: ShortcutBindings = {
  toggleOverlay: process.platform === 'darwin' ? 'Command+Alt+H' : 'Control+Alt+H',
  screenshotSolve: process.platform === 'darwin' ? 'Command+Alt+S' : 'Control+Alt+S',
  selectRegion: process.platform === 'darwin' ? 'Command+Alt+R' : 'Control+Alt+R',
  toggleListening: process.platform === 'darwin' ? 'Command+Alt+L' : 'Control+Alt+L',
  askAi: process.platform === 'darwin' ? 'Command+Alt+Space' : 'Control+Alt+Space',
  clearAnswer: process.platform === 'darwin' ? 'Command+Alt+C' : 'Control+Alt+C',
  toggleClickThrough: process.platform === 'darwin' ? 'Command+Alt+P' : 'Control+Alt+P',
  muteMic: process.platform === 'darwin' ? 'Command+Alt+M' : 'Control+Alt+M',
};

export class ShortcutManager {
  private bindings: ShortcutBindings = { ...DEFAULT_SHORTCUTS };
  private win: BrowserWindow | null = null;
  private onActionCallback: ((action: string) => void) | null = null;

  constructor(win: BrowserWindow, onAction: (action: string) => void) {
    this.win = win;
    this.onActionCallback = onAction;
  }

  public registerAll(customBindings?: Partial<ShortcutBindings>) {
    if (customBindings) {
      this.bindings = { ...this.bindings, ...customBindings };
    }

    globalShortcut.unregisterAll();

    const actions: Array<[keyof ShortcutBindings, string]> = [
      ['toggleOverlay', 'toggle-overlay'],
      ['screenshotSolve', 'screenshot-solve'],
      ['selectRegion', 'select-region'],
      ['toggleListening', 'toggle-listening'],
      ['askAi', 'ask-ai'],
      ['clearAnswer', 'clear-answer'],
      ['toggleClickThrough', 'toggle-click-through'],
      ['muteMic', 'mute-mic'],
    ];

    for (const [key, actionName] of actions) {
      const accelerator = this.bindings[key];
      if (!accelerator) continue;

      try {
        const ok = globalShortcut.register(accelerator, () => {
          console.log(`[Hotkeys] Triggered: ${actionName} (${accelerator})`);
          if (this.onActionCallback) {
            this.onActionCallback(actionName);
          }
          if (this.win && !this.win.isDestroyed()) {
            this.win.webContents.send('ghostly:hotkey', actionName);
          }
        });

        if (!ok) {
          console.warn(`[Hotkeys] Failed to register: ${accelerator} for ${actionName}`);
        }
      } catch (err) {
        console.error(`[Hotkeys] Error registering ${accelerator}:`, err);
      }
    }
  }

  public unregisterAll() {
    globalShortcut.unregisterAll();
  }

  public getBindings(): ShortcutBindings {
    return { ...this.bindings };
  }
}
