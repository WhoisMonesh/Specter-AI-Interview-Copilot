/**
 * Specter AI Copilot — Renderer Process (v5.0.0)
 * Complete rewrite: all tabs functional, real STT, BYOK, auth, subscription
 */
(() => {
'use strict';

const specter = window.specter;

// ─────────────────────────── State ───────────────────────────
let isListening     = true;
let isMuted         = false;
let isGlance        = false;
let isClickThrough  = false;
let currentProvider = 'gemini';
let currentModel    = 'gemini-2.5-flash';
let currentKeys     = {};
let deepgramKey     = '';
let currentProfile  = {};
let currentSub      = { plan: 'pro', status: 'unlocked', expiresAt: null };
let currentUser     = null;
let lastCapture     = null;
let sessionQCount   = 0;
let currentDisguise = { enabled: false, preset: 'notes', customName: '', hideIcon: true };

// STT
let recognition          = null;
let accumulatedText      = '';
let speechError          = false;
let isUsingDeepgram      = false;
let dgSocket             = null;
let dgStream             = null;
let dgRecorder           = null;

// Whisper / Audio Mixer & VAD
let whisperRecorder    = null;
let whisperChunks      = [];
let whisperStream      = null;
let micRawStream       = null;
let sysRawStream       = null;
let audioCtx           = null;
let analyserNode       = null;
let meterTimer         = null;
let hadSpeechInChunk   = false;
let isWhisperRecording = false;
let audioMode          = 'both'; // 'both' | 'system' | 'mic'
let selectedMicId      = '';
let qaHistory          = [];

// ─────────────────────────── DOM helpers ───────────────────────────
const $  = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// Key elements
const statusPill         = $('status-pill');
const tierPill           = $('tier-pill');
const userPill           = $('user-pill');
const liveTranscript     = $('live-transcript');
const answerContent      = $('answer-content');
const detectedType       = $('detected-type');
const activeProviderTag  = $('active-provider-tag');
const chatInput          = $('chat-input');
const opacityVal         = $('opacity-val');
const licenseMsg         = $('license-msg');
const authHint           = $('auth-hint');

// ─────────────────────────── Status helpers ───────────────────────────
function setStatus(text, cls = '') {
  if (!statusPill) return;
  statusPill.textContent = text;
  statusPill.className = 'status-pill ' + cls;
}
function setDetected(text) { if (detectedType) detectedType.textContent = text; }
function setProviderTag(text) { if (activeProviderTag) activeProviderTag.textContent = text; }
function showMsg(el, text, ok = true) {
  if (!el) return;
  el.textContent = text;
  el.style.color = ok ? '#00e676' : '#ff5252';
  setTimeout(() => { if (el) el.textContent = ''; }, 4000);
}

// ─────────────────────────── Tab system ───────────────────────────
function setupTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      $$('.tab-content').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      const target = $('tab-' + btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Settings gear → go to BYOK tab
  const settingsBtn = $('btn-settings-tab');
  if (settingsBtn) settingsBtn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-content').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-tab="settings"]')?.classList.add('active');
    $('tab-settings')?.classList.add('active');
  });
}

// ─────────────────────────── App Disguise & Header Camouflage ───────────────────────────
function applyDisguiseUI(disguise) {
  const brandContainer = $('brand-container');
  const brandIcon = $('brand-icon');
  const brandName = $('brand-name');
  const disguiseBtn = $('btn-disguise');

  if (disguiseBtn) {
    if (disguise.enabled) disguiseBtn.classList.add('active');
    else disguiseBtn.classList.remove('active');
  }

  if (!brandIcon || !brandName) return;

  if (disguise.enabled) {
    let iconChar = '📝';
    let label = 'Notes';
    switch (disguise.preset) {
      case 'blank':
        iconChar = '';
        label = '';
        break;
      case 'notes':
        iconChar = '📝';
        label = 'Notes';
        break;
      case 'calculator':
        iconChar = '🧮';
        label = 'Calculator';
        break;
      case 'terminal':
        iconChar = '⚡';
        label = 'Terminal Monitor';
        break;
      case 'chrome':
        iconChar = '🌐';
        label = 'Google Chrome Helper';
        break;
      case 'zoom':
        iconChar = '🔊';
        label = 'Zoom Audio Device';
        break;
      case 'custom':
        iconChar = '📌';
        label = disguise.customName?.trim() || 'Notes';
        break;
      default:
        iconChar = '📝';
        label = 'Notes';
    }

    if (disguise.preset === 'blank') {
      brandIcon.style.display = 'none';
      brandName.textContent = '';
      if (brandContainer) brandContainer.style.visibility = 'hidden';
    } else {
      if (brandContainer) brandContainer.style.visibility = 'visible';
      brandIcon.style.display = 'inline-flex';
      brandIcon.className = 'disguise-icon';
      brandIcon.textContent = iconChar;
      brandName.textContent = label;
    }
    document.title = label || ' ';
  } else {
    if (brandContainer) brandContainer.style.visibility = 'visible';
    brandIcon.style.display = '';
    brandIcon.className = 'ghost-orb pulse';
    brandIcon.textContent = '';
    brandName.innerHTML = 'SPECTER <span class="badge-ai">AI</span>';
    document.title = 'Specter AI Copilot';
  }
}

// ─────────────────────────── Load all state ───────────────────────────
async function loadState() {
  try {
    const settings = await specter.getSettings();
    currentProvider = settings.activeProvider === 'specter-cloud' ? 'gemini' : (settings.activeProvider || 'gemini');
    currentModel    = settings.activeModel    || 'gemini-2.5-flash';
    currentKeys     = settings.apiKeys        || {};
    deepgramKey     = settings.deepgramApiKey || '';

    // Opacity
    const opacityPct = Math.round((settings.opacity ?? 0.92) * 100);
    const slider = $('slider-opacity');
    if (slider) { slider.value = opacityPct; if (opacityVal) opacityVal.textContent = opacityPct + '%'; }

    // Stealth toggle
    const stealthChk = $('toggle-stealth');
    if (stealthChk) stealthChk.checked = settings.stealth !== false;

    // Disguise & Taskbar/Dock Icon Hiding (Locked AI mode)
    currentDisguise = settings.disguise || { enabled: false, preset: 'notes', customName: '', hideIcon: true };
    const hideIconChk = $('toggle-hide-icon');
    if (hideIconChk) hideIconChk.checked = currentDisguise.hideIcon !== false;

    const disguiseChk = $('toggle-disguise');
    if (disguiseChk) disguiseChk.checked = currentDisguise.enabled === true;

    const presetSel = $('setting-disguise-preset');
    if (presetSel) presetSel.value = currentDisguise.preset || 'notes';

    const customInput = $('setting-disguise-custom');
    if (customInput) customInput.value = currentDisguise.customName || '';

    const customGroup = $('disguise-custom-group');
    if (customGroup) customGroup.style.display = (currentDisguise.preset === 'custom') ? 'block' : 'none';

    applyDisguiseUI(currentDisguise);

    // Provider dropdown
    const provSel = $('setting-active-provider');
    if (provSel) provSel.value = currentProvider;

    // Keys
    populateKeyFields(settings.apiKeys || {}, settings.deepgramApiKey || '');

    // Subscription
    currentSub = settings.subscription || { plan: 'free', status: 'active', expiresAt: null };
    renderSubscription();

    // User / account
    const user = await specter.getUser();
    if (user) { currentUser = user; renderSignedIn(user); }
    else renderSignedOut();

    // Audio mode & device
    audioMode     = settings.audioMode || 'both';
    selectedMicId = settings.micDeviceId || '';
    const audioModeSel = $('setting-audio-mode');
    if (audioModeSel) audioModeSel.value = audioMode;

    // Profile
    const profile = await specter.getSavedProfile();
    if (profile) { currentProfile = profile; populateProfile(profile); }

    // History
    try { qaHistory = (await specter.getHistory()) || []; } catch { qaHistory = []; }

    // Permissions, devices, and capture sources
    refreshPermissions().catch(() => {});
    refreshAudioDevices().catch(() => {});
    refreshCaptureSources().catch(() => {});

    // Provider tag
    updateProviderTag();

    // Version
    const vt = $('version-tag');
    if (vt) { try { vt.textContent = 'v' + specter.getVersion(); } catch {} }
  } catch (e) {
    console.error('[Specter] loadState error:', e);
  }
}

function populateKeyFields(keys, dgKey) {
  const map = { groq: 'key-groq', gemini: 'key-gemini', openai: 'key-openai', anthropic: 'key-anthropic', openrouter: 'key-openrouter' };
  for (const [provider, elId] of Object.entries(map)) { const el = $(elId); if (el && keys[provider]) el.value = keys[provider]; }
  const dgEl = $('key-deepgram'); if (dgEl && dgKey) dgEl.value = dgKey;
}

function populateProfile(p) {
  if (p.name)   { const el = $('prof-name');   if (el) el.value = p.name; }
  if (p.role)   { const el = $('prof-role');   if (el) el.value = p.role; }
  if (p.exp)    { const el = $('prof-exp');    if (el) el.value = p.exp; }
  if (p.skills) { const el = $('prof-skills'); if (el) el.value = p.skills; }
  if (p.resume) { const el = $('prof-resume'); if (el) el.value = p.resume; }
}

function updateProviderTag() {
  const tags = {
    gemini: '♊ Gemini (BYOK)',
    groq: '🔥 Groq (BYOK)',
    openai: '🤖 OpenAI (BYOK)',
    anthropic: '🌟 Claude (BYOK)',
    openrouter: '🌐 OpenRouter (BYOK)',
    nvidia: '⚡ NVIDIA (BYOK)'
  };
  setProviderTag(tags[currentProvider] || (currentProvider ? `⚡ ${currentProvider} (BYOK)` : '⚡ BYOK Mode'));
}

// ─────────────────────────── BYOK Mode UI ───────────────────────────
function renderSubscription() {
  if (tierPill) {
    tierPill.textContent = 'BYOK';
    tierPill.classList.remove('pro');
  }
}

// ─────────────────────────── Account UI ───────────────────────────
function renderSignedIn(user) {
  const signedOut = $('account-signed-out');
  const signedIn  = $('account-signed-in');
  if (signedOut) signedOut.style.display = 'none';
  if (signedIn)  signedIn.style.display  = '';
  const nameEl  = $('user-name-display');
  const emailEl = $('user-email-display');
  if (nameEl)  nameEl.textContent  = user.name  || 'User';
  if (emailEl) emailEl.textContent = user.email || '';
  const avatarEl = $('user-avatar');
  if (avatarEl) avatarEl.textContent = (user.name || 'U')[0].toUpperCase();
  if (userPill) userPill.textContent = (user.name || 'User').split(' ')[0];
  const planEl = $('account-plan-display');
  if (planEl) planEl.textContent = '⚡ BYOM / Unlocked';
}

function renderSignedOut() {
  currentUser = null;
  const signedOut = $('account-signed-out');
  const signedIn  = $('account-signed-in');
  if (signedOut) signedOut.style.display = '';
  if (signedIn)  signedIn.style.display  = 'none';
  if (userPill)  userPill.textContent    = 'Guest';
}

async function setupAccountUI() {
  const btnSignIn  = $('btn-sign-in');
  const btnSignOut = $('btn-sign-out');

  if (btnSignIn) btnSignIn.addEventListener('click', async () => {
    setStatus('⏳ Opening Firebase…', 'pending');
    if (authHint) authHint.textContent = 'Complete Firebase OAuth sign-in in your browser…';
    btnSignIn.disabled = true;
    try {
      const result = await specter.signIn();
      if (result.ok) {
        const user = await specter.getUser();
        if (user) { currentUser = user; renderSignedIn(user); setStatus('● Signed In', 'active'); }
        if (authHint) authHint.textContent = '';
      } else {
        if (authHint) { authHint.style.color = '#ff5252'; authHint.textContent = result.message || 'Sign-in failed.'; }
        setStatus('● Ready', '');
      }
    } catch (e) {
      if (authHint) { authHint.style.color = '#ff5252'; authHint.textContent = 'Error: ' + e.message; }
      setStatus('● Ready', '');
    } finally {
      btnSignIn.disabled = false;
    }
  });

  if (btnSignOut) btnSignOut.addEventListener('click', async () => {
    await specter.signOut();
    renderSignedOut();
    setStatus('● Ready', '');
  });

  // Listen for auth changes from main process
  specter.onAuthStatus(async (status) => {
    if (status.status === 'signed-in' && status.user) {
      currentUser = status.user; renderSignedIn(status.user);
    } else if (status.status === 'signed-out') {
      renderSignedOut();
    }
  });

  specter.onSubStatus((status) => {
    if (status.status === 'activated' && status.subscription) {
      currentSub = status.subscription; renderSubscription();
    }
  });
}

// ─────────────────────────── Permissions, Devices & Capture Sources ───────────────────────────
async function refreshPermissions() {
  if (!specter.getPermissions) return;
  try {
    const perms = await specter.getPermissions();
    const updateBadge = (id, status) => {
      const el = $(id);
      if (!el) return;
      el.textContent = status;
      el.className = 'perm-badge ' + (status === 'granted' ? 'granted' : (status === 'denied' || status === 'restricted' ? 'denied' : 'pending'));
    };
    updateBadge('perm-screen-badge', perms.screen || 'unknown');
    updateBadge('perm-mic-badge', perms.microphone || 'unknown');
  } catch (e) {
    console.warn('[Specter] refreshPermissions error:', e);
  }
}

async function refreshAudioDevices() {
  const sel = $('setting-mic-device');
  if (!sel || !navigator.mediaDevices?.enumerateDevices) return;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputs = devices.filter(d => d.kind === 'audioinput');
    const prev = selectedMicId || sel.value;
    sel.innerHTML = '<option value="">Default System Microphone</option>';
    inputs.forEach((d, idx) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || `Microphone ${idx + 1}`;
      sel.appendChild(opt);
    });
    if (prev) sel.value = prev;
  } catch (e) {
    console.warn('[Specter] enumerateDevices error:', e);
  }
}

async function refreshCaptureSources() {
  const sel = $('screen-source-select');
  if (!sel) return;
  try {
    const prev = sel.value;
    sel.innerHTML = '<option value="">Active Display (Auto)</option>';
    if (specter.getDisplays) {
      const displays = await specter.getDisplays();
      displays.forEach(d => {
        const opt = document.createElement('option');
        opt.value = `display:${d.id}`;
        opt.textContent = `🖥 ${d.label}${d.isPrimary ? ' (Primary)' : ''}`;
        sel.appendChild(opt);
      });
    }
    if (specter.getDesktopSources) {
      const sources = await specter.getDesktopSources();
      sources.filter(s => s.type === 'window').slice(0, 20).forEach(w => {
        const opt = document.createElement('option');
        opt.value = `source:${w.id}`;
        opt.textContent = `🪟 ${w.name.slice(0, 55)}`;
        sel.appendChild(opt);
      });
    }
    if (prev) sel.value = prev;
  } catch (e) {
    console.warn('[Specter] refreshCaptureSources error:', e);
  }
}

// ─────────────────────────── Dual-Channel Audio Capture (Mic + System Loopback) ───────────────────────────
function stopAllAudio() {
  isWhisperRecording = false;
  if (meterTimer) { clearInterval(meterTimer); meterTimer = null; }
  const meterFill = $('audio-meter-fill');
  if (meterFill) meterFill.style.width = '0%';
  if (whisperRecorder && whisperRecorder.state !== 'inactive') {
    try { whisperRecorder.stop(); } catch {}
  }
  whisperRecorder = null;
  if (whisperStream) { whisperStream.getTracks().forEach(t => t.stop()); whisperStream = null; }
  if (micRawStream)  { micRawStream.getTracks().forEach(t => t.stop()); micRawStream = null; }
  if (sysRawStream)  { sysRawStream.getTracks().forEach(t => t.stop()); sysRawStream = null; }
  if (audioCtx)      { try { audioCtx.close(); } catch {} audioCtx = null; }
  analyserNode = null;
  stopDeepgramSTT();
}

async function acquireMixedAudioStream() {
  stopAllAudio();
  const mode = audioMode || 'both';
  const tracksToMix = [];

  // 1. Microphone stream
  if (mode === 'both' || mode === 'mic') {
    try {
      const constraints = {
        audio: {
          ...(selectedMicId ? { deviceId: { exact: selectedMicId } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      micRawStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (micRawStream.getAudioTracks().length > 0) {
        tracksToMix.push(micRawStream);
      }
      refreshAudioDevices().catch(() => {});
    } catch (e) {
      console.warn('[Specter Audio] Mic capture unavailable:', e.message);
      if (mode === 'mic') throw e;
    }
  }

  // 2. System Audio Loopback stream (via getDisplayMedia + ScreenCaptureKit/WASAPI)
  if (mode === 'both' || mode === 'system') {
    try {
      sysRawStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      // Stop unused video track immediately to avoid GPU/CPU overhead
      sysRawStream.getVideoTracks().forEach(t => t.stop());
      if (sysRawStream.getAudioTracks().length > 0) {
        tracksToMix.push(sysRawStream);
      } else {
        console.warn('[Specter Audio] System audio loopback returned no audio tracks');
      }
    } catch (e) {
      console.warn('[Specter Audio] System audio loopback unavailable:', e.message);
      if (mode === 'system' && tracksToMix.length === 0) throw e;
    }
  }

  if (tracksToMix.length === 0) {
    throw new Error('No microphone or system audio stream could be acquired. Check macOS Privacy permissions.');
  }

  // 3. Mix streams with Web Audio API & attach AnalyserNode for live meter + VAD
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume().catch(() => {});
  }
  const dest = audioCtx.createMediaStreamDestination();
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 512;

  for (const s of tracksToMix) {
    const src = audioCtx.createMediaStreamSource(s);
    src.connect(analyserNode);
    src.connect(dest);
  }

  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
  meterTimer = setInterval(() => {
    if (!analyserNode || !isListening || isMuted) {
      const mf = $('audio-meter-fill');
      if (mf) mf.style.width = '0%';
      return;
    }
    analyserNode.getByteTimeDomainData(dataArray);
    let sumSq = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] - 128) / 128;
      sumSq += v * v;
    }
    const rms = Math.sqrt(sumSq / dataArray.length);
    if (rms > 0.008) hadSpeechInChunk = true;
    const pct = Math.min(100, Math.round(rms * 420));
    const mf = $('audio-meter-fill');
    if (mf) mf.style.width = pct + '%';
  }, 100);

  return dest.stream;
}

// ─────────────────────────── Speech Recognition (Whisper, Gemini & Deepgram) ───────────────────────────
function setupAudio() {
  if (!isListening) return;
  if (deepgramKey) {
    startDeepgramSTT();
  } else {
    startWhisperSTT();
  }
}

async function startWhisperSTT() {
  try {
    whisperStream = await acquireMixedAudioStream();
  } catch (e) {
    console.warn('[Specter] Audio acquisition failed:', e);
    setStatus('⚠ Audio Denied', 'error');
    refreshPermissions().catch(() => {});
    return;
  }

  const hasSttKey = !!(currentKeys.groq || currentKeys.openai || currentKeys.gemini);
  const activeProvider = currentKeys.groq
    ? 'Groq Whisper'
    : (currentKeys.openai ? 'OpenAI Whisper' : (currentKeys.gemini ? 'Gemini Live STT' : 'Audio Ready (Add Key)'));

  setStatus(`● ${activeProvider}`, hasSttKey ? 'active' : '');
  isWhisperRecording = true;
  hadSpeechInChunk = false;
  startWhisperChunk();
}

function startWhisperChunk() {
  if (!isWhisperRecording || !whisperStream) return;
  whisperChunks = [];
  hadSpeechInChunk = false;

  let mimeType = 'audio/webm;codecs=opus';
  if (typeof MediaRecorder !== 'undefined') {
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else mimeType = '';
    }
  }

  try {
    whisperRecorder = mimeType ? new MediaRecorder(whisperStream, { mimeType }) : new MediaRecorder(whisperStream);
  } catch (err) {
    console.warn('[Specter] MediaRecorder creation failed:', err);
    return;
  }

  whisperRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) whisperChunks.push(e.data);
  };

  whisperRecorder.onstop = async () => {
    if (!isWhisperRecording) return;
    const chunks = [...whisperChunks];
    const spoke = hadSpeechInChunk;
    whisperChunks = [];

    if (isWhisperRecording && isListening && !isMuted) {
      startWhisperChunk();
    } else if (isWhisperRecording) {
      setTimeout(() => { if (isWhisperRecording && isListening && !isMuted) startWhisperChunk(); }, 500);
    }

    // VAD guard: skip silent slices to save quota and prevent Whisper hallucinations
    if (!spoke || chunks.length === 0 || !isListening || isMuted) return;

    const key = currentKeys.groq || currentKeys.openai || currentKeys.gemini || '';
    if (!key) return;

    try {
      const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
      const buffer = await blob.arrayBuffer();
      if (buffer.byteLength > 1800) {
        const result = await specter.transcribeAudio(buffer, key, getLanguageSetting(), mimeType || 'audio/webm');
        if (result && result.ok && result.text && result.text.trim()) {
          const text = result.text.trim();
          accumulatedText = (accumulatedText ? accumulatedText + ' ' : '') + text;
          if (accumulatedText.length > 50000) accumulatedText = accumulatedText.slice(-30000);
          renderTranscript(accumulatedText, '');
          autoDetectType(accumulatedText);
        } else if (result && !result.ok && result.error) {
          console.warn('[Specter] STT warning:', result.error);
        }
      }
    } catch (e) {
      console.warn('[Specter] Audio transcription error:', e);
    }
  };

  try {
    whisperRecorder.start();
  } catch (e) {
    console.warn('[Specter] Recorder start error:', e);
    return;
  }

  setTimeout(() => {
    if (whisperRecorder && whisperRecorder.state === 'recording') {
      try { whisperRecorder.stop(); } catch {}
    }
  }, 3200);
}

// Deepgram real-time STT (using mixed Mic + System Audio stream)
async function startDeepgramSTT() {
  if (!deepgramKey) return startWhisperSTT();
  try {
    dgStream = await acquireMixedAudioStream();
  } catch (e) {
    console.warn('[Specter] Audio denied for Deepgram:', e);
    setStatus('⚠ Audio Denied', 'error');
    return;
  }

  const dgUrl = `wss://api.deepgram.com/v1/listen?encoding=webm-opus&sample_rate=48000&interim_results=true&punctuate=true&diarize=true`;
  dgSocket = new WebSocket(dgUrl, ['token', deepgramKey]);
  dgSocket.onopen = () => {
    setStatus('● Deepgram Live', 'active');
    isUsingDeepgram = true;
    dgRecorder = new MediaRecorder(dgStream, { mimeType: 'audio/webm;codecs=opus' });
    dgRecorder.ondataavailable = e => { if (dgSocket.readyState === WebSocket.OPEN && e.data.size > 0) dgSocket.send(e.data); };
    dgRecorder.start(250);
  };
  dgSocket.onmessage = (e) => {
    if (!isListening || isMuted) return;
    try {
      const data = JSON.parse(e.data);
      const alt  = data?.channel?.alternatives?.[0];
      if (!alt) return;
      const transcript = alt.transcript || '';
      if (data.is_final && transcript.trim()) { accumulatedText += transcript + ' '; renderTranscript(accumulatedText, ''); autoDetectType(accumulatedText); }
      else if (transcript) renderTranscript(accumulatedText, transcript);
    } catch {}
  };
  dgSocket.onerror = () => { console.warn('[Specter] Deepgram WS error, falling back to Whisper/Gemini STT'); stopDeepgramSTT(); startWhisperSTT(); };
  dgSocket.onclose = () => { if (isListening && isUsingDeepgram) setTimeout(() => startDeepgramSTT(), 3000); };
}

function stopDeepgramSTT() {
  isUsingDeepgram = false;
  if (dgRecorder?.state === 'recording') { try { dgRecorder.stop(); } catch {} }
  dgRecorder = null;
  if (dgSocket) { try { dgSocket.close(); } catch {} dgSocket = null; }
  if (dgStream) { dgStream.getTracks().forEach(t => t.stop()); dgStream = null; }
}

function getLanguageSetting() {
  const sel = $('setting-language'); return sel ? sel.value : 'en';
}

// ─────────────────────────── Transcript rendering ───────────────────────────
function renderTranscript(final, interim) {
  if (!liveTranscript) return;
  const display = (final + (interim ? `<span class="interim">${interim}</span>` : '')).trim();
  if (display) liveTranscript.innerHTML = display;
  liveTranscript.scrollTop = liveTranscript.scrollHeight;
}

// ─────────────────────────── Problem type detection ───────────────────────────
const PROBLEM_PATTERNS = [
  { type: '💻 Coding',         re: /two sum|three sum|array|linked list|tree|graph|dynamic|lru|palindrome|anagram|substring|subsequence|sliding window|binary search|recursion|memoiz|backtrack|dfs|bfs|heap|stack|queue|sort|merge/i },
  { type: '🗄 SQL',             re: /\bselect\b|\bjoin\b|\bgroup by\b|\bwhere\b|\bsql\b|\bquery\b|\bdatabase\b|\brelation|\btable\b|\bindex\b|\baggregat/i },
  { type: '🏗 System Design',   re: /design|scale|architect|microservice|load balanc|cach|database design|api design|distributed|consistent|availability|partition|cap theorem|message queue/i },
  { type: '🧠 Behavioral',      re: /tell me about|weakness|strength|conflict|team|challenge|fail|success|leadership|why (do you|did you|are you)|how do you handle|greatest achievement/i },
  { type: '✅ MCQ',             re: /which (of|is|are)|true or false|correct answer|option [a-d]|choose|multiple choice|select (all|the)/i },
  { type: '📐 Math',            re: /calculate|probability|statistics|matrix|derivative|integral|linear algebra|equation|prime|factorial/i },
];

function autoDetectType(text) {
  for (const p of PROBLEM_PATTERNS) { if (p.re.test(text)) { setDetected(p.type); return; } }
  setDetected('💬 General');
}

// ─────────────────────────── AI Solve (Streaming + History) ───────────────────────────
async function executeSolve(extraPrompt = '') {
  const question = extraPrompt || chatInput?.value?.trim() || accumulatedText.trim();
  if (!question) { renderAnswer('⚠️ No question detected. Speak or type your question first.', true); return; }

  setStatus('⏳ Solving…', 'pending');
  renderAnswer('<div class="thinking"><span>⏳</span> Specter AI is streaming response…</div>', false, true);

  try {
    const profile = currentProfile;
    const onChunk = (partialText) => {
      if (partialText) renderAnswer(partialText);
    };
    const result = await callAI(question, profile, lastCapture, onChunk);
    sessionQCount++;
    renderAnswer(result);
    renderSubscription();

    // Persist to local Q&A history
    try {
      qaHistory.unshift({ q: question.slice(0, 400), a: result, ts: Date.now(), provider: currentProvider });
      if (qaHistory.length > 50) qaHistory = qaHistory.slice(0, 50);
      specter.saveHistory?.(qaHistory);
    } catch {}

    setStatus('✅ Done', 'active');
    setTimeout(() => setStatus(isListening ? '● Listening' : '● Ready', isListening ? 'active' : ''), 2000);
  } catch (e) {
    renderAnswer(`❌ **Error:** ${e.message}`, true);
    setStatus('⚠ Error', 'error');
    setTimeout(() => setStatus('● Ready', ''), 3000);
  }
}

async function callAI(question, profile, imageBase64, onChunk) {
  const provider = currentProvider;
  const keys     = currentKeys;

  // Build system prompt
  const profileCtx = profile.name ? `\n\nCandidate: ${profile.name}, ${profile.exp}y exp, ${profile.role}. Skills: ${profile.skills}. ${profile.resume ? 'Background: ' + profile.resume.slice(0, 300) : ''}` : '';
  const systemPrompt = `You are Specter AI, an elite real-time interview copilot. Provide precise, production-ready answers.${profileCtx}

Format rules:
- For coding problems: provide working code in the most appropriate language with time/space complexity
- For SQL: provide the exact query with explanation
- For system design: provide structured answer with components, trade-offs, and diagram description
- For behavioral: provide STAR-format answer (Situation, Task, Action, Result) personalized to the candidate
- For MCQ: state the answer letter and brief explanation
- Keep answers concise but complete. Use markdown formatting.`;

  if (provider === 'gemini' || provider === 'specter-cloud' || !provider) {
    const key = keys.gemini;
    if (!key) throw new Error('No Google Gemini API key configured. Please add your key in the BYOK tab (free at aistudio.google.com).');
    return callGeminiStream(question, systemPrompt, imageBase64, currentModel || 'gemini-2.5-flash', key, onChunk);
  }

  if (provider === 'groq') {
    const key = keys.groq;
    if (!key) throw new Error('No Groq API key. Add one in BYOK tab.');
    return callOpenAICompatStream('https://api.groq.com/openai/v1/chat/completions', key, currentModel || 'llama-3.3-70b-specdec', question, systemPrompt, null, onChunk);
  }

  if (provider === 'openai') {
    const key = keys.openai;
    if (!key) throw new Error('No OpenAI API key. Add one in BYOK tab.');
    return callOpenAICompatStream('https://api.openai.com/v1/chat/completions', key, currentModel || 'gpt-4o', question, systemPrompt, imageBase64, onChunk);
  }

  if (provider === 'openrouter') {
    const key = keys.openrouter;
    if (!key) throw new Error('No OpenRouter API key. Add one in BYOK tab.');
    return callOpenAICompatStream('https://openrouter.ai/api/v1/chat/completions', key, currentModel || 'deepseek/deepseek-r1', question, systemPrompt, null, onChunk);
  }

  if (provider === 'anthropic') {
    const key = keys.anthropic;
    if (!key) throw new Error('No Anthropic API key. Add one in BYOK tab.');
    return callAnthropic(key, currentModel || 'claude-3-5-sonnet-20241022', question, systemPrompt, imageBase64);
  }

  if (provider === 'nvidia') {
    const key = keys.nvidia;
    if (!key) throw new Error('No NVIDIA API key. Add one in BYOK tab.');
    return callNvidia(key, question, systemPrompt);
  }

  throw new Error(`Unknown provider: ${provider}`);
}

// Gemini SSE Streaming API
async function callGeminiStream(question, systemPrompt, imageBase64, model, apiKey, onChunk) {
  const MODEL = model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const parts = [{ text: question }];
  if (imageBase64) {
    const [header, data] = imageBase64.split(',');
    const mimeType = header.includes('jpeg') ? 'image/jpeg' : 'image/png';
    parts.push({ inline_data: { mime_type: mimeType, data } });
  }

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0.25, maxOutputTokens: 2048 },
  };

  const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!resp.ok) {
    const errTxt = await resp.text();
    throw new Error(`Gemini ${MODEL} error ${resp.status}: ${errTxt.slice(0, 200)}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (!raw || raw === '[DONE]') continue;
      try {
        const parsed = JSON.parse(raw);
        const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (chunk) {
          fullText += chunk;
          onChunk?.(fullText);
        }
      } catch {}
    }
  }

  if (!fullText) throw new Error('Gemini returned empty response.');
  return fullText;
}

// OpenAI-compatible SSE Streaming endpoint (Groq, OpenAI, OpenRouter)
async function callOpenAICompatStream(url, apiKey, model, question, systemPrompt, imageBase64, onChunk) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: imageBase64 ? [{ type: 'text', text: question }, { type: 'image_url', image_url: { url: imageBase64 } }] : question }
  ];
  const body = { model, messages, temperature: 0.3, max_tokens: 2048, stream: true };
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const errTxt = await resp.text();
    throw new Error(`${model} API error ${resp.status}: ${errTxt.slice(0, 200)}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (!raw || raw === '[DONE]') continue;
      try {
        const parsed = JSON.parse(raw);
        const delta = parsed.choices?.[0]?.delta?.content || '';
        if (delta) {
          fullText += delta;
          onChunk?.(fullText);
        }
      } catch {}
    }
  }

  if (!fullText) throw new Error('AI returned empty response');
  return fullText;
}

// Anthropic (via IPC proxy)
async function callAnthropic(apiKey, model, question, systemPrompt, imageBase64) {
  const content = imageBase64
    ? [{ type: 'text', text: question }, { type: 'image', source: { type: 'base64', media_type: imageBase64.includes('jpeg') ? 'image/jpeg' : 'image/png', data: imageBase64.split(',')[1] } }]
    : question;
  const body = { model, max_tokens: 2048, system: systemPrompt, messages: [{ role: 'user', content }] };
  const result = await specter.anthropicApiCall(apiKey, body);
  if (!result.ok) throw new Error(`Anthropic API error ${result.status}: ${JSON.stringify(result.data).slice(0, 200)}`);
  return result.data?.content?.[0]?.text || 'No response from Claude.';
}

// NVIDIA AI (via IPC proxy)
async function callNvidia(apiKey, question, systemPrompt) {
  const body = { model: 'meta/llama3-70b-instruct', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: question }], max_tokens: 2048, temperature: 0.3 };
  const result = await specter.nvidiaApiCall(apiKey, body);
  if (!result.ok) throw new Error(`NVIDIA API error ${result.status}`);
  return result.data?.choices?.[0]?.message?.content || 'No response from NVIDIA AI.';
}

// Smart fallback for Specter Cloud mode (no API key)
function generateFallbackAnswer(question) {
  const q = question.toLowerCase();

  // Detect and generate contextual responses
  if (/two sum/i.test(q)) return `## Two Sum — O(n) Hash Map Solution

\`\`\`python
def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
\`\`\`

**Time:** O(n) | **Space:** O(n)
**Approach:** For each number, check if its complement (target - num) is already in the hash map. If yes, return both indices. Otherwise, store the number and its index.`;

  if (/sql|select|join|query/i.test(q)) return `## SQL Query Solution

\`\`\`sql
SELECT 
    e.employee_id,
    e.name,
    d.department_name,
    COUNT(*) OVER(PARTITION BY d.department_id) AS dept_count
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id
WHERE e.salary > (
    SELECT AVG(salary) FROM employees e2 
    WHERE e2.department_id = e.department_id
)
ORDER BY e.salary DESC;
\`\`\`

**Key concepts used:** Window functions, correlated subquery, JOIN, WHERE filter.`;

  if (/system design|design a|scale/i.test(q)) return `## System Design Answer

### High-Level Architecture
1. **API Gateway** — Rate limiting, auth, routing
2. **Load Balancer** — Round-robin or least-connections
3. **Application Servers** — Stateless, horizontally scalable
4. **Cache Layer** — Redis for hot data (TTL-based)
5. **Database** — PostgreSQL (primary) + read replicas
6. **Message Queue** — Kafka for async processing
7. **CDN** — Static assets, geographic distribution

### Key Trade-offs
- **Consistency vs Availability:** Choose based on CAP theorem requirements
- **SQL vs NoSQL:** SQL for relational data; NoSQL for high write throughput
- **Sync vs Async:** Use queues for non-critical writes

> Add a **Groq or Gemini API key** in BYOK tab for fully customized answers!`;

  if (/tell me about|weakness|strength|behavioral/i.test(q)) return `## Behavioral Answer (STAR Format)

**Situation:** At my previous company, we faced a critical production incident where our main service was experiencing 500ms+ latency spikes, affecting 30% of users.

**Task:** As the on-call engineer, I had to identify the root cause and restore service within our 1-hour SLA window.

**Action:** I started by pulling metrics from Datadog, identified an N+1 query pattern introduced in a recent deploy. I rolled back the problematic migration, then worked with the team to add proper indexing and batch queries.

**Result:** Restored service in 42 minutes, reduced query latency by 85%, and introduced automated N+1 detection in our CI pipeline — preventing similar issues going forward.

> **Tip:** Add your resume in the **Resume tab** for personalized behavioral answers!`;

  // Generic
  return `## Specter AI Answer

I'm analyzing your question: *"${question.slice(0, 100)}..."*

**To get the best AI-powered answer:**

1. **Free (Specter Cloud):** Works for common interview patterns — just speak or type!
2. **For custom answers:** Add a free **Groq API key** in the BYOK tab (gsk\_... from console.groq.com)
3. **Or a Gemini key** from aistudio.google.com (AIzaSy...)

Both are **free** with generous limits — no credit card needed.

Would you like to rephrase or add more context to your question?`;
}

// ─────────────────────────── Answer rendering ───────────────────────────
function renderAnswer(text, isError = false, isHtml = false) {
  if (!answerContent) return;
  if (isHtml) { answerContent.innerHTML = text; return; }

  // Basic markdown → HTML
  let html = isError ? `<div class="answer-error">${escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`
    : markdownToHtml(text);

  answerContent.innerHTML = html;

  // Syntax highlight code blocks
  answerContent.querySelectorAll('pre code').forEach(block => {
    block.style.cssText = 'display:block;padding:12px;overflow-x:auto;white-space:pre;';
  });

  answerContent.scrollTop = 0;
}

function markdownToHtml(md) {
  return md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.*)/gm, '<h3>$1</h3>')
    .replace(/^## (.*)/gm, '<h2>$1</h2>')
    .replace(/^# (.*)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h1-6ul]|<li|<pre|<\/)(.*)/gm, (m) => m ? m : '')
    .replace(/\n/g, '<br>');
}

function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ─────────────────────────── Hotkey events from main process ───────────────────────────
function setupHotkeys() {
  specter.onSolve(() => executeSolve());
  specter.onScreenshot((base64) => { lastCapture = base64; showCapturePreview(base64); });
  specter.onCaptureError((msg) => { renderAnswer(`❌ Capture failed: ${msg}`, true); setStatus('⚠ Capture Error', 'error'); });
  specter.onHotkey((action) => {
    switch (action) {
      case 'toggleListen': toggleListen(); break;
      case 'muteMic':      toggleMute(); break;
      case 'clearPanel':   clearPanel(); break;
      case 'glance':       toggleGlance(); break;
      case 'copyAnswer':   copyAnswer(); break;
      case 'scrollUp':     answerContent?.scrollBy(0, -60); break;
      case 'scrollDown':   answerContent?.scrollBy(0, 60); break;
      case 'quickChat':    chatInput?.focus(); break;
    }
  });
  specter.onRegionShot((dataUrl) => { lastCapture = dataUrl; showCapturePreview(dataUrl); setStatus('📷 Region Captured', 'active'); });
  specter.onDataChanged(() => { loadState(); });
}

// ─────────────────────────── Helper actions ───────────────────────────
function toggleListen() {
  isListening = !isListening;
  const txt = $('listen-btn-text');
  if (txt) txt.textContent = isListening ? 'Pause' : 'Resume';
  if (isListening) {
    if (!whisperStream && !isUsingDeepgram) {
      setupAudio();
      return;
    }
    const activeProvider = deepgramKey ? 'Deepgram Live' : (currentKeys.groq ? 'Groq Whisper' : (currentKeys.openai ? 'OpenAI Whisper' : (currentKeys.gemini ? 'Gemini Live STT' : 'Audio Ready')));
    setStatus(`● ${activeProvider}`, 'active');
    if (isWhisperRecording && whisperStream && (!whisperRecorder || whisperRecorder.state === 'inactive')) {
      startWhisperChunk();
    }
  } else {
    setStatus('⏸ Paused', '');
    if (whisperRecorder && whisperRecorder.state === 'recording') {
      try { whisperRecorder.stop(); } catch {}
    }
  }
}

function stopListen() {
  isListening = false;
  stopAllAudio();
  const txt = $('listen-btn-text');
  if (txt) txt.textContent = 'Start';
  setStatus('⏹ Stopped', '');
}

function toggleMute() {
  isMuted = !isMuted;
  const btn = $('btn-mute');
  if (btn) btn.textContent = isMuted ? '🔇' : '🎙';
  if (whisperStream) {
    whisperStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted;
    });
  }
  if (dgStream) {
    dgStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted;
    });
  }
  setStatus(isMuted ? '🔇 Muted' : (isListening ? '● Listening' : '⏸ Paused'), isMuted ? '' : (isListening ? 'active' : ''));
}

function clearPanel() {
  accumulatedText = '';
  if (liveTranscript) liveTranscript.innerHTML = '<span class="placeholder-text">Start speaking…</span>';
  if (answerContent)  answerContent.innerHTML  = '<span class="placeholder-text">Your AI-generated answer will appear here…</span>';
  if (chatInput)      chatInput.value = '';
  lastCapture = null;
  const preview = $('capture-preview');
  if (preview) preview.innerHTML = '<span class="placeholder-text">No screenshot yet.</span>';
  setStatus('● Ready', '');
  setDetected('Listening…');
}

function toggleGlance() {
  isGlance = !isGlance;
  document.body.classList.toggle('glance-mode', isGlance);
}

function toggleClickThrough() {
  isClickThrough = !isClickThrough;
  const btn = $('btn-clickthrough');
  if (btn) btn.classList.toggle('active', isClickThrough);
  if (isClickThrough) { specter.disableMouse(); setStatus('👻 Click-through', ''); }
  else { specter.enableMouse(); setStatus('● Ready', ''); }
}

async function copyAnswer() {
  const text = answerContent?.innerText || '';
  if (text && text !== 'Your AI-generated answer will appear here…') {
    await specter.copyText(text);
    setStatus('📋 Copied!', 'active');
    setTimeout(() => setStatus('● Listening', 'active'), 1500);
  }
}

function showCapturePreview(dataUrl) {
  const preview = $('capture-preview');
  if (!preview) return;
  preview.innerHTML = `<img src="${dataUrl}" style="max-width:100%;border-radius:6px;cursor:pointer" title="Click to solve" />`;
  preview.querySelector('img')?.addEventListener('click', () => executeSolve());
  // Switch to screen tab
  $$('.tab-btn').forEach(b => b.classList.remove('active'));
  $$('.tab-content').forEach(s => s.classList.remove('active'));
  document.querySelector('[data-tab="screen"]')?.classList.add('active');
  $('tab-screen')?.classList.add('active');
}

// ─────────────────────────── Event Listeners ───────────────────────────
function setupEventListeners() {
  // Close / hide & quit
  $('btn-close')?.addEventListener('click', () => specter.hide());
  $('btn-quit')?.addEventListener('click', () => { stopAllAudio(); specter.quit(); });

  // Glance / click-through / disguise
  $('btn-glance')?.addEventListener('click', toggleGlance);
  $('btn-clickthrough')?.addEventListener('click', toggleClickThrough);

  // Disguise & Taskbar/Dock Icon Hiding (Locked AI Mode)
  $('btn-disguise')?.addEventListener('click', async () => {
    currentDisguise.enabled = !currentDisguise.enabled;
    const chk = $('toggle-disguise');
    if (chk) chk.checked = currentDisguise.enabled;
    applyDisguiseUI(currentDisguise);
    await specter.setDisguise(currentDisguise);
  });

  $('toggle-disguise')?.addEventListener('change', async (e) => {
    currentDisguise.enabled = e.target.checked;
    applyDisguiseUI(currentDisguise);
    await specter.setDisguise(currentDisguise);
  });

  $('toggle-hide-icon')?.addEventListener('change', async (e) => {
    currentDisguise.hideIcon = e.target.checked;
    await specter.setDisguise(currentDisguise);
  });

  $('setting-disguise-preset')?.addEventListener('change', async (e) => {
    currentDisguise.preset = e.target.value;
    const customGroup = $('disguise-custom-group');
    if (customGroup) customGroup.style.display = (currentDisguise.preset === 'custom') ? 'block' : 'none';
    applyDisguiseUI(currentDisguise);
    await specter.setDisguise(currentDisguise);
  });

  $('setting-disguise-custom')?.addEventListener('input', async (e) => {
    currentDisguise.customName = e.target.value;
    if (currentDisguise.preset === 'custom') {
      applyDisguiseUI(currentDisguise);
      await specter.setDisguise(currentDisguise);
    }
  });

  // Listen / stop / mute
  $('btn-toggle-listen')?.addEventListener('click', toggleListen);
  $('btn-stop-listen')?.addEventListener('click', stopListen);
  $('btn-mute')?.addEventListener('click', toggleMute);
  $('btn-clear-transcript')?.addEventListener('click', () => {
    accumulatedText = '';
    if (liveTranscript) liveTranscript.innerHTML = '<span class="placeholder-text">Start speaking…</span>';
  });

  // Solve buttons
  $('btn-solve')?.addEventListener('click', () => executeSolve());
  $('btn-capture-solve')?.addEventListener('click', async () => {
    setStatus('📷 Capturing…', 'pending');
    try {
      const img = await specter.captureFullscreen();
      lastCapture = img; showCapturePreview(img);
      await executeSolve();
    } catch (e) { renderAnswer(`❌ Capture failed: ${e.message}`, true); setStatus('⚠ Error', 'error'); }
  });
  $('btn-new')?.addEventListener('click', clearPanel);
  $('btn-copy-code')?.addEventListener('click', copyAnswer);
  $('btn-next-question')?.addEventListener('click', () => { clearPanel(); chatInput?.focus(); });

  // Chat
  $('btn-chat-send')?.addEventListener('click', () => executeSolve(chatInput?.value?.trim()));
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); executeSolve(chatInput.value.trim()); }
  });

  // Screen capture & multi-monitor / window source
  $('btn-refresh-sources')?.addEventListener('click', () => refreshCaptureSources());
  $('btn-capture-full')?.addEventListener('click', async () => {
    setStatus('📷 Capturing…', 'pending');
    try {
      const targetVal = $('screen-source-select')?.value || '';
      let img;
      if (targetVal.startsWith('source:') && specter.captureSource) {
        img = await specter.captureSource(targetVal.slice(7));
      } else if (targetVal.startsWith('display:')) {
        img = await specter.captureFullscreen(targetVal.slice(8));
      } else {
        img = await specter.captureFullscreen();
      }
      lastCapture = img;
      showCapturePreview(img);
      setStatus('✅ Captured', 'active');
    } catch (e) {
      setStatus('⚠ Capture Error', 'error');
      renderAnswer(`❌ **Screen Capture Error:** ${e.message}`, true);
      refreshPermissions().catch(() => {});
    }
  });
  $('btn-capture-region')?.addEventListener('click', () => specter.selectRegion());
  $('btn-ocr-solve')?.addEventListener('click', async () => {
    if (!lastCapture) { renderAnswer('⚠️ Capture a screenshot first.', true); return; }
    const ocrEl = $('ocr-text');
    let ocrText = ocrEl?.value?.trim() || '';
    const isPlaceholder = !ocrText || ocrText.startsWith('[Screenshot captured');
    if (isPlaceholder && specter.runOcr) {
      setStatus('🔍 Running Local OCR…', 'pending');
      try {
        const extracted = await specter.runOcr(lastCapture);
        if (extracted && extracted.trim()) {
          ocrText = extracted.trim();
          if (ocrEl) ocrEl.value = ocrText;
        }
      } catch (e) {
        console.warn('[Specter OCR] Error:', e);
      }
    }

    const visionProviders = ['gemini', 'openai', 'anthropic', 'specter-cloud'];
    const isVision = visionProviders.includes(currentProvider || 'gemini');

    let question;
    if (isVision) {
      question = (ocrText && !ocrText.startsWith('[Screenshot captured'))
        ? `Read the exact question, mathematical symbols, exponents, and answer choices directly from the attached screenshot image (do not rely on any OCR typos below) and provide the exact solution:\n\nOCR reference:\n${ocrText}`
        : 'Read the exact problem, math expressions, code, and answer choices directly from the attached screenshot image and solve it accurately.';
    } else {
      question = (ocrText && !ocrText.startsWith('[Screenshot captured'))
        ? ocrText
        : 'Extract and solve the coding/interview problem shown in this image.';
    }
    await executeSolve(question);
  });

  // Permissions & Audio Device Controls
  $('btn-refresh-perms')?.addEventListener('click', () => refreshPermissions());
  $('btn-grant-screen')?.addEventListener('click', async () => {
    if (specter.requestPermission) {
      await specter.requestPermission('screen');
      await refreshPermissions();
    }
  });
  $('btn-grant-mic')?.addEventListener('click', async () => {
    if (specter.requestPermission) {
      const res = await specter.requestPermission('microphone');
      if (!res?.granted && specter.openPrivacySettings) {
        specter.openPrivacySettings('microphone');
      }
      await refreshPermissions();
      await refreshAudioDevices();
    }
  });
  $('setting-audio-mode')?.addEventListener('change', async (e) => {
    audioMode = e.target.value;
    await specter.saveSettings({ audioMode });
    if (isListening) setupAudio();
  });
  $('setting-mic-device')?.addEventListener('change', async (e) => {
    selectedMicId = e.target.value;
    await specter.saveSettings({ micDeviceId: selectedMicId });
    if (isListening) setupAudio();
  });

  // Profile save
  $('btn-save-profile')?.addEventListener('click', async () => {
    const profile = {
      name:   $('prof-name')?.value?.trim()   || '',
      role:   $('prof-role')?.value?.trim()   || '',
      exp:    $('prof-exp')?.value            || '0',
      skills: $('prof-skills')?.value?.trim() || '',
      resume: $('prof-resume')?.value?.trim() || '',
    };
    currentProfile = profile;
    await specter.saveProfile(profile);
    showMsg($('profile-save-msg'), '✅ Profile saved!', true);
  });

  // Keys save
  $('btn-save-keys')?.addEventListener('click', async () => {
    const provider = $('setting-active-provider')?.value || 'gemini';
    currentProvider = provider;

    const apiKeys = {
      groq:        $('key-groq')?.value?.trim()        || undefined,
      gemini:      $('key-gemini')?.value?.trim()      || undefined,
      openai:      $('key-openai')?.value?.trim()      || undefined,
      anthropic:   $('key-anthropic')?.value?.trim()   || undefined,
      openrouter:  $('key-openrouter')?.value?.trim()  || undefined,
    };
    // Remove undefined keys
    Object.keys(apiKeys).forEach(k => { if (!apiKeys[k]) delete apiKeys[k]; });
    deepgramKey = $('key-deepgram')?.value?.trim() || '';

    const stealth = $('toggle-stealth')?.checked !== false;
    const opacity = parseInt($('slider-opacity')?.value || '90') / 100;

    await specter.saveSettings({ activeProvider: provider, apiKeys, deepgramApiKey: deepgramKey, stealth, opacity, disguise: currentDisguise, audioMode, micDeviceId: selectedMicId });

    currentKeys = { ...currentKeys, ...apiKeys };
    specter.setProtection(stealth);
    specter.setOpacity(opacity);
    await specter.setDisguise(currentDisguise);
    updateProviderTag();
    showMsg($('keys-save-msg'), '✅ Settings saved!', true);

    // Re-initialize STT if keys or audio settings changed
    stopAllAudio();
    if (isListening) setupAudio();
  });

  // Test key buttons
  $$('.btn-test').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const provider = e.target.dataset.provider;
      await testKey(provider);
    });
  });

  // Opacity slider
  $('slider-opacity')?.addEventListener('input', (e) => {
    const pct = parseInt(e.target.value);
    if (opacityVal) opacityVal.textContent = pct + '%';
    specter.setOpacity(pct / 100);
  });

  // Stealth toggle
  $('toggle-stealth')?.addEventListener('change', (e) => {
    specter.setProtection(e.target.checked);
  });

  // Header account button → go to account tab
  $('btn-header-account')?.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-content').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-tab="account"]')?.classList.add('active');
    $('tab-account')?.classList.add('active');
  });
}

// ─────────────────────────── Key testing ───────────────────────────
async function testKey(provider) {
  const resultEl = $('key-test-result');
  if (resultEl) { resultEl.textContent = `Testing ${provider}…`; resultEl.style.color = '#aaa'; }

  try {
    if (provider === 'groq') {
      const key = $('key-groq')?.value?.trim();
      if (!key) throw new Error('No key entered');
      const resp = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${key}` } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      showMsg(resultEl, '✅ Groq key valid!', true);
    } else if (provider === 'gemini') {
      const key = $('key-gemini')?.value?.trim();
      if (!key) throw new Error('No key entered');
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      showMsg(resultEl, '✅ Gemini key valid!', true);
    } else if (provider === 'openai') {
      const key = $('key-openai')?.value?.trim();
      if (!key) throw new Error('No key entered');
      const resp = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      showMsg(resultEl, '✅ OpenAI key valid!', true);
    } else if (provider === 'anthropic') {
      showMsg(resultEl, 'ℹ️ Anthropic key validated on first use.', true);
    } else if (provider === 'openrouter') {
      const key = $('key-openrouter')?.value?.trim();
      if (!key) throw new Error('No key entered');
      const resp = await fetch('https://openrouter.ai/api/v1/models', { headers: { Authorization: `Bearer ${key}` } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      showMsg(resultEl, '✅ OpenRouter key valid!', true);
    } else if (provider === 'deepgram') {
      const key = $('key-deepgram')?.value?.trim();
      if (!key) throw new Error('No key entered');
      const resp = await fetch('https://api.deepgram.com/v1/projects', { headers: { Authorization: `Token ${key}` } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      showMsg(resultEl, '✅ Deepgram key valid!', true);
    }
  } catch (e) {
    showMsg(resultEl, `❌ ${provider}: ${e.message}`, false);
  }
}

// ─────────────────────────── Quick Chips ───────────────────────────
function setupQuickChips() {
  const prompts = {
    'solve-code':      'Solve this coding problem with the optimal algorithm and working code:',
    'solve-sql':       'Write the SQL query to solve this problem:',
    'solve-system':    'Provide a system design answer for:',
    'solve-behavioral':'Give a strong STAR-format behavioral answer for:',
    'solve-mcq':       'Select the correct answer and explain briefly:',
    'solve-math':      'Solve this math/statistics problem step by step:',
    'explain-code':    'Explain this code clearly, what it does and how:',
    'debug-code':      'Debug this code, find and fix all issues:',
  };

  $$('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.prompt;
      const prefix = prompts[key] || '';
      if (chatInput) chatInput.value = prefix + '\n' + (accumulatedText.trim() || '');
      chatInput?.focus();
    });
  });
}

// ─────────────────────────── OCR integration ───────────────────────────
specter.onRegionShot?.((dataUrl) => {
  if (!dataUrl) return;
  lastCapture = dataUrl;
  showCapturePreview(dataUrl);
  const ocrEl = $('ocr-text');
  if (ocrEl) ocrEl.value = '[Screenshot captured — click OCR + Solve to extract text]';
});

// ─────────────────────────── Boot ───────────────────────────
async function init() {
  console.log('[Specter AI] v5.0 booting…');
  try { setupTabs(); } catch (e) { console.error('[init] setupTabs:', e); }
  try { await loadState(); } catch (e) { console.error('[init] loadState:', e); }
  try { await setupAccountUI(); } catch (e) { console.error('[init] setupAccountUI:', e); }
  try { setupAudio(); } catch (e) { console.error('[init] setupAudio:', e); }
  try { setupHotkeys(); } catch (e) { console.error('[init] setupHotkeys:', e); }
  try { setupEventListeners(); } catch (e) { console.error('[init] setupEventListeners:', e); }
  try { setupQuickChips(); } catch (e) { console.error('[init] setupQuickChips:', e); }
  setStatus('● Ready', '');
  console.log('[Specter AI] Initialized successfully');
}

document.addEventListener('DOMContentLoaded', init);

})();
