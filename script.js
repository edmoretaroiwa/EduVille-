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