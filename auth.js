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

function openAuthTab(tab) {
  document.getElementById('loginTab').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signupTab').classList.toggle('hidden', tab !== 'signup');
  document.getElementById('loginTabBtn').classList.toggle('active', tab === 'login');
  document.getElementById('signupTabBtn').classList.toggle('active', tab === 'signup');
}

function showMessage(text, success = true) {
  const message = document.getElementById('authMessage');
  message.innerText = text;
  message.className = `auth-message ${success ? 'success' : 'error'}`;
  message.classList.remove('hidden');
}

function hideMessage() {
  document.getElementById('authMessage').classList.add('hidden');
}

function uploadProfilePhoto(file, uid) {
  const storageRef = firebase.storage().ref(`profile-pics/${uid}/${file.name}`);
  return storageRef.put(file)
    .then(() => storageRef.getDownloadURL());
}

function toRGB(hex) {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
}

function applyTheme(theme) {
  document.body.classList.remove('theme-dark', 'theme-light', 'theme-purple');
  document.body.classList.add(`theme-${theme}`);
  localStorage.setItem('suvieTheme', theme);
}

function applyAccentColor(color) {
  document.documentElement.style.setProperty('--accent-color', color);
  document.documentElement.style.setProperty('--accent-rgb', toRGB(color));
  localStorage.setItem('suvieAccent', color);
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      showMessage(`Logged in as ${result.user.email}. Redirecting...`);
      setTimeout(() => window.location.href = 'index.html', 1200);
    })
    .catch(err => showMessage(err.message, false));
}

function handleLogin(event) {
  event.preventDefault();
  hideMessage();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!email || !password) {
    return showMessage('Please enter both email and password.', false);
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(result => {
      showMessage(`Welcome back, ${result.user.email}! Redirecting...`);
      setTimeout(() => window.location.href = 'index.html', 1200);
    })
    .catch(err => showMessage(err.message, false));
}

function handleSignup(event) {
  event.preventDefault();
  hideMessage();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const photoFile = document.getElementById('signupPhoto').files[0];

  if (!name || !email || !password) {
    return showMessage('Please enter a nickname, email, and password.', false);
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(result => {
      const user = result.user;
      const profileUpdate = { displayName: name };

      const updateProfileAndRedirect = photoURL => {
        if (photoURL) profileUpdate.photoURL = photoURL;
        user.updateProfile(profileUpdate)
          .then(() => {
            showMessage(`Account created for ${user.email}! Redirecting...`);
            setTimeout(() => window.location.href = 'index.html', 1200);
          })
          .catch(err => {
            showMessage(`Profile saved, but failed to update user info. ${err.message}`, false);
            setTimeout(() => window.location.href = 'index.html', 1200);
          });
      };

      if (photoFile) {
        uploadProfilePhoto(photoFile, user.uid)
          .then(url => updateProfileAndRedirect(url))
          .catch(err => {
            console.error(err);
            updateProfileAndRedirect();
          });
      } else {
        updateProfileAndRedirect();
      }
    })
    .catch(err => showMessage(err.message, false));
}

function initAuthPage() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode') === 'signup' ? 'signup' : 'login';
  openAuthTab(mode);

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('signupForm').addEventListener('submit', handleSignup);

  const accentColor = localStorage.getItem('suvieAccent') || '#8e6cff';
  document.documentElement.style.setProperty('--accent-color', accentColor);
  document.documentElement.style.setProperty('--accent-rgb', toRGB(accentColor));

  auth.onAuthStateChanged(user => {
    if (user) {
      showMessage(`Already signed in as ${user.email}. Redirecting...`);
      setTimeout(() => window.location.href = 'index.html', 1200);
    }
  });
}

document.addEventListener('DOMContentLoaded', initAuthPage);
