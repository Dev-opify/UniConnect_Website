// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDsNHMQKy4x2uYP2kdiNe_jbUeArpYjrbw",
    authDomain: "uniconnect-a880a.firebaseapp.com",
    projectId: "uniconnect-a880a",
    storageBucket: "uniconnect-a880a.firebasestorage.app",
    messagingSenderId: "358941920538",
    appId: "1:358941920538:web:7b2da20230edcf1a61b0a3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Form switching
const wrapper = document.querySelector('.wrapper');
const registerLink = document.querySelector('.register-link');
const loginLink = document.querySelector('.login-link');

registerLink.onclick = () => wrapper.classList.add('active');
loginLink.onclick = () => wrapper.classList.remove('active');

// Utility
function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    setTimeout(() => el.textContent = '', 5000);
}

function showSuccess(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    setTimeout(() => el.textContent = '', 3000);
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (loading) {
        btn.innerHTML = '<span class="loading"></span> Processing...';
        btn.disabled = true;
    } else {
        btn.innerHTML = btnId === 'loginBtn' ? 'Login' : 'Sign Up';
        btn.disabled = false;
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : "Please enter a valid email address";
}

function validatePassword(pwd) {
    return pwd.length >= 6 ? null : "Password must be at least 6 characters long";
}

// Register
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const pwd = document.getElementById('registerPassword').value;
    const cpwd = document.getElementById('confirmPassword').value;

    if (!name) return showError('registerError', 'Please enter your full name');
    const eError = validateEmail(email); if (eError) return showError('registerError', eError);
    const pError = validatePassword(pwd); if (pError) return showError('registerError', pError);
    if (pwd !== cpwd) return showError('registerError', 'Passwords do not match');

    setLoading('registerBtn', true);
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pwd);
        const user = cred.user;

        await updateProfile(user, { displayName: name });

        const studentId = `STU${Date.now()}`;
        await setDoc(doc(db, "users", user.uid), {
            name, email,
            createdAt: new Date().toISOString(),
            studentId,
            course: "Computer Science",
            year: "2025"
        });

        sessionStorage.setItem('userLoggedIn', 'true');
        sessionStorage.setItem('userName', name);
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userStudentId', studentId);

        showSuccess('registerSuccess', 'Account created successfully! Redirecting...');
        setTimeout(() => window.location.href = 'index.html', 2000);
    } catch (err) {
        let msg = 'Registration failed. Please try again.';
        if (err.code === 'auth/email-already-in-use') msg = 'Email is already registered.';
        if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
        if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
        showError('registerError', msg);
    } finally {
        setLoading('registerBtn', false);
    }
});

// Login
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const pwd = document.getElementById('loginPassword').value;

    const eError = validateEmail(email); if (eError) return showError('loginError', eError);
    if (!pwd) return showError('loginError', 'Please enter your password');

    setLoading('loginBtn', true);
    try {
        const cred = await signInWithEmailAndPassword(auth, email, pwd);
        const user = cred.user;

        const studentId = `STU${Date.now()}`;
        sessionStorage.setItem('userLoggedIn', 'true');
        sessionStorage.setItem('userName', user.displayName || 'Student');
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userStudentId', studentId);

        showSuccess('loginSuccess', 'Login successful! Redirecting...');
        setTimeout(() => window.location.href = 'index.html', 2000);
    } catch (err) {
        let msg = 'Login failed. Please try again.';
        if (err.code === 'auth/user-not-found') msg = 'No account found with this email address.';
        if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
        if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
        if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
        if (err.code === 'auth/invalid-credential') msg = 'Invalid credentials.';
        showError('loginError', msg);
    } finally {
        setLoading('loginBtn', false);
    }
});

// Redirect if already logged in
auth.onAuthStateChanged((user) => {
    if (user) window.location.href = 'index.html';
});
