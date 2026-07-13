/**
 * AI Meme Factory — app.js
 * Core meme-generation engine, canvas drawing, effects, history
 */

/* ============================================================
   STATE
   ============================================================ */
const state = {
  chaosMode: false,
  autoDeepFry: false,
  deepFried: false,
  currentTemplate: null,
  currentCaptions: [],
  history: [],            // array of { dataUrl, templateName, caption }
  currentDataUrl: null,
  currentRawDataUrl: null, // before deep fry
};

/* ============================================================
   DOM REFS
   ============================================================ */
const $ = id => document.getElementById(id);
const canvas      = $('memeCanvas');
const ctx         = canvas.getContext('2d');
const placeholder = $('placeholder');
const glowRing    = $('glowRing');
const statusPill  = $('statusPill');
const memeMeta    = $('memeMeta');
const chaosBadge  = $('chaosBadge');
const historyGrid = $('historyGrid');
const toast       = $('toast');
const settingsModal = $('settingsModal');
const inputApiKey   = $('inputApiKey');
const canvasWrapper = document.querySelector('.canvas-wrapper');

/* ============================================================
   UTILITY
   ============================================================ */
function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toastMsg(msg, duration = 2500) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function setStatus(msg, type = '') {
  statusPill.textContent = msg;
  statusPill.className = 'status-pill' + (type ? ' ' + type : '');
}

/* ============================================================
   BACKGROUND PARTICLES
   ============================================================ */
function createParticles() {
  const container = $('bgParticles');
  const colors = ['#b44dff','#00f0ff','#ff2d78','#ffd700','#39ff14'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = randInt(2, 6);
    const color = rand(colors);
    const left  = randInt(0, 100);
    const dur   = randInt(8, 20);
    const delay = randInt(0, 15);
    Object.assign(p.style, {
      width: size + 'px',
      height: size + 'px',
      left: left + '%',
      background: color,
      boxShadow: `0 0 ${size*3}px ${color}`,
      animationDuration: dur + 's',
      animationDelay: delay + 's',
    });
    container.appendChild(p);
  }
}

/* ============================================================
   CAPTION SELECTION
   ============================================================ */
function pickCaptions(template, cursedMode = false) {
  const panelCount = template.panels.length;
  const bank = cursedMode ? CAPTIONS_CURSED : null;

  if (cursedMode) {
    const pair = rand(CAPTIONS_CURSED);
    if (panelCount === 1) return [pair[0]];
    if (panelCount === 2) return [pair[0], pair[1]];
    if (panelCount >= 3) {
      const multi = rand(CAPTIONS_MULTIPANEL);
      return multi.slice(0, panelCount);
    }
  }

  if (panelCount === 1) {
    return [rand(CAPTIONS_SINGLE)];
  }
  if (panelCount === 2) {
    const pair = rand(CAPTIONS_TWOPANEL);
    return [pair[0], pair[1]];
  }
  if (panelCount >= 3) {
    const multi = rand(CAPTIONS_MULTIPANEL);
    return multi.slice(0, panelCount);
  }
  return [''];
}

/* ============================================================
   CANVAS DRAWING
   ============================================================ */
const CANVAS_SIZE = 600;

function drawMemeText(captionList, template, chaosMode) {
  const W = canvas.width;
  const H = canvas.height;

  template.panels.forEach((panel, i) => {
    const text = captionList[i] || '';
    if (!text) return;

    const maxW = panel.w * W;
    const cx   = panel.x * W;
    const cy   = panel.y * H;

    // Dynamic font size
    let fontSize = Math.floor(W * 0.07);
    ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;

    // Shrink font until text fits
    while (fontSize > 12) {
      ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
      const lines = wrapText(ctx, text, maxW);
      const totalH = lines.length * fontSize * 1.15;
      if (totalH < H * 0.22 && ctx.measureText(lines[0] || '').width < maxW) break;
      fontSize -= 2;
    }

    const lines = wrapText(ctx, text, maxW);
    const lineH  = fontSize * 1.2;
    const totalH = lines.length * lineH;
    const startY = cy - totalH / 2 + lineH * 0.8;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    lines.forEach((line, li) => {
      const y = startY + li * lineH;

      // Chaos color variation
      const fillColor = chaosMode ? rand(['#fff','#ff0','#0ff','#f0f','#0f0']) : '#ffffff';

      // Thick black outline
      ctx.lineWidth = Math.max(3, fontSize * 0.14);
      ctx.strokeStyle = '#000000';
      ctx.lineJoin = 'round';
      ctx.strokeText(line, cx, y);

      // White fill
      ctx.fillStyle = fillColor;
      ctx.fillText(line, cx, y);
    });
  });
}

function wrapText(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/* ─── Chaos overlay: emojis + sticker text ──────── */
function drawChaosOverlays() {
  const W = canvas.width;
  const H = canvas.height;

  // Random emoji clusters
  const emojiCount = randInt(3, 7);
  for (let i = 0; i < emojiCount; i++) {
    const emoji = rand(CHAOS_EMOJIS);
    const size  = randInt(30, 70);
    const x     = randInt(size, W - size);
    const y     = randInt(size, H - size);
    const angle = (Math.random() - 0.5) * 0.8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.75 + Math.random() * 0.25;
    ctx.fillText(emoji, 0, 0);
    ctx.restore();
  }

  // Random sticker text
  const stickerCount = randInt(1, 3);
  for (let i = 0; i < stickerCount; i++) {
    const sticker = rand(CHAOS_STICKER_TEXTS);
    const size    = randInt(18, 38);
    const x       = randInt(20, W - 20);
    const y       = randInt(20, H - 20);
    const angle   = (Math.random() - 0.5) * 0.6;
    const hue     = randInt(0, 360);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `900 ${size}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.9;
    // Background pill
    const tw = ctx.measureText(sticker).width;
    ctx.fillStyle = `hsla(${hue},100%,50%,0.85)`;
    const pad = 6;
    ctx.beginPath();
    ctx.roundRect(-tw/2 - pad, -size/2 - pad, tw + pad*2, size + pad*2, 6);
    ctx.fill();
    // Text
    ctx.fillStyle = '#000';
    ctx.fillText(sticker, 0, 0);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

/* ─── Watermark ─────────────────────────────────── */
function drawWatermark(templateName) {
  const tag = rand(HASHTAGS) + ' • ' + templateName;
  ctx.save();
  ctx.font = '700 11px Outfit, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(tag, canvas.width - 8, canvas.height - 6);
  ctx.restore();
}

/* ============================================================
   DEEP FRY EFFECT (canvas pixel manipulation)
   ============================================================ */
function applyDeepFry() {
  if (!state.currentRawDataUrl) return;
  state.deepFried = true;
  canvas.classList.add('deepfried');

  // Also apply pixel-level manipulation
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Boost saturation & contrast
    let r = data[i], g = data[i+1], b = data[i+2];
    // Contrast
    r = Math.min(255, Math.max(0, (r - 128) * 2.2 + 128));
    g = Math.min(255, Math.max(0, (g - 128) * 2.2 + 128));
    b = Math.min(255, Math.max(0, (b - 128) * 2.2 + 128));
    // Saturate (push toward dominant channel)
    const avg = (r + g + b) / 3;
    r = Math.min(255, avg + (r - avg) * 3.5);
    g = Math.min(255, avg + (g - avg) * 3.5);
    b = Math.min(255, avg + (b - avg) * 3.5);
    // JPEG noise
    const noise = (Math.random() - 0.5) * 30;
    data[i]   = Math.min(255, Math.max(0, r + noise));
    data[i+1] = Math.min(255, Math.max(0, g + noise * 0.5));
    data[i+2] = Math.min(255, Math.max(0, b + noise * 0.7));
  }
  ctx.putImageData(imageData, 0, 0);

  // Add "DEEP FRIED" stamp
  ctx.save();
  ctx.font = '900 48px Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,100,0,0.55)';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.rotate(-0.2);
  ctx.strokeText('🔥 DEEP FRIED 🔥', canvas.width/2, canvas.height*0.5);
  ctx.fillText('🔥 DEEP FRIED 🔥', canvas.width/2, canvas.height*0.5);
  ctx.restore();

  state.currentDataUrl = canvas.toDataURL('image/png');
}

function removeDeepFry() {
  state.deepFried = false;
  canvas.classList.remove('deepfried');
}

/* ============================================================
   CORE MEME GENERATION
   ============================================================ */
function generateMeme(opts = {}) {
  const { cursed = false, keepTemplate = false } = opts;

  removeDeepFry();

  // Pick template
  const template = keepTemplate && state.currentTemplate
    ? state.currentTemplate
    : rand(MEME_TEMPLATES);
  state.currentTemplate = template;

  // Pick captions
  const captions = pickCaptions(template, cursed);
  state.currentCaptions = captions;

  // UI state
  glowRing.classList.add('loading');
  setStatus('Generating...', 'generating');

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = template.url;

  img.onload = () => {
    // Show canvas, hide placeholder
    placeholder.style.display = 'none';
    canvas.style.display = 'block';

    // Set canvas dimensions to match image aspect ratio (capped at 600)
    const aspect = img.height / img.width;
    canvas.width  = CANVAS_SIZE;
    canvas.height = Math.round(CANVAS_SIZE * aspect);

    // Clear & draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw captions
    drawMemeText(captions, template, state.chaosMode);

    // Chaos overlays
    if (state.chaosMode) {
      drawChaosOverlays();
    }

    // Watermark
    drawWatermark(template.name);

    // Capture raw (pre-deepfry) data URL
    state.currentRawDataUrl = canvas.toDataURL('image/png');
    state.currentDataUrl    = state.currentRawDataUrl;

    // Auto deep fry
    if (state.autoDeepFry) {
      applyDeepFry();
    }

    // Update state
    state.currentDataUrl = canvas.toDataURL('image/png');

    // History
    addToHistory(state.currentDataUrl, template.name, captions[0] || '');

    // UI update
    glowRing.classList.remove('loading');
    if (state.chaosMode) glowRing.classList.add('chaos');
    else glowRing.classList.remove('chaos');

    setStatus('✨ Meme generated!', 'done');
    memeMeta.textContent = `Template: ${template.name} • ${template.panels.length} panel${template.panels.length > 1 ? 's' : ''}`;

    setTimeout(() => setStatus('Ready to create chaos'), 3000);
  };

  img.onerror = () => {
    // Fallback: draw solid color placeholder meme
    canvas.width  = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    placeholder.style.display = 'none';
    canvas.style.display = 'block';

    const colors = ['#1a0033','#001a33','#1a1a00','#001a0d','#33001a'];
    ctx.fillStyle = rand(colors);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw template name
    ctx.font = '900 36px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillText(template.name, canvas.width/2, canvas.height/2);

    drawMemeText(captions, template, state.chaosMode);
    if (state.chaosMode) drawChaosOverlays();
    drawWatermark(template.name);

    state.currentRawDataUrl = canvas.toDataURL('image/png');
    state.currentDataUrl    = state.currentRawDataUrl;

    if (state.autoDeepFry) applyDeepFry();

    addToHistory(state.currentDataUrl, template.name, captions[0] || '');
    glowRing.classList.remove('loading');
    setStatus('✨ Meme generated! (offline mode)', 'done');
    memeMeta.textContent = `Template: ${template.name} (offline)`;
    setTimeout(() => setStatus('Ready to create chaos'), 3000);
  };
}

/* ============================================================
   HISTORY
   ============================================================ */
function addToHistory(dataUrl, templateName, caption) {
  state.history.unshift({ dataUrl, templateName, caption });
  if (state.history.length > 10) state.history.pop();
  renderHistory();
}

function renderHistory() {
  if (state.history.length === 0) {
    historyGrid.innerHTML = '<p class="history-empty">Your meme history will appear here...</p>';
    return;
  }

  historyGrid.innerHTML = '';
  state.history.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `Meme: ${item.templateName}`);
    div.title = item.caption || item.templateName;

    const img = document.createElement('img');
    img.src = item.dataUrl;
    img.alt = item.templateName;
    img.loading = 'lazy';

    const label = document.createElement('div');
    label.className = 'history-item-label';
    label.textContent = item.templateName;

    div.appendChild(img);
    div.appendChild(label);

    div.addEventListener('click', () => {
      // Load this history item onto canvas
      loadHistoryItem(item);
    });
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') loadHistoryItem(item);
    });

    historyGrid.appendChild(div);
  });
}

function loadHistoryItem(item) {
  const image = new Image();
  image.onload = () => {
    canvas.width  = image.width;
    canvas.height = image.height;
    placeholder.style.display = 'none';
    canvas.style.display = 'block';
    ctx.drawImage(image, 0, 0);
    state.currentDataUrl    = item.dataUrl;
    state.currentRawDataUrl = item.dataUrl;
    state.currentTemplate   = MEME_TEMPLATES.find(t => t.name === item.templateName) || null;
    memeMeta.textContent = `Template: ${item.templateName} (from history)`;
    setStatus('Loaded from history', 'done');
    toastMsg('📂 Loaded from history');
    setTimeout(() => setStatus('Ready to create chaos'), 2500);
  };
  image.src = item.dataUrl;
}

/* ============================================================
   DOWNLOAD
   ============================================================ */
function downloadMeme() {
  if (!state.currentDataUrl) {
    toastMsg('⚠️ Generate a meme first!');
    return;
  }
  const link = document.createElement('a');
  link.download = `meme-factory-${Date.now()}.png`;
  link.href = state.currentDataUrl;
  link.click();
  toastMsg('⬇️ Meme downloaded!');
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
$('btnGenerate').addEventListener('click', () => generateMeme());
$('btnAnother') .addEventListener('click', () => generateMeme());
$('btnCursed')  .addEventListener('click', () => {
  if (!state.currentTemplate) {
    generateMeme({ cursed: true });
  } else {
    // Re-draw current template with cursed captions
    state.currentCaptions = pickCaptions(state.currentTemplate, true);
    removeDeepFry();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = state.currentTemplate.url;
    img.onload = () => {
      const aspect = img.height / img.width;
      canvas.width  = CANVAS_SIZE;
      canvas.height = Math.round(CANVAS_SIZE * aspect);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawMemeText(state.currentCaptions, state.currentTemplate, true);
      drawChaosOverlays();
      drawWatermark(state.currentTemplate.name);
      state.currentRawDataUrl = canvas.toDataURL('image/png');
      state.currentDataUrl    = state.currentRawDataUrl;
      if (state.autoDeepFry) applyDeepFry();
      addToHistory(state.currentDataUrl, state.currentTemplate.name, state.currentCaptions[0] || '');
      setStatus('💀 Maximum cursed!', 'done');
      toastMsg('💀 Cursed mode activated!');
      setTimeout(() => setStatus('Ready to create chaos'), 3000);
    };
    img.onerror = () => toastMsg('⚠️ Could not reload image');
  }
});

$('btnDeepFry').addEventListener('click', () => {
  if (!state.currentDataUrl) {
    toastMsg('⚠️ Generate a meme first!');
    return;
  }
  if (state.deepFried) {
    toastMsg('🔥 Already deep fried!');
    return;
  }
  // Redraw from raw so we can manipulate pixels
  const img = new Image();
  img.onload = () => {
    canvas.width  = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    applyDeepFry();
    toastMsg('🔥 Deep fried! Crispy!');
    setStatus('🔥 Deep fried!', 'done');
  };
  img.src = state.currentRawDataUrl;
});

$('btnChaos').addEventListener('click', () => {
  if (!state.currentDataUrl) {
    state.chaosMode = true;
    generateMeme();
    return;
  }
  // Add chaos overlays to existing meme
  const img = new Image();
  img.onload = () => {
    canvas.width  = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    drawChaosOverlays();
    state.currentRawDataUrl = canvas.toDataURL('image/png');
    state.currentDataUrl    = state.currentRawDataUrl;
    toastMsg('🌀 CHAOS APPLIED!');
    glowRing.classList.add('chaos');
    setStatus('🌀 Chaos injected!', 'done');
    setTimeout(() => setStatus('Ready to create chaos'), 3000);
  };
  img.src = state.currentRawDataUrl;
});

$('btnDownload').addEventListener('click', downloadMeme);

$('btnClearHistory').addEventListener('click', () => {
  state.history = [];
  renderHistory();
  toastMsg('🗑️ History cleared');
});

// Toggle: Chaos Mode
$('toggleChaos').addEventListener('change', function () {
  state.chaosMode = this.checked;
  chaosBadge.textContent = state.chaosMode ? 'CHAOS ON' : 'CHAOS OFF';
  chaosBadge.classList.toggle('active', state.chaosMode);
  if (state.chaosMode) glowRing.classList.add('chaos');
  else glowRing.classList.remove('chaos');
  toastMsg(state.chaosMode ? '🌀 Chaos Mode ON — BEWARE' : '🛑 Chaos Mode OFF');
});

// Toggle: Auto Deep Fry
$('toggleAutoDeepFry').addEventListener('change', function () {
  state.autoDeepFry = this.checked;
  toastMsg(state.autoDeepFry ? '🔥 Auto Deep-Fry ON' : '❄️ Auto Deep-Fry OFF');
});

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    generateMeme();
  }
  if (e.code === 'KeyD') downloadMeme();
  if (e.code === 'KeyC') $('btnCursed').click();
  if (e.code === 'KeyF') $('btnDeepFry').click();
});

/* ============================================================
   MODAL & API KEY
   ============================================================ */
let apiKey = localStorage.getItem('memeApiKey') || '';

$('btnSettings').addEventListener('click', () => {
  inputApiKey.value = apiKey;
  settingsModal.classList.add('show');
});

$('btnCancelSettings').addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

$('btnSaveSettings').addEventListener('click', () => {
  apiKey = inputApiKey.value.trim();
  localStorage.setItem('memeApiKey', apiKey);
  settingsModal.classList.remove('show');
  toastMsg('✅ API Key saved securely!');
});

/* ============================================================
   DRAG & DROP + AI LOGIC
   ============================================================ */
canvasWrapper.addEventListener('dragover', e => {
  e.preventDefault();
  canvasWrapper.classList.add('drag-over');
});

canvasWrapper.addEventListener('dragleave', e => {
  e.preventDefault();
  canvasWrapper.classList.remove('drag-over');
});

canvasWrapper.addEventListener('drop', e => {
  e.preventDefault();
  canvasWrapper.classList.remove('drag-over');
  
  if (!apiKey) {
    toastMsg('⚠️ Please add your Gemini API Key in Settings first!');
    settingsModal.classList.add('show');
    return;
  }

  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) {
    toastMsg('⚠️ Please drop a valid image file!');
    return;
  }

  handleCustomImageDrop(file);
});

function handleCustomImageDrop(file) {
  const reader = new FileReader();
  
  glowRing.classList.add('loading');
  setStatus('AI is analyzing image...', 'generating');
  removeDeepFry();

  reader.onload = async (e) => {
    const base64DataUrl = e.target.result;
    // Extract base64 without the prefix
    const base64String = base64DataUrl.split(',')[1];
    const mimeType = file.type;

    try {
      // 1. Call Gemini AI
      const caption = await generateAI_Caption(base64String, mimeType);
      
      // 2. Load image onto canvas
      const img = new Image();
      img.onload = () => {
        placeholder.style.display = 'none';
        canvas.style.display = 'block';

        const aspect = img.height / img.width;
        canvas.width  = CANVAS_SIZE;
        canvas.height = Math.round(CANVAS_SIZE * aspect);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 3. Draw AI text
        // Custom template: single panel at the bottom
        const customTemplate = {
          name: 'AI Custom Drop',
          panels: [{ x: 0.5, y: 0.88, w: 0.9, align: 'center', position: 'bottom' }]
        };

        drawMemeText([caption], customTemplate, state.chaosMode);
        
        if (state.chaosMode) drawChaosOverlays();
        drawWatermark('AI Custom');

        state.currentRawDataUrl = canvas.toDataURL('image/png');
        state.currentDataUrl    = state.currentRawDataUrl;
        state.currentTemplate   = customTemplate;
        state.currentCaptions   = [caption];

        if (state.autoDeepFry) applyDeepFry();

        addToHistory(state.currentDataUrl, 'AI Custom Drop', caption);

        glowRing.classList.remove('loading');
        setStatus('✨ AI Meme generated!', 'done');
        memeMeta.textContent = `Custom Image • AI Analyzed`;
        setTimeout(() => setStatus('Ready to create chaos'), 3000);
      };
      img.src = base64DataUrl;

    } catch (err) {
      console.error(err);
      toastMsg('❌ AI Error: ' + err.message);
      glowRing.classList.remove('loading');
      setStatus('AI Analysis failed', 'error');
    }
  };
  reader.readAsDataURL(file);
}

async function generateAI_Caption(base64String, mimeType) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [
        { text: "Analyze this image and write a hilarious, slightly cursed, internet-humor meme caption for it. Return ONLY the caption text, without quotes. Keep it punchy." },
        { inline_data: { mime_type: mimeType, data: base64String } }
      ]
    }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'API request failed');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.replace(/^"|"$/g, '').trim(); // strip quotes just in case
}

/* ============================================================
   INIT
   ============================================================ */
createParticles();
setStatus('Ready to create chaos');
renderHistory();

// Nudge the button with a subtle entry animation
setTimeout(() => {
  $('btnGenerate').style.transform = 'scale(1.03)';
  setTimeout(() => $('btnGenerate').style.transform = '', 300);
}, 600);
