// Firebase config (same as before)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();

// Your UID (replace with your Firebase account UID from Firebase Console)
const adminUID = "YOUR_UID_HERE";

// Show tabs
function openTab(tabName) {
  document.querySelectorAll(".tabcontent").forEach(div => div.style.display = "none");
  document.getElementById(tabName).style.display = "block";
}

// Auth check
auth.onAuthStateChanged(user => {
  const userInfoEl = document.getElementById("userInfo");
  if (user) {
    if (userInfoEl) {
      userInfoEl.innerText = "Logged in as " + user.email;
    }

    // Only admin sees upload sections
    if (user.uid === adminUID) {
      document.getElementById("uploadEdits").style.display = "block";
      document.getElementById("uploadSfx").style.display = "block";
      document.getElementById("uploadVfx").style.display = "block";
      document.getElementById("uploadClips").style.display = "block";
    }
  } else {
    if (window.location.pathname.includes('dashboard')) {
      window.location.href = 'auth.html?mode=login';
    }
  }
});

// Upload function
function uploadFile(inputId, folder) {
  const file = document.getElementById(inputId).files[0];
  if (!file) return alert("No file selected");

  const storageRef = storage.ref(`${folder}/${file.name}`);
  storageRef.put(file).then(() => {
    alert(`${folder} uploaded successfully!`);
    listFiles(folder);
  });
}

// List files
function listFiles(folder) {
  const listDiv = document.getElementById("list" + folder.charAt(0).toUpperCase() + folder.slice(1));
  listDiv.innerHTML = "";

  storage.ref(folder).listAll().then(res => {
    res.items.forEach(itemRef => {
      itemRef.getDownloadURL().then(url => {
        const link = document.createElement("a");
        link.href = url;
        link.innerText = itemRef.name;
        link.target = "_blank";
        listDiv.appendChild(link);
        listDiv.appendChild(document.createElement("br"));
      });
    });
  });
}

// Load files for all tabs
["edits","sfx","vfx","clips"].forEach(folder => listFiles(folder));
