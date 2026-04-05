let audioContext;
let analyser;
let micStream;
let dataArray;

async function initMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    listenBlow();
  } catch (err) {
    console.log("Mic error:", err);
    alert("Izinkan akses mikrofon dulu ya 🎤");
  }
}

let blowCooldown = false;

function listenBlow() {
  function detect() {
    analyser.getByteFrequencyData(dataArray);

    let volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    // lebih stabil (tidak terlalu sensitif)
    if (volume > 65 && !blowCooldown) {
      blowAllCandles();
      blowCooldown = true;

      setTimeout(() => {
        blowCooldown = false;
      }, 5000);
    }

    requestAnimationFrame(detect);
  }

  detect();
}

function blowAllCandles() {
  for (let i = 1; i <= totalCandles; i++) {
    blowCandle(i);
  }
}

document.addEventListener('click', () => {
  if (!audioContext) {
    initMic();
  }
}, { once: true });

  /* ── STARS ── */
  const starsContainer = document.getElementById('stars');
  for (let i = 0; i < 120; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    star.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%; top: ${Math.random() * 100}%;
      --d: ${2 + Math.random() * 4}s;
      --delay: -${Math.random() * 6}s;
      --op: ${0.4 + Math.random() * 0.6};
    `;
    starsContainer.appendChild(star);
  }

  /* ── CONFETTI ── */
  const colors = ['#f2a7b8','#e8c87a','#b8a5d4','#fce8ee','#d4647e','#fff8e1'];
  const confettiContainer = document.getElementById('confetti');
  for (let i = 0; i < 50; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    const dur = 4 + Math.random() * 5;
    c.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 6}px;
      height: ${10 + Math.random() * 8}px;
      animation-duration: ${dur}s;
      animation-delay: -${Math.random() * dur}s;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      opacity: ${0.6 + Math.random() * 0.4};
    `;
    confettiContainer.appendChild(c);
  }

  /* ── AUDIO ── */
  const audio = document.getElementById('audio');
  const vinyl = document.getElementById('vinyl');
  const playIcon = document.getElementById('play-icon');
  const playBtnText = document.getElementById('play-btn-text');
  let playing = false;

  function togglePlay() {
    if (playing) {
      audio.pause();
      vinyl.classList.remove('playing');
      playIcon.textContent = '▶';
      playBtnText.textContent = '▶ Putar Lagu';
    } else {
      audio.play().catch(() => {});
      vinyl.classList.add('playing');
      playIcon.textContent = '⏸';
      playBtnText.textContent = '⏸ Jeda';
    }
    playing = !playing;
  }

  /* ── EDIT PANEL ── */
  function togglePanel() {
    document.getElementById('edit-panel').classList.toggle('hidden');
  }

  function applyChanges() {
    const name = document.getElementById('input-name').value || 'Namamu';
    const age = document.getElementById('input-age').value || '21';
    const msg = document.getElementById('input-msg').value;
    const quote = document.getElementById('input-quote').value;
    const sender = document.getElementById('input-sender').value;
    const song = document.getElementById('input-song').value;

    document.getElementById('display-name').textContent = name;
    document.getElementById('display-age').textContent = age;

    if (msg) document.getElementById('display-msg').textContent = msg;
    if (quote) document.getElementById('display-quote').textContent = `"${quote}"`;
    if (sender) document.getElementById('display-sender').textContent = `— ${sender} 💕`;
    if (song) document.getElementById('song-name-display').textContent = song;

    document.getElementById('edit-panel').classList.add('hidden');
  }

  /* ── GALLERY ── */
  const MAX_SLOTS = 9;
  let photos = [
  {
    src: "img/foto1.jpg",  },
  {
    src: "img/foto2.jpg",  },
  {
    src: "img/foto3.jpg",  },
  {
    src: "img/foto4.jpg",  },
  {
    src: "img/foto5.jpg",  },
  {
    src: "img/foto6.jpg",  },
  {
    src: "img/foto7.jpg",  },
  {
    src: "img/foto8.jpg",  },
  {
    src: "img/foto9.jpg",  }
];
  let lbIndex = 0;
  let pendingSlot = null;
  let pendingFile = null;

  function buildGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    photos.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <img src="${p.src}" alt="${p.caption || ''}">
        <div class="caption-overlay">${p.caption || ''}</div>
      `;
      item.addEventListener('click', () => openLightbox(i));
      grid.appendChild(item);
    });
  }

  function openAddModal(slotIndex) {
    pendingSlot = slotIndex;
    pendingFile = null;
    document.getElementById('preview-thumb').style.display = 'none';
    document.getElementById('preview-thumb').src = '';
    document.getElementById('caption-input').value = '';
    document.getElementById('file-input').value = '';
    document.getElementById('add-photo-modal').classList.add('active');
  }

  function closeAddModal() {
    document.getElementById('add-photo-modal').classList.remove('active');
    pendingFile = null;
  }

  function previewFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    pendingFile = file;
    const reader = new FileReader();
    reader.onload = ev => {
      const thumb = document.getElementById('preview-thumb');
      thumb.src = ev.target.result;
      thumb.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  function confirmAddPhoto() {
    if (!pendingFile) { alert('Pilih foto dulu ya! 📸'); return; }
    const caption = document.getElementById('caption-input').value.trim();
    const reader = new FileReader();
    reader.onload = ev => {
      photos.push({ src: ev.target.result, caption });
      buildGallery();
      closeAddModal();
    };
    reader.readAsDataURL(pendingFile);
  }

  /* Drag over effect */
  const dropZone = document.getElementById('drop-zone');
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      pendingFile = file;
      const reader = new FileReader();
      reader.onload = ev => {
        const thumb = document.getElementById('preview-thumb');
        thumb.src = ev.target.result;
        thumb.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  function openLightbox(index) {
    lbIndex = index;
    updateLightbox();
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(e) {
    if (e && e.target !== document.getElementById('lightbox') && !e.target.classList.contains('lb-close')) return;
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
  }

  function lbNav(dir) {
    lbIndex = (lbIndex + dir + photos.length) % photos.length;
    updateLightbox();
  }

  function updateLightbox() {
    const p = photos[lbIndex];
    document.getElementById('lb-img').src = p.src;
    document.getElementById('lb-caption').textContent = p.caption || '';
    document.getElementById('lb-counter').textContent = `${lbIndex + 1} / ${photos.length}`;
  }

  /* keyboard nav for lightbox */
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') lbNav(-1);
    if (e.key === 'ArrowRight') lbNav(1);
    if (e.key === 'Escape') { lb.classList.remove('active'); document.body.style.overflow = ''; }
  });

  buildGallery();

  /* ── COUNTDOWN ── */
  let cdTarget = new Date("2026-04-06T00:00:00");
  let cdInterval = null;

tickCountdown();
cdInterval = setInterval(tickCountdown, 1000);

  function tickCountdown() {
  if (!cdTarget) return;

  const now = new Date();
  const diff = cdTarget - now;

  if (diff <= 0) {
    unlockPage();
    launchFireworks(5000); // 10 detik
    return;
  }

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);

  document.getElementById('cd-days').textContent  = String(days).padStart(2,'0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2,'0');
  document.getElementById('cd-mins').textContent  = String(mins).padStart(2,'0');
  document.getElementById('cd-secs').textContent  = String(secs).padStart(2,'0');
}

function unlockPage() {
  document.getElementById('lock-screen').style.display = 'none';
  document.getElementById('main-content').classList.remove('hidden');

  launchFireworks(5000); // 🎆 nyala 10 detik
}

const SECRET_PASSWORD = "louisacantik"; // ganti bebas

function checkPassword() {
  const input = document.getElementById('password-input').value;

  if (input === SECRET_PASSWORD) {
    unlockPage();
  } else {
    alert("Password salah 😢");
  }
}

  /* ── THEME SWITCHER ── */
  const themeMap = { pink:'', blue:'theme-blue', green:'theme-green', purple:'theme-purple', gold:'theme-gold' };
  function setTheme(t) {
    document.body.className = themeMap[t] || '';
    document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
    document.querySelector(`.t-${t}`).classList.add('active');
  }

  /* ── CANDLES ── */
  let blownCandles = new Set();
  const totalCandles = 5;

  function blowCandle(n) {
    if (blownCandles.has(n)) return;
    blownCandles.add(n);
    const flame = document.getElementById('flame' + n);
    const smoke = document.getElementById('smoke' + n);
    flame.classList.add('blown');
    smoke.classList.add('rising');
    setTimeout(() => smoke.classList.remove('rising'), 1500);
    if (blownCandles.size === totalCandles) {
      setTimeout(() => {
        document.getElementById('wish-popup').classList.add('show');
        document.getElementById('candle-hint').style.display = 'none';
        document.getElementById('relight-btn').style.display = 'inline-block';
        launchFireworks();
      }, 400);
    }
  }

  function relightCandles() {
    blownCandles.clear();
    for (let i = 1; i <= totalCandles; i++) {
      const flame = document.getElementById('flame' + i);
      flame.classList.remove('blown');
      flame.style.cssText = '';
    }
    document.getElementById('wish-popup').classList.remove('show');
    document.getElementById('candle-hint').style.display = '';
    document.getElementById('relight-btn').style.display = 'none';
  }

  /* ── GREETING CARD ── */
  const cardStyles = {
    classic: { bg: 'linear-gradient(135deg,#2d1b3d 0%,#1a1025 50%,#2d1b3d 100%)', emojis: '🌸 🎂 🌸', patternOpacity: '0.07' },
    minimal: { bg: 'linear-gradient(160deg,#1a1025 0%,#0d0818 100%)', emojis: '✦  ✦  ✦', patternOpacity: '0.03' },
    bold:    { bg: 'linear-gradient(135deg,#3d0b20 0%,#1a0812 50%,#1e0a2d 100%)', emojis: '🎉 🎊 🎉', patternOpacity: '0.12' }
  };
  let currentCardStyle = 'classic';

  function setCardStyle(s) {
    currentCardStyle = s;
    const st = cardStyles[s];
    document.getElementById('greeting-card').style.background = st.bg;
    document.getElementById('card-emojis').textContent = st.emojis;
    document.querySelector('.card-bg-pattern').style.opacity = st.patternOpacity;
    document.querySelectorAll('.card-style-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
  }

  function syncCardContent() {
    const name = document.getElementById('display-name').textContent;
    const msg  = document.getElementById('display-msg').textContent.trim();
    const from = document.getElementById('display-sender').textContent;
    document.getElementById('card-name').textContent = name;
    document.getElementById('card-msg').textContent  = msg.slice(0, 120) + (msg.length > 120 ? '…' : '');
    document.getElementById('card-from').textContent = from;
  }
  syncCardContent();

  function downloadCard() {
    syncCardContent();
    const card = document.getElementById('greeting-card');
    const w = card.offsetWidth, h = card.offsetHeight;
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = w * scale; canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    const grad = ctx.createLinearGradient(0,0,w,h);
    grad.addColorStop(0,'#2d1b3d'); grad.addColorStop(0.5,'#1a1025'); grad.addColorStop(1,'#2d1b3d');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(242,167,184,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(12,12,w-24,h-24,16);
    else ctx.rect(12,12,w-24,h-24);
    ctx.stroke();
    ctx.textAlign = 'center';
    const cx = w/2;
    ctx.fillStyle = '#e8c87a'; ctx.font = Math.round(h*0.1)+'px serif';
    ctx.fillText(document.getElementById('card-emojis').textContent, cx, h*0.28);
    ctx.fillStyle = '#e8c87a'; ctx.font = '700 '+Math.round(h*0.1)+'px serif';
    ctx.fillText('Selamat Ulang Tahun', cx, h*0.42);
    ctx.fillStyle = '#f2a7b8'; ctx.font = 'italic '+Math.round(h*0.13)+'px serif';
    ctx.fillText(document.getElementById('card-name').textContent, cx, h*0.58);
    ctx.fillStyle = '#b8a5d4'; ctx.font = Math.round(h*0.05)+'px sans-serif';
    const msgLines = wrapText(ctx, document.getElementById('card-msg').textContent, w-80);
    msgLines.forEach((line,i) => ctx.fillText(line, cx, h*0.71 + i*(Math.round(h*0.07))));
    ctx.fillStyle = '#9b7faa'; ctx.font = Math.round(h*0.055)+'px sans-serif';
    ctx.fillText(document.getElementById('card-from').textContent, cx, h*0.91);
    const link = document.createElement('a');
    link.download = 'kartu-ulang-tahun.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function wrapText(ctx, text, maxW) {
    const words = text.split(' '); const lines = []; let line = '';
    words.forEach(w => {
      const test = line + (line ? ' ' : '') + w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  function printCard() {
    syncCardContent();
    const html = `<!DOCTYPE html><html><head><style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans&display=swap');
      body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#1a1025;}
      .card{width:560px;height:373px;border-radius:24px;overflow:hidden;background:linear-gradient(135deg,#2d1b3d,#1a1025,#2d1b3d);display:flex;align-items:center;justify-content:center;text-align:center;position:relative;font-family:Playfair Display,serif;}
      .border{position:absolute;inset:12px;border:1px solid rgba(242,167,184,.25);border-radius:16px;}
      .inner{position:relative;z-index:1;}
      .em{font-size:1.6rem;margin-bottom:.5rem;letter-spacing:6px;}
      .t{color:#e8c87a;font-size:1.4rem;font-weight:700;margin-bottom:.3rem;}
      .n{color:#f2a7b8;font-size:2rem;font-style:italic;margin-bottom:.6rem;}
      .m{color:#b8a5d4;font-size:.82rem;line-height:1.6;max-width:380px;font-family:DM Sans,sans-serif;}
      .f{margin-top:.8rem;color:#9b7faa;font-size:.75rem;letter-spacing:2px;text-transform:uppercase;font-family:DM Sans,sans-serif;}
      @media print{body{background:#1a1025 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
    </style></head><body>
    <div class="card"><div class="border"></div><div class="inner">
      <div class="em">${document.getElementById('card-emojis').textContent}</div>
      <div class="t">Selamat Ulang Tahun</div>
      <div class="n">${document.getElementById('card-name').textContent}</div>
      <div class="m">${document.getElementById('card-msg').textContent}</div>
      <div class="f">${document.getElementById('card-from').textContent}</div>
    </div></div>
    <script>window.onload=()=>window.print()<\/script></body></html>`;
    const win = window.open('','_blank');
    if (win) { win.document.write(html); win.document.close(); }
  }

  /* ── FIREWORKS ── */
  const fwCanvas = document.getElementById('fw-canvas');
  const fwCtx = fwCanvas.getContext('2d');
  let fwParticles = [];
  let fwAnimId = null;

  function resizeFw() {
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
  }
  resizeFw();
  window.addEventListener('resize', resizeFw);

  let fwTimer = null;

  function launchFireworks(duration = 10000) {
    // 🛑 stop timer lama kalau ada
    if (fwTimer) {
      clearInterval(fwTimer);
      fwTimer = null;
    }

    const interval = 300;

    // mulai spawn
    fwTimer = setInterval(() => {
      spawnBurst();
    }, interval);

    // stop setelah durasi
    setTimeout(() => {
      if (fwTimer) {
        clearInterval(fwTimer);
        fwTimer = null;
      }
    }, duration);

    // jalankan animasi kalau belum
    if (!fwAnimId) animateFw();
  }

  function spawnBurst() {
    const x = 0.15 * fwCanvas.width + Math.random() * 0.7 * fwCanvas.width;
    const y = 0.1 * fwCanvas.height + Math.random() * 0.5 * fwCanvas.height;
    const hue = Math.random() * 360;
    const numP = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < numP; i++) {
      const angle = (Math.PI * 2 * i) / numP;
      const speed = 2 + Math.random() * 5;
      fwParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: `hsl(${hue + Math.random()*30}, 90%, 70%)`,
        radius: 2 + Math.random() * 2,
        decay: 0.012 + Math.random() * 0.01,
        gravity: 0.06
      });
    }
  }

  function animateFw() {
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    fwParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98; p.vy *= 0.98;
      p.alpha -= p.decay;
      fwCtx.globalAlpha = Math.max(0, p.alpha);
      fwCtx.fillStyle = p.color;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      fwCtx.fill();
    });
    fwCtx.globalAlpha = 1;
    fwParticles = fwParticles.filter(p => p.alpha > 0);
    if (fwParticles.length > 0) {
      fwAnimId = requestAnimationFrame(animateFw);
    } else {
      fwAnimId = null;
    }
  }

  /* Enter key on inputs */
  document.querySelectorAll('.edit-panel input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') applyChanges(); });
  });
