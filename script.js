// Star button on course page
function starCourse(btn) {
  btn.classList.toggle('btn-gold');
  btn.classList.toggle('btn-outline-blue');
  btn.innerText = btn.innerText.includes('Starred') ? '⭐ Star' : '⭐ Starred!';
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(link.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

// Animate stats
const stats = document.querySelectorAll('.mini-stat h3');
const animate = el => {
  const raw = el.innerText;
  const num = parseInt(raw);
  if (isNaN(num)) return;
  let c = 0;
  const step = Math.ceil(num / 40);
  const timer = setInterval(() => {
    c += step;
    if (c >= num) { c = num; clearInterval(timer); }
    el.innerText = c + (raw.includes('+') ? '+' : '');
  }, 30);
};
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
  });
});
stats.forEach(s => io.observe(s));

/* ============================
   FIREBASE AUTHENTICATION
   Login / Signup / Logout
   ============================ */

// Log out
function logout() {
  auth.signOut().then(() => {
    alert('👋 You have been logged out.\n\nSee you soon! — EduVille');
    window.location.href = 'index.html';
  });
}

// Switch between login / signup tabs
function switchTab(mode) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  if (!loginForm) return;

  if (mode === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
  } else {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
  }
}

// Handle login
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert('🎉 Welcome back!\n\nCommit to Your Future. ✨');
      window.location.href = 'index.html';
    })
    .catch((error) => {
      let msg = '❌ Login failed.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        msg = '❌ Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        msg = '❌ No account found with this email.\n\nTry signing up first.';
      }
      alert(msg);
    });
}

// Handle signup
function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const role = document.querySelector('input[name="role"]:checked').value;

  if (password.length < 6) {
    alert('⚠️ Password must be at least 6 characters.');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return db.collection('users').doc(user.uid).set({
        name: name,
        email: email,
        role: role,
        joined: new Date().toISOString()
      });
    })
    .then(() => {
      alert('🎓 Welcome to EduVille!\n\nYou are signed in as a ' + role + '.\n\nCommit to Your Future ✨');
      window.location.href = 'index.html';
    })
    .catch((error) => {
      if (error.code === 'auth/email-already-in-use') {
        alert('⚠️ An account with this email already exists.\n\nTry logging in instead.');
      } else {
        alert('❌ Signup failed: ' + error.message);
      }
    });
}

// Replace Login button with user badge when logged in
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('.btn-login');
  if (!loginBtn) return;

  auth.onAuthStateChanged((user) => {
    if (user) {
      db.collection('users').doc(user.uid).get().then((doc) => {
        const userData = doc.data() || {};
        const firstName = (userData.name || user.email).split(' ')[0];
        loginBtn.outerHTML = `
          <span class="user-badge" onclick="if(confirm('Log out of EduVille?')) logout()">
            👤 ${firstName}
          </span>
        `;
      });
    }
  });
});
/* ============================
   ADD VIDEO FEATURE
   ============================ */

// Convert any YouTube URL into embed URL
function extractYouTubeEmbed(url) {
  if (!url) return '';
  // Handle youtu.be/XXXX
  let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (match) return 'https://www.youtube.com/embed/' + match[1];
  // Handle youtube.com/watch?v=XXXX
  match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (match) return 'https://www.youtube.com/embed/' + match[1];
  // Handle youtube.com/embed/XXXX
  match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (match) return 'https://www.youtube.com/embed/' + match[1];
  // If nothing matches, return as-is
  return url;
}

// Handle form submission
function handleAddVideo(e) {
  e.preventDefault();

  // Must be logged in
  const user = auth.currentUser;
  if (!user) {
    alert('🔒 Please log in first to add videos.');
    window.location.href = 'login.html';
    return;
  }

  // Get form values
  const title = document.getElementById('video-title').value.trim();
  const rawUrl = document.getElementById('video-url').value.trim();
  const course = document.getElementById('video-course').value;
  const duration = document.getElementById('video-duration').value || '0';
  const description = document.getElementById('video-description').value.trim();

  // Convert YouTube URL
  const embedUrl = extractYouTubeEmbed(rawUrl);

  if (!title || !embedUrl || !course) {
    alert('⚠️ Please fill in title, video URL, and course.');
    return;
  }

  // Get user info for author name
  db.collection('users').doc(user.uid).get().then((doc) => {
    const userData = doc.data() || {};
    const authorName = userData.name || user.email || 'Anonymous';

    // Save to Firestore
    return db.collection('videos').add({
      title: title,
      embedUrl: embedUrl,
      originalUrl: rawUrl,
      course: course,
      duration: duration + ' min',
      description: description,
      author: authorName,
      authorId: user.uid,
      createdAt: new Date().toISOString()
    });
  })
  .then(() => {
    alert('🎬 Video published successfully!\n\nIt will now appear on the course page.\n\nCommit to Your Future ✨');
    window.location.href = 'course.html';
  })
  .catch((error) => {
    alert('❌ Failed to publish video: ' + error.message);
  });
}

// Show "+ Add Video" button only if logged in (called on page load)
document.addEventListener('DOMContentLoaded', () => {
  // Wait a moment for auth to initialise
  auth.onAuthStateChanged((user) => {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Remove existing add button if any
    const existing = navLinks.querySelector('.btn-add-wrap');
    if (existing) existing.remove();

    if (user) {
      // Insert "+ Add Video" button
      const addLi = document.createElement('li');
      addLi.className = 'btn-add-wrap';
      addLi.innerHTML = '<a href="add-video.html" class="btn-add">+ Video</a>';
      // Insert before the Login button
      const loginBtn = navLinks.querySelector('.btn-login');
      if (loginBtn) {
        navLinks.insertBefore(addLi, loginBtn.parentElement);
      } else {
        navLinks.appendChild(addLi);
      }
    }
  });
});
/* ============================
   DYNAMIC COURSE PAGE
   Loads videos from Firestore
   ============================ */

// Load all videos and display them on course.html
function loadCourseVideos() {
  const container = document.getElementById('lesson-list');
  if (!container) return;

  db.collection('videos')
  .get()
    .then((snapshot) => {
      // Clear loading message
      container.innerHTML = '';

      if (snapshot.empty) {
        container.innerHTML = `
          <div class="card" style="text-align:center; padding:2rem;">
            <h3 style="color:var(--edu-blue);">📭 No videos yet</h3>
            <p class="muted">Be the first to publish a lesson!</p>
            <a href="add-video.html" class="btn btn-gold" style="margin-top:1rem;">+ Add First Video</a>
          </div>
        `;
        return;
      }

      let index = 1;
      snapshot.forEach((doc) => {
        const v = doc.data();
        const num = String(index).padStart(2, '0');
        const row = document.createElement('div');
        row.className = 'lesson-row';
        row.innerHTML = `
          <div class="lesson-info">
            <span class="lesson-num">${num}</span>
            <div>
              <h4>${v.title}</h4>
              <p class="muted">📘 ${v.course} · ${v.duration || 'Video'} · ${v.author || 'Unknown'}</p>
            </div>
          </div>
          <a href="video.html?id=${doc.id}" class="btn btn-gold small">▶ Watch</a>
        `;
        container.appendChild(row);
        index++;
      });
    })
    .catch((error) => {
      container.innerHTML = `
        <div class="card" style="text-align:center;">
          <h3 style="color:#dc2626;">⚠️ Could not load videos</h3>
          <p class="muted">${error.message}</p>
        </div>
      `;
    });
}

// Load a single video on video.html based on URL parameter
function loadSingleVideo() {
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get('id');
  if (!videoId) return; // Nothing to load, keep defaults

  const frame = document.getElementById('video-frame');
  const titleEl = document.getElementById('video-title-el');
  const metaEl = document.getElementById('video-meta-el');
  const descEl = document.getElementById('video-desc-el');
  if (!frame) return;

  db.collection('videos').doc(videoId).get()
    .then((doc) => {
      if (!doc.exists) {
        titleEl.innerText = '❌ Video not found';
        metaEl.innerText = 'This video may have been removed.';
        return;
      }
      const v = doc.data();
      frame.src = v.embedUrl;
      titleEl.innerText = v.title;
      metaEl.innerText = `📘 ${v.course} · ${v.duration || 'Video'} · ${v.author || 'Unknown'}`;
      descEl.innerText = v.description || '';
    })
    .catch((error) => {
      titleEl.innerText = '⚠️ Error loading video';
      metaEl.innerText = error.message;
    });
}

// Show "+ Add Video" button on course page if logged in
document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-video-btn');
  if (!addBtn) return;

  auth.onAuthStateChanged((user) => {
    if (user) {
      addBtn.style.display = 'inline-flex';
    } else {
      addBtn.style.display = 'none';
    }
  });
});
/* ============================
   REAL STATS FROM FIRESTORE
   ============================ */

function loadRealStats() {
  // Only run on homepage
  const statsRow = document.querySelector('.stats-row');
  if (!statsRow) return;

  // Count videos
  db.collection('videos').get().then((snap) => {
    const videoCount = snap.size;
    document.querySelectorAll('.mini-stat h3')[2].innerText = videoCount + '';
  });

  // Count users
  db.collection('users').get().then((snap) => {
    const userCount = snap.size;
    const teachers = snap.docs.filter(d => d.data().role === 'teacher').length;
    const students = userCount - teachers;
    document.querySelectorAll('.mini-stat h3')[0].innerText = students + '';
    document.querySelectorAll('.mini-stat h3')[3].innerText = teachers + '';
  });

  // Count unique courses
  db.collection('videos').get().then((snap) => {
    const courses = new Set();
    snap.forEach(doc => courses.add(doc.data().course));
    document.querySelectorAll('.mini-stat h3')[1].innerText = courses.size + '';
  });
}

document.addEventListener('DOMContentLoaded', loadRealStats);
/* ============================
   COMING SOON HANDLER
   ============================ */

document.querySelectorAll('.coming-soon').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    alert('✨ Coming soon!\n\nThis feature is under construction.\n\n— EduVille · Commit to Your Future');
  });
});e
/* ============================
   PAGE-SPECIFIC LOADERS
   ============================ */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('lesson-list')) {
    loadCourseVideos();
  }
  if (document.getElementById('video-frame')) {
    loadSingleVideo();
  }
});
/* ============================
   PAGE-SPECIFIC LOADERS
   ============================ */

document.addEventListener('DOMContentLoaded', () => {
  // On course.html — load the lesson list
  if (document.getElementById('lesson-list')) {
    console.log('Loading course videos...');
    loadCourseVideos();
  }

  // On video.html — load a single video by ID
  if (document.getElementById('video-frame')) {
    console.log('Loading single video...');
    loadSingleVideo();
  }
});