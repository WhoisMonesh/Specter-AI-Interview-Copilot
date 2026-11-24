import { contextBridge, ipcRenderer } from 'electron';

let lastRegionImage: any = null;
const regionImageListeners = new Set<(img: any) => void>();
ipcRenderer.on('specter:region-image', (_e, img) => {
  lastRegionImage = img;
  regionImageListeners.forEach(cb => cb(img));
});

contextBridge.exposeInMainWorld('specter', {
  // ── Window control
  openExternal:  (url)  => ipcRenderer.send('specter:open-external', url),
  hide:          ()     => ipcRenderer.send('specter:hide'),
  show:          ()     => ipcRenderer.send('specter:show'),
  quit:          ()     => ipcRenderer.send('specter:quit'),
  enableMouse:   ()     => ipcRenderer.send('specter:enable-mouse'),
  disableMouse:  ()     => ipcRenderer.send('specter:disable-mouse'),

  // ── Version / device
  getVersion: ()        => ipcRenderer.sendSync('specter:get-version'),
  getDevice:  ()        => ipcRenderer.sendSync('specter:get-device'),

  // ── Opacity / stealth / disguise (Locked AI mode)
  setOpacity:     (v)   => ipcRenderer.send('specter:set-opacity', v),
  setProtection:  (on)  => ipcRenderer.send('specter:set-protection', !!on),
  testProtection: ()    => ipcRenderer.invoke('specter:test-protection'),
  setDisguise:    (disguise: any) => ipcRenderer.invoke('specter:set-disguise', disguise),
  getDisguise:    ()    => ipcRenderer.invoke('specter:get-disguise'),

  // ── Capture & OCR
  captureFullscreen:   (displayId?: string) => ipcRenderer.invoke('specter:capture-fullscreen', displayId),
  captureSource:       (sourceId: string)   => ipcRenderer.invoke('specter:capture-source', sourceId),
  getDesktopSources:   ()                   => ipcRenderer.invoke('specter:get-desktop-sources'),
  getDisplays:         ()                   => ipcRenderer.invoke('specter:get-displays'),
  runOcr:              (imageDataUrl: string) => ipcRenderer.invoke('specter:run-ocr', imageDataUrl),

  // ── macOS Permissions
  getPermissions:      ()                   => ipcRenderer.invoke('specter:get-permissions'),
  requestPermission:   (type: 'microphone' | 'screen') => ipcRenderer.invoke('specter:request-permission', type),
  openPrivacySettings: (pane: 'microphone' | 'screen' | 'accessibility') => ipcRenderer.invoke('specter:open-privacy-settings', pane),

  // ── Region select
  selectRegion:        ()         => ipcRenderer.send('specter:select-region'),
  regionSend:          (rect)     => ipcRenderer.invoke('specter:region-send', rect),
  sendRegionSelected:  (rect)     => ipcRenderer.invoke('specter:region-send', rect),
  regionCancel:        ()         => ipcRenderer.send('specter:region-cancel'),
  cancelRegion:        ()         => ipcRenderer.send('specter:region-cancel'),
  onRegionShot:    (cb) => { const l = (_e, url) => cb(url); ipcRenderer.on('specter:region-shot', l); return () => ipcRenderer.removeListener('specter:region-shot', l); },
  onRegionImage:   (cb) => {
    regionImageListeners.add(cb);
    if (lastRegionImage) cb(lastRegionImage);
    return () => regionImageListeners.delete(cb);
  },

  // ── Clipboard
  copyText: (text) => ipcRenderer.invoke('specter:copy-text', text),

  // ── Settings & Keys
  getSettings:  ()                      => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings, forAccount)  => ipcRenderer.invoke('save-settings', settings, forAccount),
  getKeys:      ()                      => ipcRenderer.invoke('keys-get'),
  setKey:       (provider, key)         => ipcRenderer.invoke('keys-set', provider, key),
  clearKeys:    ()                      => ipcRenderer.invoke('keys-clear'),

  // ── Auth
  signIn:         ()        => ipcRenderer.invoke('specter:sign-in'),
  signOut:        ()        => ipcRenderer.invoke('specter:sign-out'),
  getUser:        ()        => ipcRenderer.invoke('specter:get-user'),
  onAuthStatus:   (cb) => { const l = (_, s) => cb(s); ipcRenderer.on('specter:auth-status', l); return () => ipcRenderer.removeListener('specter:auth-status', l); },

  // ── Subscription & Stripe
  upgrade:             ()          => ipcRenderer.invoke('specter:upgrade'),
  startStripeCheckout: (plan)      => ipcRenderer.invoke('specter:stripe-checkout', plan),
  activateLicense:     (key)       => ipcRenderer.invoke('specter:activate-license', key),
  getSubscription:     ()          => ipcRenderer.invoke('specter:get-subscription'),
  getCloudConfig:      ()          => ipcRenderer.invoke('specter:get-cloud-config'),
  cloudSolve:          (args)      => ipcRenderer.invoke('specter:cloud-solve', args),
  onSubStatus:         (cb) => { const l = (_, s) => cb(s); ipcRenderer.on('specter:sub-status', l); return () => ipcRenderer.removeListener('specter:sub-status', l); },

  // ── History & Profile
  getHistory:       ()                      => ipcRenderer.invoke('get-history'),
  saveHistory:      (history, forAccount)   => ipcRenderer.invoke('save-history', history, forAccount),
  getSavedProfile:  ()                      => ipcRenderer.invoke('get-saved-profile'),
  saveProfile:      (profile, forAccount)   => ipcRenderer.invoke('save-profile', profile, forAccount),

  // ── Shortcuts
  getShortcuts:     ()          => ipcRenderer.invoke('specter:get-shortcuts'),
  updateShortcuts:  (bindings)  => ipcRenderer.invoke('specter:update-shortcuts', bindings),
  resetShortcuts:   ()          => ipcRenderer.invoke('specter:reset-shortcuts'),

  // ── API proxies (CORS bypass)
  nvidiaApiCall:   (apiKey, body)  => ipcRenderer.invoke('nvidia-api-call',    { apiKey, body }),
  nvidiaTestKey:   (apiKey)        => ipcRenderer.invoke('nvidia-test-key',    { apiKey }),
  anthropicApiCall: (apiKey, body) => ipcRenderer.invoke('anthropic-api-call', { apiKey, body }),

  // ── Multi-tier audio transcription
  transcribeAudio: (audioBuffer, apiKey, language, mimeType) => ipcRenderer.invoke('specter:transcribe-audio', { audioBuffer, apiKey, language, mimeType }),

  // ── Event listeners
  onHotkey:        (cb) => { const l = (_, a) => cb(String(a)); ipcRenderer.on('specter:hotkey', l); return () => ipcRenderer.removeListener('specter:hotkey', l); },
  onSolve:         (cb) => { const l = () => cb(); ipcRenderer.on('specter:solve', l); return () => ipcRenderer.removeListener('specter:solve', l); },
  onScreenshot:    (cb) => { const l = (_, b64) => cb(b64); ipcRenderer.on('specter:screenshot', l); return () => ipcRenderer.removeListener('specter:screenshot', l); },
  onCaptureError:  (cb) => { const l = (_, msg) => cb(msg); ipcRenderer.on('specter:capture-error', l); return () => ipcRenderer.removeListener('specter:capture-error', l); },
  onDataChanged:   (cb) => { const l = (_, kind) => cb(kind); ipcRenderer.on('specter:data-changed', l); return () => ipcRenderer.removeListener('specter:data-changed', l); },
  onDeepLink:      (cb) => { const l = (_, url) => cb(url); ipcRenderer.on('specter:deep-link', l); return () => ipcRenderer.removeListener('specter:deep-link', l); },
  onMainError:     (cb) => { const l = (_, e) => cb(e); ipcRenderer.on('specter:main-error', l); return () => ipcRenderer.removeListener('specter:main-error', l); },
  getPendingMainErrors: () => ipcRenderer.invoke('specter:get-main-errors'),

  // ── Region events (alias for region selector page)
  onRegionEnter:  (cb) => { const l = () => cb(); ipcRenderer.on('specter:region-enter', l); return () => ipcRenderer.removeListener('specter:region-enter', l); },
});
