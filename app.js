// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCdykRhleXNIQpuF_dqIPG1sSmYa5_hlGo",
  authDomain: "suvie-editing-hub.firebaseapp.com",
  projectId: "suvie-editing-hub",
  storageBucket: "suvie-editing-hub.appspot.com",
  messagingSenderId: "589842850852",
  appId: "1:589842850852:web:9221600ed2bb5d6fbd24b1",
  measurementId: "G-KJ0RS0DKFE"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();
const VIDEO_FALLBACK_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const VIDEO_FALLBACK_MESSAGE = 'This video is not available on the deployed site. Showing a demo video instead.';
const AUDIO_FALLBACK_MESSAGE = 'This audio file is not available on the deployed site.';
const ADMIN_UID = 'YOUR_UID'; // Replace with your Firebase UID to allow uploads only for you.

function isAbsoluteUrl(url) {
  return /^(https?:)?\/\//i.test(url);
}

async function getMediaSourceUrl(pathOrUrl) {
  if (isAbsoluteUrl(pathOrUrl)) {
    return pathOrUrl;
  }

  try {
    const downloadUrl = await storage.ref(pathOrUrl).getDownloadURL();
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase storage lookup failed, falling back to local URL:', pathOrUrl, err);
    return encodeURI(pathOrUrl);
  }
}

async function setMediaSource(mediaEl, sourceEl, path, type, fallbackMessage) {
  const resolvedUrl = await getMediaSourceUrl(path);
  sourceEl.src = resolvedUrl;
  sourceEl.type = type;
  attachMediaFallback(mediaEl, sourceEl, path, type, fallbackMessage);
}

function attachMediaFallback(mediaEl, sourceEl, originalPath, type = 'video/mp4', fallbackMessage = VIDEO_FALLBACK_MESSAGE) {
  if (!mediaEl || !sourceEl) return;

  sourceEl.dataset.originalPath = originalPath;
  sourceEl.dataset.fallbackState = 'none';

  if (sourceEl._fallbackErrorHandler) {
    sourceEl.removeEventListener('error', sourceEl._fallbackErrorHandler);
  }

  if (mediaEl._fallbackErrorHandler) {
    mediaEl.removeEventListener('error', mediaEl._fallbackErrorHandler);
  }

  const handleFallback = async () => {
    const state = sourceEl.dataset.fallbackState;
    if (state === 'storage') {
      sourceEl.dataset.fallbackState = 'demo';
    } else if (state === 'demo') {
      return;
    } else {
      sourceEl.dataset.fallbackState = 'storage';
    }

    if (sourceEl.dataset.fallbackState === 'storage') {
      try {
        const storageUrl = await storage.ref(originalPath).getDownloadURL();
        sourceEl.src = storageUrl;
        sourceEl.type = type;
        sourceEl.dataset.fallbackState = 'storage';
        mediaEl.load();
        await mediaEl.play().catch(() => {});
        return;
      } catch (err) {
        console.warn('Firebase storage fallback failed for', originalPath, err);
      }
    }

    if (sourceEl.dataset.fallbackState === 'demo') {
      sourceEl.src = VIDEO_FALLBACK_URL;
      sourceEl.type = 'video/mp4';
      showUploadNotice(fallbackMessage, 5000);
      mediaEl.load();
      await mediaEl.play().catch(() => {});
    }
  };

  mediaEl._fallbackErrorHandler = handleFallback;
  sourceEl._fallbackErrorHandler = handleFallback;

  mediaEl.addEventListener('error', handleFallback);
  sourceEl.addEventListener('error', handleFallback);
}

const localAssets = [
  { name: 'Anime Edits', url: 'Anime Edits/' },
  { name: 'Phonk Edits', url: 'Anime Edits/Phonk Edits/' },
  { name: 'Song Edits', url: 'Anime Edits/Song Edits/' },
  { name: 'SFX', url: 'SFX/' },
  { name: 'Booms', url: 'SFX/Booms/' },
  { name: 'Buildups', url: 'SFX/Buildups/' },
  { name: 'Camera', url: 'SFX/Camera/' },
  { name: 'Clock', url: 'SFX/Clock/' },
  { name: 'Cloth', url: 'SFX/Cloth/' },
  { name: 'Electric', url: 'SFX/Electric/' },
  { name: 'Environment', url: 'SFX/Enviroment/' },
  { name: 'Heartbeat', url: 'SFX/Heartbeat/' },
  { name: 'Impacts', url: 'SFX/Impacts/' },
  { name: 'Magic', url: 'SFX/Magic/' },
  { name: 'Random', url: 'SFX/Random/' },
  { name: 'Sci-Fi', url: 'SFX/Sci-Fi/' },
  { name: 'Sword', url: 'SFX/Sword/' },
  { name: 'Whooshes', url: 'SFX/Whooshes/' },
  { name: 'VFX', url: 'VFX/' },
  { name: 'Backgrounds', url: 'VFX/Backgrounds/' },
  { name: 'Overlays', url: 'VFX/other overlays/' },
  { name: 'Particles', url: 'VFX/Particles/' },
  { name: 'Shockwaves', url: 'VFX/Shockwaves/' },
  { name: 'Wasted Effect', url: 'VFX/Wasted Effect.mp4' },
  { name: 'Twixtors', url: 'Twixtors/' },
  { name: 'Attack On Titan', url: 'Twixtors/Attack On Titan/' },
  { name: 'Demon Slayer', url: 'Twixtors/Demon Slayer/' },
  { name: 'Jujutsu Kaisen', url: 'Twixtors/Jujutsu Kaisen/' },
  { name: 'Solo Leveling', url: 'Twixtors/Solo Leveling/' },
  { name: 'Clips', url: 'clips/' },
  { name: 'Fahh sound effect', url: 'SFX/fahh-sound-effect-sowasfx-128-ytshorts.savetube.me.mp3' }
];

function createResultCard(name, url, label) {
  const card = document.createElement('div');
  card.className = 'result-card';

  const isVideo = /\.(mp4|webm|mov|mkv|avi)$/i.test(name || url);
  if (isVideo) {
    const thumbWrapper = document.createElement('div');
    thumbWrapper.className = 'video-thumb-wrapper';

    const preview = document.createElement('video');
    preview.className = 'result-thumb';
    preview.src = url;
    preview.muted = true;
    preview.preload = 'metadata';
    preview.setAttribute('playsinline', '');
    preview.setAttribute('poster', '');
    preview.controls = false;
    thumbWrapper.appendChild(preview);

    const overlay = document.createElement('div');
    overlay.className = 'video-play-overlay';
    overlay.innerHTML = '<span>▶</span>';
    thumbWrapper.appendChild(overlay);

    thumbWrapper.addEventListener('click', () => {
      if (preview.paused) {
        preview.play().catch(() => {});
        overlay.classList.add('playing');
      } else {
        preview.pause();
        overlay.classList.remove('playing');
      }
    });

    preview.addEventListener('pause', () => overlay.classList.remove('playing'));
    preview.addEventListener('play', () => overlay.classList.add('playing'));

    card.appendChild(thumbWrapper);
  }

  const meta = document.createElement('div');
  meta.className = 'result-meta';
  const title = document.createElement('a');
  title.href = url;
  title.innerText = name;
  title.target = '_blank';
  title.className = 'result-link';
  meta.appendChild(title);

  if (label) {
    const sub = document.createElement('div');
    sub.className = 'result-sub';
    sub.innerText = label;
    meta.appendChild(sub);
  }

  card.appendChild(meta);
  return card;
}

function createFolderCard(name, path, label) {
  const card = document.createElement('div');
  card.className = 'result-card';

  const meta = document.createElement('div');
  meta.className = 'result-meta';
  const title = document.createElement('div');
  title.innerText = name;
  title.className = 'result-link';
  meta.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'result-sub';
  sub.innerText = path;
  meta.appendChild(sub);

  if (label) {
    const tag = document.createElement('div');
    tag.className = 'result-sub';
    tag.innerText = label;
    meta.appendChild(tag);
  }

  card.appendChild(meta);
  return card;
}

function openTab(tabName) {
  document.querySelectorAll(".tabcontent").forEach(div => div.style.display = "none");
  document.querySelectorAll(".nav-left button").forEach(btn => btn.classList.remove("active"));
  const active = document.getElementById(tabName);
  const activeButton = document.querySelector(`.nav-left button[data-tab="${tabName}"]`);
  if (active) active.style.display = "block";
  if (activeButton) activeButton.classList.add("active");
}

function applyTheme(theme) {
  document.body.classList.remove('theme-dark', 'theme-light', 'theme-purple');
  document.body.classList.add(`theme-${theme}`);
  localStorage.setItem('suvieTheme', theme);
}

function toRGB(hex) {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

function getBrightness(hex) {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function lightenHex(hex, percent) {
  const normalized = hex.replace('#', '');
  let r = parseInt(normalized.substring(0, 2), 16);
  let g = parseInt(normalized.substring(2, 4), 16);
  let b = parseInt(normalized.substring(4, 6), 16);
  r = Math.min(255, Math.round(r + (255 - r) * percent / 100));
  g = Math.min(255, Math.round(g + (255 - g) * percent / 100));
  b = Math.min(255, Math.round(b + (255 - b) * percent / 100));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getContrastTextColor(hex) {
  return getBrightness(hex) > 160 ? '#000000' : '#ffffff';
}

function applyAccentColor(color) {
  const rgb = toRGB(color);
  const brightness = getBrightness(color);
  const safeSurface = brightness < 60 ? lightenHex(color, 40) : color;
  const surfaceSoft = brightness < 60 ? 'rgba(255,255,255,0.14)' : `rgba(${rgb}, 0.14)`;
  document.documentElement.style.setProperty('--accent-color', color);
  document.documentElement.style.setProperty('--accent-rgb', rgb);
  document.documentElement.style.setProperty('--accent-surface', safeSurface);
  document.documentElement.style.setProperty('--accent-surface-soft', surfaceSoft);
  document.documentElement.style.setProperty('--accent-contrast', getContrastTextColor(safeSurface));
  localStorage.setItem('suvieAccent', color);
}

function initTheme() {
  const savedTheme = localStorage.getItem('suvieTheme') || 'dark';
  const savedAccent = localStorage.getItem('suvieAccent') || '#8e6cff';
  const themeSelect = document.getElementById('themeSelect');
  const accentColorInput = document.getElementById('accentColor');
  const accentApplyBtn = document.getElementById('applyAccentBtn');

  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener('change', e => applyTheme(e.target.value));
  }

  if (accentColorInput) {
    accentColorInput.value = savedAccent;
  }

  if (accentApplyBtn && accentColorInput) {
    accentApplyBtn.addEventListener('click', () => {
      const selectedColor = accentColorInput.value || savedAccent;
      applyAccentColor(selectedColor);
    });
  }

  applyTheme(savedTheme);
  applyAccentColor(savedAccent);
}

document.addEventListener("DOMContentLoaded", () => {
  openTab('home');
  initTheme();
  updateAuthUI(null);

  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const uploadButton = document.getElementById('uploadUserFileBtn');
  const profileBtn = document.getElementById('profileButton');
  const profileForm = document.getElementById('profileForm');

  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (signupForm) signupForm.addEventListener('submit', handleSignup);
  if (uploadButton) uploadButton.addEventListener('click', uploadUserFile);
  if (profileBtn) profileBtn.addEventListener('click', () => toggleProfileModal(true));
  if (profileForm) profileForm.addEventListener('submit', saveProfileSettings);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = () => auth.signOut();
  }

  listCommunityUploads();
  attachFolderClickHandlers();
});

// Video database mapping folders to their MP4 files
const videoDatabase = {
  'Funk Sereno': ['Anime Edits/Phonk Edits/Funk Sereno/Yuta Funk Sereno Edit.mp4'],
  'Montagem Alquima': [
    'Anime Edits/Phonk Edits/Montagem Alquima/0218 (3).mp4',
    'Anime Edits/Phonk Edits/Montagem Alquima/1000228328.mp4',
    'Anime Edits/Phonk Edits/Montagem Alquima/Sukuna Edit - Copy.mp4',
    'Anime Edits/Phonk Edits/Montagem Alquima/Sukuna Edit Montagem Alquimina.mp4',
    'Anime Edits/Phonk Edits/Montagem Alquima/Sukuna Edit.mp4',
    'Anime Edits/Phonk Edits/Montagem Alquima/sukuna-with-this-trend-🥶🔥-anime-animeedit.mp4'
  ],
  'Montagem Elder': ['Anime Edits/Phonk Edits/Montagem Elder/Yuji Montagem Elder Edit.mp4'],
  'Montagem Ritmada': ['Anime Edits/Phonk Edits/Montagem Ritmada/Zoro Montagem Ritmada Edit.mp4'],
  'Salesman Funk': ['Anime Edits/Phonk Edits/Salesman Funk/Levi Salesman Funk Edit.mp4'],
  'Toma No Bailao': ['Anime Edits/Phonk Edits/Toma No Bailao/Higuruma Toma No Bailao Edit.mp4'],
  'Batidao Funk': [
    'Anime Edits/Phonk Edits/Batidao Funk/2362eb36-6d80-492b-8f28-10107322e9c8.mp4',
    'Anime Edits/Phonk Edits/Batidao Funk/Gojo Edit Batidao Funk - Copy.mp4',
    'Anime Edits/Phonk Edits/Batidao Funk/Gojo Edit Batidao Funk.mp4',
    'Anime Edits/Phonk Edits/Batidao Funk/Gojo Edit with vocals cc .mp4',
    'Anime Edits/Phonk Edits/Batidao Funk/videoplayback.mp4'
  ],
  'Leva Leva': ['Anime Edits/Phonk Edits/Leva Leva/Doma Leva Leva Edit.mp4'],
  'Montagem Bebado': ['Anime Edits/Phonk Edits/Montagem Bebado/Kaiser Montagem Bebado Edit .mp4'],
  'Montagem Farao': ['Anime Edits/Phonk Edits/Montagem Farao/Yuji Montagem Farao Edit.mp4'],
  'Montagem Santa Fe 2': [
    'Anime Edits/Phonk Edits/Montagem Santa Fe 2/Gojo Montagem Santa Fe 2 Edit (1).mp4',
    'Anime Edits/Phonk Edits/Montagem Santa Fe 2/Gojo Montagem Santa Fe 2 Edit(3).mp4',
    'Anime Edits/Phonk Edits/Montagem Santa Fe 2/Gojo Montagem Santa Fe 2 Edit.mp4',
    'Anime Edits/Phonk Edits/Montagem Santa Fe 2/Zenitsu Montagem Santa Fe 2 Edit.mp4',
    'Anime Edits/Phonk Edits/Montagem Santa Fe 2/«𝑻𝒐𝒐 𝑺𝒍𝒐𝒘 𝑺𝒄𝒖𝒎»⚡ [ℤ𝕖𝕟𝕚𝕥𝕤𝕦]💀 𝐌𝐨𝐧.mp4'
  ],
  'Noot Noot Funk': ['Anime Edits/Phonk Edits/Noot Noot Funk/Tanjiro Noot Noot Funk Edit.mp4'],
  'Sem Tempo': ['Anime Edits/Phonk Edits/Sem Tempo/Sukuna Sem Tempo Edit.mp4'],
  'Xonada Funk': [
    'Anime Edits/Phonk Edits/Xonada Funk/1000228331.mp4',
    'Anime Edits/Phonk Edits/Xonada Funk/d9964bb9-b6da-4d4c-a726-8dd49ce71c65.mp4',
    'Anime Edits/Phonk Edits/Xonada Funk/Goku X Vegeta Edit Xonada Funk - Copy.mp4',
    'Anime Edits/Phonk Edits/Xonada Funk/Goku X Vegeta Edit Xonada Funk.mp4'
  ],
  'Dream Funk': [
    'Anime Edits/Phonk Edits/Dream Funk/1000227361.mp4',
    'Anime Edits/Phonk Edits/Dream Funk/Yuta Edit - Copy.mp4',
    'Anime Edits/Phonk Edits/Dream Funk/Yuta Edit.mp4'
  ],
  'Love For You Funk': ['Anime Edits/Phonk Edits/Love For You Funk/GOJO X JINWOO X ITACHI LOVE FOR YOU FUNK EDIT.mp4'],
  'Montagem Eclipse': [],
  'Montagem Rabeta': ['Anime Edits/Phonk Edits/Montagem Rabeta/Yuta\'s Aura Farming Be Like [Monatgem Rabeta].mp4'],
  'Montagem Tentana': [
    'Anime Edits/Phonk Edits/Montagem Tentana/#fyp#foryoupage#anime#sukuna#jjk#suvieeditor - Copy.mp4',
    'Anime Edits/Phonk Edits/Montagem Tentana/#fyp#foryoupage#anime#sukuna#jjk#suvieeditor.mp4',
    'Anime Edits/Phonk Edits/Montagem Tentana/4016877e-5d5e-41a2-9aec-3d71e36cb623.mp4'
  ],
  'Rebola Funk': ['Anime Edits/Phonk Edits/Rebola Funk/Zenitsu Rebola Funk Edit Pre Released Funk.mp4'],
  'Stephanie Funk': [
    'Anime Edits/Phonk Edits/Stephanie Funk/cutteryt (9).mp4',
    'Anime Edits/Phonk Edits/Stephanie Funk/Stephanie Funk.mp4'
  ],
  'Babydoll - Dominic Fike': ['Anime Edits/Song Edits/Babydoll - Dominic Fike/Baby Doll Edit JJk .mp4'],
  'Big Guy': [
    'Anime Edits/Song Edits/Big Guy/471a18c2-ddd7-4b83-9431-b35f6727a35b.mp4',
    'Anime Edits/Song Edits/Big Guy/fad0eabe-c9f5-4028-b41f-b8108bacacbf.mp4',
    'Anime Edits/Song Edits/Big Guy/Higuruma Edit Song Name Big Guy - Copy.mp4',
    'Anime Edits/Song Edits/Big Guy/Higuruma Edit Song Name Big Guy.mp4',
    'Anime Edits/Song Edits/Big Guy/toji-jjk-jujutsukaisen-animeedit-foryou - Copy.mp4',
    'Anime Edits/Song Edits/Big Guy/toji-jjk-jujutsukaisen-animeedit-foryou.mp4'
  ],
  'Don\'t Copy My Flow': ['Anime Edits/Song Edits/Don\'t Copy My Flow/Toji X Megumi Don\'t Copy My Flow Edit.mp4'],
  'Love For You': [
    'Anime Edits/Song Edits/Love For You/Eren & Mikasa 4K My Love For You Edit.mp4',
    'Anime Edits/Song Edits/Love For You/Zenitsu X Nezuko My Love For You Edit.mp4'
  ],
  'Moulaga': ['Anime Edits/Song Edits/Moulaga/Zenitsu Moulaga Trend Special Edit.mp4'],
  'Stephanie - Nafeesisboujee': ['Anime Edits/Song Edits/Stephanie - Nafeesisboujee/Gojo-Stephanie Edit.mp4']
};

// Global state for video playlist
let currentVideoIndex = 0;
let currentVideoList = [];
let currentFolderTitle = '';

// Global state for audio playlist
let currentAudioIndex = 0;
let currentAudioList = [];
let currentAudioFolderTitle = '';

// Global state for VFX playlist
let currentVFXIndex = 0;
let currentVFXList = [];
let currentVFXFolderTitle = '';

// Global state for Twixtors playlist
let currentTwixtorIndex = 0;
let currentTwixtorList = [];
let currentTwixtorFolderTitle = '';

// VFX Video Database
const vfxDatabase = {
  'Backgrounds': [
    'VFX/Backgrounds/9-at-2024-10-05T01_06_52.033Z-pinned.mp4',
    'VFX/Backgrounds/sharingan.mp4',
    'VFX/Backgrounds/y2mate.com - Black Hole from Interstellar Wallp.mp4',
    'VFX/Backgrounds/y2mate.com - DeepSpace Galaxy Travel  Stars Glo.mp4',
    'VFX/Backgrounds/y2mate.com - Galaxy Free Background Video Motio.mp4',
    'VFX/Backgrounds/y2mate.com - Galaxy in 4K  Animation Overlay fo.mp4',
    'VFX/Backgrounds/y2mate.com - Motion Graphics Full Moon Animated.mp4',
    'VFX/Backgrounds/y2mate.com - wallpaper engine crescent moon red.mp4'
  ],
  'Overlays': [
    'VFX/other overlays/!2.mp4',
    'VFX/other overlays/1.mp4',
    'VFX/other overlays/1080p_square_corners_turning_overlay.mp4',
    'VFX/other overlays/2.mp4',
    'VFX/other overlays/21.mp4',
    'VFX/other overlays/5.mp4',
    'VFX/other overlays/Anime Speed Lines.mp4',
    'VFX/other overlays/ANOTHER_FIRE_OVERLAY.mp4',
    'VFX/other overlays/Bird overlay.mp4',
    'VFX/other overlays/bird_Flock_Flying_Away.mp4',
    'VFX/other overlays/Blink Portal FX v050.mp4',
    'VFX/other overlays/C4DAE_butterfly_9.mp4',
    'VFX/other overlays/Close Up Ember Particle 1 - preview.mp4',
    'VFX/other overlays/Eastern Dragons.mp4',
    'VFX/other overlays/Fire FX 04.mp4',
    'VFX/other overlays/Fire Transition.mp4',
    'VFX/other overlays/FIRE_EMBERS_5.mp4',
    'VFX/other overlays/FREE HD Green Screen - WATER DROPS ON GLASS.mp4',
    'VFX/other overlays/glass break 2.mp4',
    'VFX/other overlays/glass break 5.mp4',
    'VFX/other overlays/green screen tree branches  Leaves green effect  Green screen tree video.mp4',
    'VFX/other overlays/Ground Fire Front Angle 11 1699 2K.mp4',
    'VFX/other overlays/heart overlay.mp4',
    'VFX/other overlays/Horizontal Speed Lines 1.mp4',
    'VFX/other overlays/HUD 1.mp4',
    'VFX/other overlays/HUD 3.mp4',
    'VFX/other overlays/HUD 5.mp4',
    'VFX/other overlays/Leaves Flying #1  Green Screen - Chroma Key.mp4',
    'VFX/other overlays/Lightning - 33049.mp4',
    'VFX/other overlays/Lightning Overlay.mp4',
    'VFX/other overlays/Orbit 1 - preview.mp4',
    'VFX/other overlays/Prekeyed Magic Circle 4.mp4',
    'VFX/other overlays/Prekeyed Magic Circle 5.mp4',
    'VFX/other overlays/Rasengan VFX test.mp4',
    'VFX/other overlays/Rotating Square-1.mp4',
    'VFX/other overlays/Rotating Square-2.mp4',
    'VFX/other overlays/smoke 11.mp4',
    'VFX/other overlays/smoke 28.mp4',
    'VFX/other overlays/Transparent_Drops_Of_Rain_Stock_.mp4',
    'VFX/other overlays/Trippy Tunnel.mp4',
    'VFX/other overlays/Wormhole_Sequence_ (1).mp4',
    'VFX/other overlays/y2mate.com - 1st Energy Ball VFX  After Effects_1080.mp4',
    'VFX/other overlays/y2mate.com - 4K Blood Splatter Green Screen_108.mp4',
    'VFX/other overlays/y2mate.com - Crying Overlay_1080p.mp4',
    'VFX/other overlays/y2mate.com - Falling Feather White HD Animation_1080p.mp4',
    'VFX/other overlays/y2mate.com - fire overlay_1080p.mp4.mp4',
    'VFX/other overlays/y2mate.com - Glittering sparkler v 4_1080pFHR.mp4',
    'VFX/other overlays/y2mate.com - Ink Blot 01_1080p.mp4',
    'VFX/other overlays/y2mate.com - Rain on window 08  Free compositing footage_1080.mp4',
    'VFX/other overlays/[#eDits] Insane_purple_overlay.mp4',
    'VFX/other overlays/[Effect] Speedlines Overlay (MP4 and PCF downlo.mp4'
  ],
  'Particles': [
    'VFX/Particles/19. Sparkling.mp4',
    'VFX/Particles/20. Stars Glitch.mp4',
    'VFX/Particles/26.mp4',
    'VFX/Particles/32.mp4',
    'VFX/Particles/blue rocks.mp4',
    'VFX/Particles/Diamonds_background.mp4',
    'VFX/Particles/fire embers 15.mp4',
    'VFX/Particles/fire embers 18.mp4',
    'VFX/Particles/fire embers 2.mp4',
    'VFX/Particles/fire embers 3.mp4',
    'VFX/Particles/fire embers 9.mp4',
    'VFX/Particles/Hyperspeed.mp4',
    'VFX/Particles/Overlay #9 (1).mp4',
    'VFX/Particles/Overlay 1 - Copy.mp4',
    'VFX/Particles/Overlay 1.mp4',
    'VFX/Particles/Overlay 2.mp4',
    'VFX/Particles/Overlay 26.mp4',
    'VFX/Particles/Overlay 33.mp4',
    'VFX/Particles/Overlay 37.mp4',
    'VFX/Particles/Overlay 45.mp4',
    'VFX/Particles/P-O Firework.mp4',
    'VFX/Particles/Particle 9.mp4',
    'VFX/Particles/Particles 2.mp4',
    'VFX/Particles/particles 3.mp4',
    'VFX/Particles/Snow Overlay HD  4K  8K  12K.mp4',
    'VFX/Particles/Very Fast Particles.mp4',
    'VFX/Particles/y2mate.com - Cool Particle Overlay_1080p.mp4'
  ],
  'Shockwaves': [
    'VFX/Shockwaves/Energie Shockwave 3.mp4',
    'VFX/Shockwaves/Energie Shockwave 4.mp4',
    'VFX/Shockwaves/Energie Shockwave 5.mp4',
    'VFX/Shockwaves/Energie Shockwave 6.mp4',
    'VFX/Shockwaves/Energie Shockwave 7.mp4',
    'VFX/Shockwaves/Energy - 16107.mp4',
    'VFX/Shockwaves/klassic katon 1.mp4',
    'VFX/Shockwaves/Lighting Globe.mp4',
    'VFX/Shockwaves/Overlay #22.mp4',
    'VFX/Shockwaves/ShockWave (3).mp4',
    'VFX/Shockwaves/shockwave 1.mp4',
    'VFX/Shockwaves/shockwave 2.mp4',
    'VFX/Shockwaves/shockwave 3.mp4',
    'VFX/Shockwaves/Shockwave 5.mp4',
    'VFX/Shockwaves/Shockwave 6.mp4',
    'VFX/Shockwaves/videoplayback (4).mp4',
    'VFX/Shockwaves/White Circel (Buildups _ Transitions).mp4'
  ]
};

// Twixtors Video Database
const twixtorDatabase = {
  'Attack On Titan': [],
  'Demon Slayer': [
    'Twixtors/Demon Slayer/Akaza/Akaza Anirap 2 Cc Prob3.mp4',
    'Twixtors/Demon Slayer/Akaza/Akaza New Trailer No CC_prob3.mp4',
    'Twixtors/Demon Slayer/Giyu Tomioka/Giyuu Trailer Infinity Castle Cc Prob3.mp4',
    'Twixtors/Demon Slayer/Muzan/Muzan Ep 8 Cc Prob3-4.mp4',
    'Twixtors/Demon Slayer/Shinobu Kocho/Shinobu Final Trailer Cc Prob3.mp4',
    'Twixtors/Demon Slayer/Shinobu Kocho/Tengen Uzui Ccs Prob3-2.mp4',
    'Twixtors/Demon Slayer/Tanjiro Kamado/New Teaser Demon Slayer Cc.mp4'
  ],
  'Jujutsu Kaisen': [
    'Twixtors/Jujutsu Kaisen/Aoi Todo/Todo Cc Scale 1X Prob-3-2.mp4',
    'Twixtors/Jujutsu Kaisen/Hiromi Higuruma/Higaruma Ep 9 Cc Prob3.mp4',
    'Twixtors/Jujutsu Kaisen/Kinji Hakari/Hakari Kinjicc Ep 6 S 3 Prob3.mp4',
    'Twixtors/Jujutsu Kaisen/Maki Zenin/Maki No Cc-2.mp4',
    'Twixtors/Jujutsu Kaisen/Megumi Fushiguro/Megumi Ep 11 Cc Prob3.mp4',
    'Twixtors/Jujutsu Kaisen/Naoya Zenin/Naoya S3 Ep 1 And 2 Cc Prob3.mp4',
    'Twixtors/Jujutsu Kaisen/Satoru Gojo/Best Of Satoru Gojo Cc-1.mp4',
    'Twixtors/Jujutsu Kaisen/Yuji Itadori/Yuji Cc Ep 9 Prob3.mp4',
    'Twixtors/Jujutsu Kaisen/Yuta Okkotsu/Yuta Preview Ep 12 Cc Prob3.mp4'
  ],
  'Solo Leveling': [
    'Twixtors/Solo Leveling/Sung Jinwoo/Sung Jinwoo Ep 13 S2 Cc Scale 1X Prob-3-2 (1).mp4',
    'Twixtors/Solo Leveling/Sung Jinwoo/Sung Jinwoo Ep 13 S2 Cc Scale 1X Prob-3-2.mp4'
  ]
};

// SFX Audio Database
const sfxDatabase = {
  'Booms': [
    'SFX/Booms/BOOM meme sound effect.mp3',
    'SFX/Booms/boom-geomorphism-cinematic-trailer-sound-effects-123876.mp3',
    'SFX/Booms/Cinematic boom.mp3'
  ],
  'Buildups': [
    'SFX/Buildups/BUILD-UP.mp3',
    'SFX/Buildups/buildup1.mp3',
    'SFX/Buildups/buildup2.mp3',
    'SFX/Buildups/buildup3.mp3',
    'SFX/Buildups/f1_sound.mp3',
    'SFX/Buildups/Fast Rising Sound Effect.mp3',
    'SFX/Buildups/kira cinematic build ups and risers.mp3',
    'SFX/Buildups/kira custom build up whoosh.mp3',
    'SFX/Buildups/SFX - Riser Metallic (Transition).mp3',
    'SFX/Buildups/tense build up 2.mp3',
    'SFX/Buildups/tense build up.mp3'
  ],
  'Camera': [
    'SFX/Camera/Camera Shutter Cinemarkers with Authentic Sound Effects.mp3',
    'SFX/Camera/Paparazzi Camera Sound Effects 📸 Camera Sounds [ ezmp3.cc ].mp3',
    'SFX/Camera/Shutter_Click_sound_effect_no_copy_(getmp3.pro).mp3'
  ],
  'Clock': [
    'SFX/Clock/Clock Tick.mp3',
    'SFX/Clock/Clock ticking fast.mp3',
    'SFX/Clock/Clock Ticking Sound Effect(MP3_160K).mp3',
    'SFX/Clock/Clock Ticking Sound Effect.mp3'
  ],
  'Cloth': [
    'SFX/Cloth/clothing ruffle.mp3',
    'SFX/Cloth/Cloths Flutter in Wind Sound Effect ♪.mp3',
    'SFX/Cloth/jaegar clothing 1.mp3'
  ],
  'Electric': [
    'SFX/Electric/Electric intro.mp3',
    'SFX/Electric/Electric Sound FX - Free download.mp3',
    'SFX/Electric/Electric Zap 001 Sound Effect.mp3',
    'SFX/Electric/electric.mp3',
    'SFX/Electric/Electricity 11.mp3',
    'SFX/Electric/SFX- Electric5.mp3',
    'SFX/Electric/Slam_Electric_Short_01.mp3',
    'SFX/Electric/Slam_Electric_Short_02.mp3',
    'SFX/Electric/Slam_Electric_Short_03.mp3'
  ],
  'Environment': [
    'SFX/Enviroment/City/City Street Ambience Sound Effect [FREE DOWNLOAD ROYALTY FREE].mp3',
    'SFX/Enviroment/Forest/Forest In 4K - The Healing Power Of Nature Sounds _ Forest Sounds _ Scenic Relaxation Film.mp3',
    'SFX/Enviroment/Rain & Thunder/Rain.mp3',
    'SFX/Enviroment/Rain & Thunder/Thunder.mp3',
    'SFX/Enviroment/Rain & Thunder/Thunder_Sound_effect_(getmp3.pro).mp3',
    'SFX/Enviroment/Snow/snow blizzard.mp3',
    'SFX/Enviroment/Water/Underwater Sound Effects Library.mp3',
    'SFX/Enviroment/Wind/SFX- Wind1.mp3',
    'SFX/Enviroment/Wind/Wind Blown Leaves Sound Effect.mp3',
    'SFX/Enviroment/Wind/Wind Sound SOUND EFFECT - No Copyright[Download Free].mp3',
    'SFX/Enviroment/Wind/window_shatter.mp3'
  ],
  'Heartbeat': [
    'SFX/Heartbeat/NGTVST - Heartbeat 1.wav',
    'SFX/Heartbeat/NGTVST - Heartbeat 2.wav'
  ],
  'Impacts': [
    'SFX/Impacts/blame hit impact 1.mp3',
    'SFX/Impacts/bloody impact.mp3',
    'SFX/Impacts/heavy impact 2.mp3',
    'SFX/Impacts/heavy impact.mp3',
    'SFX/Impacts/Impact_Hits_03.mp3',
    'SFX/Impacts/Impact_Hits_19.mp3',
    'SFX/Impacts/Impact_Hits_20.mp3',
    'SFX/Impacts/Impact_Hits_21.mp3',
    'SFX/Impacts/Impact_Hits_22.mp3',
    'SFX/Impacts/Impact_Hits_23.mp3',
    'SFX/Impacts/Punch Sound Effect..mp3',
    'SFX/Impacts/SFX (4).mp3',
    'SFX/Impacts/SFX (5).mp3',
    'SFX/Impacts/SFX (6).mp3',
    'SFX/Impacts/Slam_Impact_01.mp3',
    'SFX/Impacts/Slam_Impact_02.mp3',
    'SFX/Impacts/Slam_Impact_03.mp3',
    'SFX/Impacts/Slam_Impact_04.mp3',
    'SFX/Impacts/Slam_Impact_05.mp3',
    'SFX/Impacts/spacial_warp_impact_2.mp3',
    'SFX/Impacts/Water_Drop_Sound_Effect_(getmp3.pro).mp3',
    'SFX/Impacts/whoosh_fast_impact_slap_001_29293.mp3'
  ],
  'Magic': [
    'SFX/Magic/magic sound effect.mp3',
    'SFX/Magic/Shining Sound Effect [ ezmp3.cc ].mp3',
    'SFX/Magic/zapsplat_fantasy_magic_spell_dark_whoosh_fly_by_001_31397.mp3'
  ],
  'Random': [
    'SFX/Random/Airplane -Sound Effect (HD).mp3',
    'SFX/Random/Applause Crowd Cheering sound effect.mp3',
    'SFX/Random/Bird Flying Away - Sound Effect.mp3',
    'SFX/Random/Breathing & Running - Sound Effect for editing.mp3',
    'SFX/Random/Bubbles Sound Effect [ ezmp3.cc ].mp3',
    'SFX/Random/Building Collapse Sound Effects, Eathquake Sounds, Rocks Falling, Brick Wall Collapse,free download [ ezmp3.cc ].mp3',
    'SFX/Random/burning fire.mp3',
    'SFX/Random/Bye Bye Mog Sound Effect [ ezmp3.cc ].mp3',
    'SFX/Random/Car Skidding Sound Effect.mp3',
    'SFX/Random/Cloths Flutter in Wind Sound Effect ♪.mp3',
    'SFX/Random/Crow Sound Effect - HD Quality.mp3',
    'SFX/Random/Ding Sound Effects (Copyright Free).mp3',
    'SFX/Random/Helicopter Sound Effect.mp3',
    'SFX/Random/hes bacaaaack.mp3',
    'SFX/Random/i cant stop.mp3',
    'SFX/Random/Jet Ski Sound Effect.mp3',
    'SFX/Random/Metal_chain_-_Sound_Effect_SFX_(getmp3.pro).mp3',
    'SFX/Random/Motorcycle sound effect (no copyright).mp3',
    'SFX/Random/PlayingandwinningSlotMachineJackpot-SoundEffectforediting.mp3',
    'SFX/Random/Porsche 911 GT3 RS.mp3',
    'SFX/Random/Seagull Beach Sound Effect _ Free Sound Clips _ Animal Sounds [ ezmp3.cc ].mp3',
    'SFX/Random/Soccer SFX _ Football Sound Effect [ ezmp3.cc ].mp3',
    'SFX/Random/Spongebob Bubble Transition [ ezmp3.cc ].mp3',
    'SFX/Random/TRAIN Sound Effects - Train Approach.mp3',
    'SFX/Random/Train.mp3',
    'SFX/Random/you look lonely, i can fix that sound effect.mp3'
  ],
  'Sci-Fi': [
    'SFX/Sci-Fi/Futuristic HUD Sound Design _ Blake Sanchez.mp3',
    'SFX/Sci-Fi/Futuristic HUDUI Visuals Sound Design [ ezmp3.cc ].mp3',
    'SFX/Sci-Fi/Sci Fi UI Sounds.mp3',
    'SFX/Sci-Fi/SciFi Sound Effects.mp3',
    'SFX/Sci-Fi/UI Data Loading Sound Effect.mp3'
  ],
  'Sword': [
    'SFX/Sword/Anime sword fight Sound Effects for editsAMVs [ ezmp3.cc ].mp3',
    'SFX/Sword/Slam_Slice_Fast_01.mp3',
    'SFX/Sword/sword-swishes-with-cloth-movement-101367.mp3',
    'SFX/Sword/sword.mp3',
    'SFX/Sword/Sword_Mech_03.mp3',
    'SFX/Sword/Sword_Mech_04.mp3',
    'SFX/Sword/Sword_Mech_05.mp3',
    'SFX/Sword/Sword_Mech_06.mp3',
    'SFX/Sword/Sword_Mech_07.mp3',
    'SFX/Sword/Sword_Mech_08.mp3',
    'SFX/Sword/Sword_Mech_09.mp3'
  ],
  'Whooshes': [
    'SFX/Whooshes/big whoosh muffled.mp3',
    'SFX/Whooshes/Cinematic Whoosh Fireball - Sound Effect [HD] [ ezmp3.cc ].mp3',
    'SFX/Whooshes/clean whoosh.mp3',
    'SFX/Whooshes/dodge whooshes.mp3',
    'SFX/Whooshes/ES_PE-Whoosh 29 - SFX Producer.mp3',
    'SFX/Whooshes/ES_Whoosh To Hit 11 - SFX Producer.mp3',
    'SFX/Whooshes/ES_Whoosh Transition 1 - SFX Producer.mp3',
    'SFX/Whooshes/Fast Whoosh Sound Effect.mp3',
    'SFX/Whooshes/Fast_Whoosh_Sound_Effect_(getmp3.pro).mp3',
    'SFX/Whooshes/Fire Whoosh - Sound Effect (SFX) [ ezmp3.cc ].mp3',
    'SFX/Whooshes/fireball swoosh - fire (2).mp3',
    'SFX/Whooshes/Heavy swoosh.mp3',
    'SFX/Whooshes/Hollow woosh.mp3',
    'SFX/Whooshes/kira custom build up whoosh.mp3',
    'SFX/Whooshes/kira flame whoosh.mp3',
    'SFX/Whooshes/kira power down whoosh.mp3',
    'SFX/Whooshes/long space swoosh.mp3',
    'SFX/Whooshes/Long whoosh sound effect.mp3',
    'SFX/Whooshes/Music search result for whoosh   Epidemic Sound - www.epidemicsound.com (ES_Hit 20To 20Whoosh 202).mp3',
    'SFX/Whooshes/Music search result for whoosh   Epidemic Sound - www.epidemicsound.com (ES_PREL 20Whoosh 2014).mp3',
    'SFX/Whooshes/Music search result for whoosh   Epidemic Sound - www.epidemicsound.com (ES_Whoosh 20Metallic 201).mp3',
    'SFX/Whooshes/Music search result for whoosh   Epidemic Sound - www.epidemicsound.com (ES_Whoosh 20Metallic 204).mp3',
    'SFX/Whooshes/Music search result for whoosh   Epidemic Sound - www.epidemicsound.com (ES_Whoosh 20Metallic 205).mp3',
    'SFX/Whooshes/Music search result for whoosh   Epidemic Sound - www.epidemicsound.com (ES_Whoosh 20To 20Hit 2010).mp3',
    'SFX/Whooshes/Music search result for whoosh   Epidemic Sound - www.epidemicsound.com (ES_Whoosh 20To 20Hit 2014).mp3',
    'SFX/Whooshes/Music search result for whoosh   Epidemic Sound - www.epidemicsound.com (ES_Whoosh 20To 20Hit 2015).mp3',
    'SFX/Whooshes/Music search result for whoosh   Epidemic Sound - www.epidemicsound.com (ES_Whoosh 20To 20Hit 202).mp3',
    'SFX/Whooshes/orlando_lanzini_whoosh_007.mp3',
    'SFX/Whooshes/Rake Swing Whoosh Close.mp3',
    'SFX/Whooshes/Royalty free Whoosh sound effects   Epidemic Sound - www.epidemicsound.com (ES_Fireball 20Pass 20By 20Heavy 201).mp3',
    'SFX/Whooshes/Royalty free Whoosh sound effects   Epidemic Sound - www.epidemicsound.com (ES_Whoosh 20Transition 201).mp3',
    'SFX/Whooshes/SFX (1).mp3',
    'SFX/Whooshes/SFX (2).mp3',
    'SFX/Whooshes/SFX (3).mp3',
    'SFX/Whooshes/SFX- Swoosh01.mp3',
    'SFX/Whooshes/SFX- Swoosh05.mp3',
    'SFX/Whooshes/SFX- Swoosh10.mp3',
    'SFX/Whooshes/SFX- Swoosh12.mp3',
    'SFX/Whooshes/SFX- Swoosh20.mp3',
    'SFX/Whooshes/Short Whoosh.mp3',
    'SFX/Whooshes/Swish Swoosh Cutscene Sound Effect.mp3',
    'SFX/Whooshes/Swoosh.mp3',
    'SFX/Whooshes/Thick fly by, grainy.mp3',
    'SFX/Whooshes/whoosh 1.mp3',
    'SFX/Whooshes/Whoosh 2.mp3',
    'SFX/Whooshes/whoosh 3.mp3',
    'SFX/Whooshes/whoosh 4.mp3',
    'SFX/Whooshes/whoosh 5.mp3',
    'SFX/Whooshes/WHOOSH FIRE TRANSITION.mp3',
    'SFX/Whooshes/whoosh sound effect.mp3',
    'SFX/Whooshes/Whoosh Sound Effects _ No Copyright Whoosh Sound Effects.mp3',
    'SFX/Whooshes/whoosh-6316.mp3',
    'SFX/Whooshes/whoosh_fast_impact_slap_001_29293.mp3',
    'SFX/Whooshes/Whoosh_sound_effect_(getmp3.pro).mp3',
    'SFX/Whooshes/woosh (1).mp3',
    'SFX/Whooshes/woosh (2).mp3',
    'SFX/Whooshes/woosh (3).mp3',
    'SFX/Whooshes/woosh-building-109596.mp3',
    'SFX/Whooshes/zapsplat_fantasy_magic_spell_dark_whoosh_fly_by_001_31397.mp3'
  ]
};

// Attach click handlers for folder cards in the hub sections
function attachFolderClickHandlers() {
  const mappings = [
    { sectionId: 'anime', handler: loadFolderVideos },
    { sectionId: 'sfx', handler: loadAudioFolder },
    { sectionId: 'vfx', handler: loadVFXFolder },
    { sectionId: 'twixtors', handler: loadTwixtorFolder }
  ];

  mappings.forEach(({ sectionId, handler }) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.querySelectorAll('.folder-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const titleEl = card.querySelector('.folder-name');
        const title = titleEl ? titleEl.textContent.trim() : 'Unknown';
        handler(title);
      });
    });
  });
}

function loadFolderVideos(folderTitle) {
  currentFolderTitle = folderTitle;
  const videos = videoDatabase[folderTitle] || [];

  if (!videos.length) {
    alert(`No videos found in ${folderTitle}`);
    return;
  }

  currentVideoList = videos.map(path => ({
    name: path.split('/').pop(),
    url: path
  }));

  currentVideoIndex = 0;
  openVideoPlayer(currentVideoList[0].url, folderTitle, currentVideoList);
}

async function openVideoPlayer(url, title, videoList = []) {
  const grid = document.getElementById('gridViewContainer');
  const playerWrap = document.getElementById('videoPlayerContainer');
  const videoEl = document.getElementById('videoPlayer');
  const titleEl = document.getElementById('videoTitle');
  const navButtons = document.getElementById('videoNavButtons');

  if (!playerWrap || !grid || !videoEl || !titleEl) return;

  titleEl.textContent = title;
  const source = videoEl.querySelector('source');
  await setMediaSource(videoEl, source, url, 'video/mp4', VIDEO_FALLBACK_MESSAGE);
  videoEl.load();

  if (navButtons) {
    if (videoList.length > 1) {
      navButtons.style.display = 'flex';
      const prevBtn = document.getElementById('videoPrevBtn');
      const nextBtn = document.getElementById('videoNextBtn');
      const counter = document.getElementById('videoCounter');
      if (counter) counter.textContent = `${currentVideoIndex + 1} / ${videoList.length}`;
      if (prevBtn) prevBtn.disabled = currentVideoIndex === 0;
      if (nextBtn) nextBtn.disabled = currentVideoIndex === videoList.length - 1;
    } else {
      navButtons.style.display = 'none';
    }
  }

  grid.classList.add('faded-out');
  setTimeout(() => {
    grid.style.display = 'none';
    playerWrap.classList.remove('hidden');
    playerWrap.classList.add('faded-in');
    videoEl.play().catch(() => {});
  }, 220);
}

function playNextVideo() {
  if (currentVideoIndex < currentVideoList.length - 1) {
    currentVideoIndex++;
    openVideoPlayer(currentVideoList[currentVideoIndex].url, currentFolderTitle, currentVideoList);
  }
}

function playPreviousVideo() {
  if (currentVideoIndex > 0) {
    currentVideoIndex--;
    openVideoPlayer(currentVideoList[currentVideoIndex].url, currentFolderTitle, currentVideoList);
  }
}

function closeVideoPlayer() {
  const grid = document.getElementById('gridViewContainer');
  const playerWrap = document.getElementById('videoPlayerContainer');
  const videoEl = document.getElementById('videoPlayer');
  if (!playerWrap || !grid || !videoEl) return;

  videoEl.pause();
  videoEl.currentTime = 0;

  playerWrap.classList.remove('faded-in');
  playerWrap.classList.add('faded-out');
  setTimeout(() => {
    playerWrap.classList.add('hidden');
    playerWrap.classList.remove('faded-out');
    grid.style.display = '';
    grid.classList.remove('faded-out');
  }, 220);
}

function loadAudioFolder(folderTitle) {
  currentAudioFolderTitle = folderTitle;
  const audioFiles = sfxDatabase[folderTitle] || [];

  if (!audioFiles.length) {
    alert(`No audio files found in ${folderTitle}`);
    return;
  }

  currentAudioList = audioFiles.map(path => ({
    name: path.split('/').pop(),
    url: path
  }));

  currentAudioIndex = 0;
  openAudioPlayer(currentAudioList[0].url, folderTitle, currentAudioList);
}

async function openAudioPlayer(url, title, audioList = []) {
  const grid = document.getElementById('audioGridViewContainer');
  const playerWrap = document.getElementById('audioPlayerContainer');
  const audioEl = document.getElementById('audioPlayer');
  const titleEl = document.getElementById('audioTitle');
  const navButtons = document.getElementById('audioNavButtons');

  if (!playerWrap || !grid || !audioEl || !titleEl) return;

  titleEl.textContent = title;
  const source = audioEl.querySelector('source');
  const type = url.toLowerCase().endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';
  await setMediaSource(audioEl, source, url, type, AUDIO_FALLBACK_MESSAGE);
  audioEl.load();

  if (navButtons) {
    if (audioList.length > 1) {
      navButtons.style.display = 'flex';
      const prevBtn = document.getElementById('audioPrevBtn');
      const nextBtn = document.getElementById('audioNextBtn');
      const counter = document.getElementById('audioCounter');
      if (counter) counter.textContent = `${currentAudioIndex + 1} / ${audioList.length}`;
      if (prevBtn) prevBtn.disabled = currentAudioIndex === 0;
      if (nextBtn) nextBtn.disabled = currentAudioIndex === audioList.length - 1;
    } else {
      navButtons.style.display = 'none';
    }
  }

  grid.classList.add('faded-out');
  setTimeout(() => {
    grid.style.display = 'none';
    playerWrap.classList.remove('hidden');
    playerWrap.classList.add('faded-in');
    audioEl.play().catch(() => {});
  }, 220);
}

function playNextAudio() {
  if (currentAudioIndex < currentAudioList.length - 1) {
    currentAudioIndex++;
    openAudioPlayer(currentAudioList[currentAudioIndex].url, currentAudioFolderTitle, currentAudioList);
  }
}

function playPreviousAudio() {
  if (currentAudioIndex > 0) {
    currentAudioIndex--;
    openAudioPlayer(currentAudioList[currentAudioIndex].url, currentAudioFolderTitle, currentAudioList);
  }
}

function closeAudioPlayer() {
  const grid = document.getElementById('audioGridViewContainer');
  const playerWrap = document.getElementById('audioPlayerContainer');
  const audioEl = document.getElementById('audioPlayer');
  if (!playerWrap || !grid || !audioEl) return;

  audioEl.pause();
  audioEl.currentTime = 0;

  playerWrap.classList.remove('faded-in');
  playerWrap.classList.add('faded-out');
  setTimeout(() => {
    playerWrap.classList.add('hidden');
    playerWrap.classList.remove('faded-out');
    grid.style.display = '';
    grid.classList.remove('faded-out');
  }, 220);
}

function loadVFXFolder(folderTitle) {
  currentVFXFolderTitle = folderTitle;
  const videos = vfxDatabase[folderTitle] || [];

  if (!videos.length) {
    alert(`No VFX files found in ${folderTitle}`);
    return;
  }

  currentVFXList = videos.map(path => ({
    name: path.split('/').pop(),
    url: path
  }));

  currentVFXIndex = 0;
  openVFXPlayer(currentVFXList[0].url, folderTitle, currentVFXList);
}

async function openVFXPlayer(url, title, videoList = []) {
  const grid = document.getElementById('vfxGridViewContainer');
  const playerWrap = document.getElementById('vfxPlayerContainer');
  const videoEl = document.getElementById('vfxPlayer');
  const titleEl = document.getElementById('vfxVideoTitle');
  const navButtons = document.getElementById('vfxNavButtons');

  if (!playerWrap || !grid || !videoEl || !titleEl) return;

  titleEl.textContent = title;
  const source = videoEl.querySelector('source');
  await setMediaSource(videoEl, source, url, 'video/mp4', VIDEO_FALLBACK_MESSAGE);
  videoEl.load();

  if (navButtons) {
    if (videoList.length > 1) {
      navButtons.style.display = 'flex';
      const prevBtn = document.getElementById('vfxPrevBtn');
      const nextBtn = document.getElementById('vfxNextBtn');
      const counter = document.getElementById('vfxCounter');
      if (counter) counter.textContent = `${currentVFXIndex + 1} / ${videoList.length}`;
      if (prevBtn) prevBtn.disabled = currentVFXIndex === 0;
      if (nextBtn) nextBtn.disabled = currentVFXIndex === videoList.length - 1;
    } else {
      navButtons.style.display = 'none';
    }
  }

  grid.classList.add('faded-out');
  setTimeout(() => {
    grid.style.display = 'none';
    playerWrap.classList.remove('hidden');
    playerWrap.classList.add('faded-in');
    videoEl.play().catch(() => {});
  }, 220);
}

function playNextVFX() {
  if (currentVFXIndex < currentVFXList.length - 1) {
    currentVFXIndex++;
    openVFXPlayer(currentVFXList[currentVFXIndex].url, currentVFXFolderTitle, currentVFXList);
  }
}

function playPreviousVFX() {
  if (currentVFXIndex > 0) {
    currentVFXIndex--;
    openVFXPlayer(currentVFXList[currentVFXIndex].url, currentVFXFolderTitle, currentVFXList);
  }
}

function closeVFXPlayer() {
  const grid = document.getElementById('vfxGridViewContainer');
  const playerWrap = document.getElementById('vfxPlayerContainer');
  const videoEl = document.getElementById('vfxPlayer');
  if (!playerWrap || !grid || !videoEl) return;

  videoEl.pause();
  videoEl.currentTime = 0;

  playerWrap.classList.remove('faded-in');
  playerWrap.classList.add('faded-out');
  setTimeout(() => {
    playerWrap.classList.add('hidden');
    playerWrap.classList.remove('faded-out');
    grid.style.display = '';
    grid.classList.remove('faded-out');
  }, 220);
}

function loadTwixtorFolder(folderTitle) {
  currentTwixtorFolderTitle = folderTitle;
  const videos = twixtorDatabase[folderTitle] || [];

  if (!videos.length) {
    alert(`No Twixtors videos found in ${folderTitle}`);
    return;
  }

  currentTwixtorList = videos.map(path => ({
    name: path.split('/').pop(),
    url: path
  }));

  currentTwixtorIndex = 0;
  openTwixtorPlayer(currentTwixtorList[0].url, folderTitle, currentTwixtorList);
}

async function openTwixtorPlayer(url, title, videoList = []) {
  const grid = document.getElementById('twixtorGridViewContainer');
  const playerWrap = document.getElementById('twixtorPlayerContainer');
  const videoEl = document.getElementById('twixtorPlayer');
  const titleEl = document.getElementById('twixtorVideoTitle');
  const navButtons = document.getElementById('twixtorNavButtons');

  if (!playerWrap || !grid || !videoEl || !titleEl) return;

  titleEl.textContent = title;
  const source = videoEl.querySelector('source');
  await setMediaSource(videoEl, source, url, 'video/mp4', VIDEO_FALLBACK_MESSAGE);
  videoEl.load();

  if (navButtons) {
    if (videoList.length > 1) {
      navButtons.style.display = 'flex';
      const prevBtn = document.getElementById('twixtorPrevBtn');
      const nextBtn = document.getElementById('twixtorNextBtn');
      const counter = document.getElementById('twixtorCounter');
      if (counter) counter.textContent = `${currentTwixtorIndex + 1} / ${videoList.length}`;
      if (prevBtn) prevBtn.disabled = currentTwixtorIndex === 0;
      if (nextBtn) nextBtn.disabled = currentTwixtorIndex === videoList.length - 1;
    } else {
      navButtons.style.display = 'none';
    }
  }

  grid.classList.add('faded-out');
  setTimeout(() => {
    grid.style.display = 'none';
    playerWrap.classList.remove('hidden');
    playerWrap.classList.add('faded-in');
    videoEl.play().catch(() => {});
  }, 220);
}

function playNextTwixtor() {
  if (currentTwixtorIndex < currentTwixtorList.length - 1) {
    currentTwixtorIndex++;
    openTwixtorPlayer(currentTwixtorList[currentTwixtorIndex].url, currentTwixtorFolderTitle, currentTwixtorList);
  }
}

function playPreviousTwixtor() {
  if (currentTwixtorIndex > 0) {
    currentTwixtorIndex--;
    openTwixtorPlayer(currentTwixtorList[currentTwixtorIndex].url, currentTwixtorFolderTitle, currentTwixtorList);
  }
}

function playMedia() {
  const audioEl = document.getElementById('myAudio') || document.getElementById('audioPlayer');
  const videoEl = document.getElementById('myVideo') || document.getElementById('videoPlayer');

  if (audioEl && typeof audioEl.play === 'function') {
    audioEl.play().catch(() => {});
  }

  if (videoEl && typeof videoEl.play === 'function') {
    videoEl.play().catch(() => {});
  }
}

function closeTwixtorPlayer() {
  const grid = document.getElementById('twixtorGridViewContainer');
  const playerWrap = document.getElementById('twixtorPlayerContainer');
  const videoEl = document.getElementById('twixtorPlayer');
  if (!playerWrap || !grid || !videoEl) return;

  videoEl.pause();
  videoEl.currentTime = 0;

  playerWrap.classList.remove('faded-in');
  playerWrap.classList.add('faded-out');
  setTimeout(() => {
    playerWrap.classList.add('hidden');
    playerWrap.classList.remove('faded-out');
    grid.style.display = '';
    grid.classList.remove('faded-out');
  }, 220);
}

function openModal(modalId) {
  closeModal();
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal() {
  document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
}

function switchToSignup() {
  closeModal();
  openModal('signupModal');
}

function switchToLogin() {
  closeModal();
  openModal('loginModal');
}

function updateAuthUI(user) {
  const userInfo = document.getElementById('userInfo');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const profileBtn = document.getElementById('profileButton');
  const profileName = document.getElementById('profileName');
  const profileAvatar = document.getElementById('profileAvatar');
  const accountPanel = document.getElementById('accountPanel');
  const accountStatus = document.getElementById('accountStatus');

  const fileInput = document.getElementById('userUploadFile');
  const uploadButton = document.getElementById('uploadUserFileBtn');
  const targetSelect = document.getElementById('uploadTargetFolder');

  const downloadBtn = document.getElementById('downloadBtn');
  const isUploader = user && user.uid === ADMIN_UID;

  if (user) {
    const displayName = user.displayName || user.email?.split('@')[0] || 'User';
    const loginLabel = user.email || displayName;
    userInfo.innerText = `Logged in as ${loginLabel}`;
    if (profileBtn) profileBtn.classList.remove('hidden');
    if (profileName) profileName.innerText = displayName;
    if (profileAvatar) {
      profileAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8e6cff&color=fff`;
      profileAvatar.alt = displayName;
    }
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    if (accountPanel) accountPanel.classList.remove('hidden');
    if (downloadBtn) downloadBtn.style.display = 'inline-block';

    if (fileInput) fileInput.style.display = isUploader ? '' : 'none';
    if (uploadButton) uploadButton.style.display = isUploader ? 'inline-block' : 'none';
    if (targetSelect) targetSelect.style.display = isUploader ? '' : 'none';
    if (accountStatus) accountStatus.innerText = isUploader ? `Signed in as ${displayName}` : `Signed in as ${displayName}. Upload access restricted.`;

    if (!isUploader) {
      if (fileInput) fileInput.disabled = true;
      if (uploadButton) uploadButton.disabled = true;
      if (targetSelect) targetSelect.disabled = true;
    } else {
      if (fileInput) fileInput.disabled = false;
      if (uploadButton) uploadButton.disabled = false;
      if (targetSelect) targetSelect.disabled = false;
    }

    closeModal();
    if (!user.displayName) {
      toggleProfileModal(true);
    }
    listUserFiles(user);
    listCommunityUploads();
  } else {
    if (downloadBtn) downloadBtn.style.display = 'none';
    userInfo.innerText = '';
    if (profileBtn) profileBtn.classList.add('hidden');
    if (profileName) profileName.innerText = 'Guest';
    if (profileAvatar) {
      profileAvatar.src = '';
      profileAvatar.alt = 'Guest';
    }
    loginBtn.style.display = 'inline-block';
    signupBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    if (accountPanel) accountPanel.classList.remove('hidden');
    if (fileInput) fileInput.disabled = true;
    if (uploadButton) uploadButton.disabled = true;
    if (targetSelect) targetSelect.disabled = true;
    if (accountStatus) accountStatus.innerText = 'Sign in to upload files.';
    const listDiv = document.getElementById('userFiles');
    if (listDiv) listDiv.innerHTML = '<p>Please sign in to see upload options and saved files.</p>';
  }
}

async function uploadUserFile() {
  const fileInput = document.getElementById('userUploadFile');
  const targetSelect = document.getElementById('uploadTargetFolder');
  if (!fileInput || !fileInput.files.length) return alert('Please choose a file first.');
  const user = auth.currentUser;
  if (!user) return alert('Please log in to upload files to your account.');

  const file = fileInput.files[0];
  const target = targetSelect ? targetSelect.value : 'user-uploads';
  const userPath = target === 'user-uploads'
    ? `user-uploads/${user.uid}`
    : `user-uploads/${user.uid}/${target}`;
  const sharedPath = target === 'user-uploads'
    ? `shared-uploads/public/${user.uid}`
    : `shared-uploads/${target}/${user.uid}`;

  const metadata = {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      uploaderUid: user.uid,
      uploaderName: user.displayName || user.email || 'Unknown',
      uploadedAt: String(Date.now())
    }
  };

  const userRef = storage.ref(`${userPath}/${file.name}`);
  const sharedRef = storage.ref(`${sharedPath}/${file.name}`);

  try {
    const [snapUser, snapShared] = await Promise.all([
      userRef.put(file, metadata),
      sharedRef.put(file, metadata)
    ]);

    // get public URLs when available
    const [userUrl, sharedUrl] = await Promise.all([
      userRef.getDownloadURL().catch(() => null),
      sharedRef.getDownloadURL().catch(() => null)
    ]);

    const destination = target === 'user-uploads'
      ? 'your account storage and the public library'
      : `your ${target} folder and the shared community folder`;

    // show a small success banner instead of alert
    showUploadNotice(`Uploaded ${file.name} to ${destination}.`);

    fileInput.value = '';
    listUserFiles(user);
    listCommunityUploads();

    console.log('Upload result', { snapUser, snapShared, userUrl, sharedUrl });
    return { userUrl, sharedUrl };
  } catch (err) {
    alert(err.message || 'Upload failed.');
    console.error('Upload failed', err);
  }
}

function listUserFiles(user) {
  const listDiv = document.getElementById('userFiles');
  if (!listDiv) return;
  if (!user) {
    listDiv.innerHTML = '<p>Please sign in to see your saved files.</p>';
    return;
  }

  const userFolder = `user-uploads/${user.uid}`;
  listDiv.innerHTML = '';
  const loadingMessage = document.createElement('p');
  loadingMessage.innerText = 'Loading your saved files...';
  listDiv.appendChild(loadingMessage);

  const showFileEntry = (itemRef, folderLabel) => {
    if (listDiv.contains(loadingMessage)) {
      listDiv.removeChild(loadingMessage);
    }

    itemRef.getDownloadURL().then(url => {
      const entry = document.createElement('div');
      entry.className = 'user-file-entry';

      const fileLink = document.createElement('a');
      fileLink.href = url;
      fileLink.target = '_blank';
      fileLink.innerText = itemRef.name;
      entry.appendChild(fileLink);

      const pathLabel = document.createElement('span');
      pathLabel.className = 'user-file-path';
      pathLabel.innerText = folderLabel ? ` • ${folderLabel}` : '';
      entry.appendChild(pathLabel);

      listDiv.appendChild(entry);
    });
  };

  const listFolder = (folderRef, currentPath = '') => {
    return folderRef.listAll().then(res => {
      const promises = [];

      res.items.forEach(itemRef => {
        const folderLabel = currentPath || 'My files';
        showFileEntry(itemRef, folderLabel);
      });

      res.prefixes.forEach(prefix => {
        const nextPath = currentPath ? `${currentPath}/${prefix.name}` : prefix.name;
        promises.push(listFolder(prefix, nextPath));
      });

      return Promise.all(promises);
    });
  };

  listFolder(storage.ref(userFolder))
    .then(() => {
      if (!listDiv.children.length) {
        listDiv.innerHTML = '<p>No stored files yet. Upload something to keep it in your account.</p>';
      }
    })
    .catch(err => {
      listDiv.innerHTML = '<p>Unable to load your saved files right now.</p>';
      console.error(err);
    });
}

function listCommunityUploads() {
  const communityDiv = document.getElementById('communityUploads');
  if (!communityDiv) return;

  communityDiv.innerHTML = '';
  const loadingMessage = document.createElement('p');
  loadingMessage.innerText = 'Loading community uploads...';
  communityDiv.appendChild(loadingMessage);

  const showCommunityEntry = async (itemRef, folderLabel) => {
    if (communityDiv.contains(loadingMessage)) {
      communityDiv.removeChild(loadingMessage);
    }

    try {
      const [url, meta] = await Promise.all([itemRef.getDownloadURL(), itemRef.getMetadata()]);
      const entry = document.createElement('div');
      entry.className = 'user-file-entry';

      const left = document.createElement('div');
      left.className = 'file-entry-left';

      const uploaderName = (meta.customMetadata && meta.customMetadata.uploaderName) || 'Shared';

      // Thumbnail: image, video or fallback icon
      const contentType = meta.contentType || '';
      let thumbEl;
      if (contentType.startsWith('image/')) {
        thumbEl = document.createElement('img');
        thumbEl.src = url;
        thumbEl.className = 'file-thumb';
        thumbEl.alt = itemRef.name;
      } else if (contentType.startsWith('video/')) {
        thumbEl = document.createElement('video');
        thumbEl.src = url;
        thumbEl.className = 'file-thumb';
        thumbEl.muted = true;
        thumbEl.preload = 'metadata';
        thumbEl.setAttribute('playsinline', '');
      } else {
        thumbEl = document.createElement('div');
        thumbEl.className = 'file-icon';
        thumbEl.innerText = (itemRef.name.split('.').pop() || '').toUpperCase();
      }

      left.appendChild(thumbEl);

      const info = document.createElement('div');
      info.className = 'file-entry-info';
      const fileLink = document.createElement('a');
      fileLink.href = url;
      fileLink.target = '_blank';
      fileLink.innerText = itemRef.name;
      fileLink.className = 'file-entry-title';
      info.appendChild(fileLink);

      const metaLine = document.createElement('div');
      metaLine.className = 'user-file-path';
      const size = meta.size ? `${(meta.size/1024).toFixed(1)} KB` : '';
      const when = meta.timeCreated ? ` • ${new Date(meta.timeCreated).toLocaleString()}` : '';
      metaLine.innerText = `${uploaderName}${size ? ' • ' + size : ''}${when}`;
      info.appendChild(metaLine);

      left.appendChild(info);
      entry.appendChild(left);

      const right = document.createElement('div');
      right.className = 'file-entry-actions';
      const dl = document.createElement('a');
      dl.href = url;
      dl.innerText = 'Download';
      dl.className = 'download-link';
      dl.target = '_blank';
      right.appendChild(dl);

      entry.appendChild(right);
      communityDiv.appendChild(entry);
    } catch (err) {
      console.error('Failed to show community entry', err);
    }
  };

  const traverseFolder = (folderRef, currentPath = '') => {
    return folderRef.listAll().then(res => {
      const promises = [];
      res.items.forEach(itemRef => {
        const folderLabel = currentPath || 'Shared files';
        showCommunityEntry(itemRef, folderLabel);
      });
      res.prefixes.forEach(prefix => {
        const nextPath = currentPath ? `${currentPath}/${prefix.name}` : prefix.name;
        promises.push(traverseFolder(prefix, nextPath));
      });
      return Promise.all(promises);
    });
  };

  traverseFolder(storage.ref('shared-uploads'))
    .then(() => {
      if (!communityDiv.children.length) {
        communityDiv.innerHTML = '<p>No community uploads yet. Be the first to share!</p>';
      }
    })
    .catch(err => {
      communityDiv.innerHTML = '<p>Unable to load community uploads right now.</p>';
      console.error(err);
    });
}

function showUploadNotice(text, timeout = 4000) {
  let notice = document.getElementById('uploadNotice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'uploadNotice';
    notice.style.position = 'fixed';
    notice.style.right = '20px';
    notice.style.top = '80px';
    notice.style.zIndex = 2000;
    notice.style.background = 'var(--accent-surface)';
    notice.style.color = 'var(--accent-contrast)';
    notice.style.padding = '12px 18px';
    notice.style.borderRadius = '12px';
    notice.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)';
    document.body.appendChild(notice);
  }
  notice.innerText = text;
  notice.style.opacity = '1';
  if (timeout > 0) setTimeout(() => { notice.style.opacity = '0'; }, timeout);
}

function toggleProfileModal(show) {
  const modal = document.getElementById('profileModal');
  if (!modal) return;
  if (show) {
    const user = auth.currentUser;
    const nameInput = document.getElementById('profileDisplayName');
    if (user && nameInput) nameInput.value = user.displayName || '';
  }
  modal.classList.toggle('hidden', !show);
}

function saveProfileSettings(event) {
  event.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert('Please log in first.');

  const displayName = document.getElementById('profileDisplayName').value.trim();
  const photoFile = document.getElementById('profilePhotoFile').files[0];
  const profileUpdate = {};

  if (displayName) profileUpdate.displayName = displayName;

  const applyUpdate = photoURL => {
    if (photoURL) profileUpdate.photoURL = photoURL;
    user.updateProfile(profileUpdate)
      .then(() => {
        alert('Profile updated successfully.');
        updateAuthUI(user);
        toggleProfileModal(false);
      })
      .catch(err => alert(err.message || 'Failed to update profile.'));
  };

  if (photoFile) {
    uploadProfilePhoto(photoFile, user.uid)
      .then(url => applyUpdate(url))
      .catch(err => {
        console.error(err);
        applyUpdate();
      });
  } else {
    applyUpdate();
  }
}

function listUserFiles(user) {
  const listDiv = document.getElementById('userFiles');
  if (!listDiv) return;
  if (!user) {
    listDiv.innerHTML = '<p>Please sign in to see your saved files.</p>';
    return;
  }

  const userFolder = `user-uploads/${user.uid}`;
  listDiv.innerHTML = '<p>Loading your saved files...</p>';

  storage.ref(userFolder).listAll()
    .then(res => {
      listDiv.innerHTML = '';
      if (!res.items.length) {
        listDiv.innerHTML = '<p>No stored files yet. Upload something to keep it in your account.</p>';
        return;
      }

      res.items.forEach(itemRef => {
        itemRef.getDownloadURL().then(url => {
          const fileLink = document.createElement('a');
          fileLink.href = url;
          fileLink.target = '_blank';
          fileLink.innerText = itemRef.name;
          fileLink.className = 'user-file-entry';
          listDiv.appendChild(fileLink);
        });
      });
    })
    .catch(err => {
      listDiv.innerHTML = '<p>Unable to load your saved files right now.</p>';
      console.error(err);
    });
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!email || !password) return alert('Please enter email and password.');

  auth.signInWithEmailAndPassword(email, password)
    .then(result => {
      updateAuthUI(result.user);
      alert(`Welcome back, ${result.user.email}`);
    })
    .catch(err => alert(err.message));
}

function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  if (!email || !password) return alert('Please enter email and password.');

  auth.createUserWithEmailAndPassword(email, password)
    .then(result => {
      updateAuthUI(result.user);
      alert(`Account created for ${result.user.email}`);
    })
    .catch(err => alert(err.message));
}

auth.onAuthStateChanged(user => {
  updateAuthUI(user);
  if (user) {
    playMedia();
  }
});

// Search files and local categories
function searchFiles() {
  openTab('home');
  const rawQuery = document.getElementById("searchInput").value.trim();
  const query = rawQuery.toLowerCase();
  const queryWords = query.split(/\s+/).filter(Boolean);
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<h3>Search Results:</h3>";

  if (!queryWords.length) {
    resultsDiv.innerHTML += '<p>Please type something to search.</p>';
    return;
  }

  const matchesQuery = text => {
    const lowerText = text.toLowerCase();
    return queryWords.some(word => lowerText.includes(word));
  };

  let foundLocal = false;
  let foundRemote = false;

  const categoryLinks = Array.from(document.querySelectorAll('.category-list a')).map(link => ({
    name: link.innerText,
    url: link.getAttribute('href') || link.href
  }));

  categoryLinks.forEach(link => {
    if (matchesQuery(link.name) || matchesQuery(link.url)) {
      resultsDiv.appendChild(createFolderCard(link.name, link.url));
      foundLocal = true;
    }
  });

  localAssets.forEach(asset => {
    if (matchesQuery(asset.name) || matchesQuery(asset.url)) {
      resultsDiv.appendChild(createResultCard(asset.name, asset.url));
      foundLocal = true;
    }
  });

  function searchStoragePath(folderPath) {
    return storage.ref(folderPath).listAll()
      .then(res => {
        const promises = [];

        res.items.forEach(itemRef => {
          const fullPath = itemRef.fullPath;
          if (matchesQuery(itemRef.name) || matchesQuery(fullPath)) {
            foundRemote = true;
            const folderLabel = itemRef.fullPath.replace(`/${itemRef.name}`, '') || folderPath;
            promises.push(
              itemRef.getDownloadURL().then(url => {
                resultsDiv.appendChild(createResultCard(itemRef.name, url, folderLabel.toUpperCase()));
              })
            );
          }
        });

        res.prefixes.forEach(prefix => {
          if (matchesQuery(prefix.name) || matchesQuery(prefix.fullPath)) {
            foundRemote = true;
            resultsDiv.appendChild(createFolderCard(prefix.name, prefix.fullPath, 'Folder'));
          }
          promises.push(searchStoragePath(prefix.fullPath));
        });

        return Promise.all(promises);
      })
      .catch(() => {
        // ignore storage errors if Firebase storage is not available
      });
  }

  const storageFolders = Array.from(new Set(localAssets
    .map(asset => asset.url.split('/')[0])
    .filter(Boolean)
  ));

  const requests = storageFolders.map(folder => searchStoragePath(folder));

  if (!foundLocal) {
    resultsDiv.innerHTML += '<p>Searching storage and folders...</p>';
  }

  Promise.allSettled(requests).then(() => {
    if (!foundLocal && !foundRemote) {
      resultsDiv.innerHTML = "<h3>Search Results:</h3><p>No matching files or folders found. Try another keyword.</p>";
    }
  });
}
