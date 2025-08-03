// Firebase configuration and imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsNHMQKy4x2uYP2kdiNe_jbUeArpYjrbw",
    authDomain: "uniconnect-a880a.firebaseapp.com",
    projectId: "uniconnect-a880a",
    storageBucket: "uniconnect-a880a.firebasestorage.app",
    messagingSenderId: "358941920538",
    appId: "1:358941920538:web:7b2da20230edcf1a61b0a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const userMenu = document.getElementById('userMenu');
const userBtn = document.getElementById('userBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
const userNameDisplay = document.getElementById('userNameDisplay');

// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const icon = themeToggle.querySelector('i');
const text = themeToggle.querySelector('span');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    text.textContent = 'Light Mode';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        text.textContent = 'Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        text.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'light');
    }
});

// Tab Switching Functionality
const navLinks = document.querySelectorAll('nav a');
const tabContents = document.querySelectorAll('.tab-content');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all links and tab contents
        navLinks.forEach(l => l.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked link
        link.classList.add('active');

        // Show corresponding tab content
        const target = link.getAttribute('href').substring(1);
        const content = document.getElementById(`${target}Content`);
        if(content) content.classList.add('active');
    });
});

// Initialize with Home tab active
document.getElementById('homeContent').classList.add('active');

// Modal functionality
function showLoginModal() {
    loginModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideLoginModal() {
    loginModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal events
closeModal.addEventListener('click', hideLoginModal);
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        hideLoginModal();
    }
});

// Switch between login and register forms
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// User menu dropdown
userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
    }
});

// Utility functions
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    setTimeout(() => {
        element.textContent = '';
    }, 5000);
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    setTimeout(() => {
        element.textContent = '';
    }, 3000);
}

function setLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (isLoading) {
        button.innerHTML = '<span class="loading"></span>Processing...';
        button.disabled = true;
    } else {
        button.innerHTML = buttonId === 'loginBtn' ? 'Login' : 'Sign Up';
        button.disabled = false;
    }
}

function validatePassword(password) {
    if (password.length < 6) {
        return "Password must be at least 6 characters long";
    }
    return null;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Please enter a valid email address";
    }
    return null;
}

// Update user interface with user data
function updateUserInterface(user) {
    const userName = user.displayName || user.email.split('@')[0];
    const studentId = `STU${Date.now()}`;
    
    // Update header
    userNameDisplay.textContent = userName;
    
    // Update sidebar
    document.getElementById('sidebarUserName').textContent = userName;
    document.getElementById('sidebarStudentId').textContent = `ID: ${studentId}`;
    
    // Update welcome message
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${userName}! Here's your academic overview for this week.`;
    
    // Store user data
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userStudentId', studentId);
}

// Reset to guest interface
function resetToGuestInterface() {
    userNameDisplay.textContent = 'Guest';
    document.getElementById('sidebarUserName').textContent = 'Guest User';
    document.getElementById('sidebarStudentId').textContent = 'ID: Not logged in';
    document.getElementById('welcomeMessage').textContent = 'Welcome to UniConnect! Please log in to access your personalized dashboard.';
    
    // Clear stored data
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userStudentId');
    
    // Show login modal
    showLoginModal();
}

// Register form handler
registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous messages
    document.getElementById('registerError').textContent = '';
    document.getElementById('registerSuccess').textContent = '';

    // Validation
    if (!name) {
        showError('registerError', 'Please enter your full name');
        return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
        showError('registerError', emailError);
        return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        showError('registerError', passwordError);
        return;
    }

    if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match');
        return;
    }

    setLoading('registerBtn', true);

    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with name
        await updateProfile(user, {
            displayName: name
        });

        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            createdAt: new Date().toISOString(),
            studentId: `STU${Date.now()}`,
            course: "Computer Science",
            year: "2025"
        });

        showSuccess('registerSuccess', 'Account created successfully!');
        
        // Update UI and close modal
        updateUserInterface(user);
        setTimeout(() => {
            hideLoginModal();
            registerFormElement.reset();
        }, 2000);

    } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email is already registered. Please use a different email.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. Please choose a stronger password.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
        }
        
        showError('registerError', errorMessage);
    } finally {
        setLoading('registerBtn', false);
    }
});

// Login form handler
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Clear previous messages
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginSuccess').textContent = '';

    // Validation
    const emailError = validateEmail(email);
    if (emailError) {
        showError('loginError', emailError);
        return;
    }

    if (!password) {
        showError('loginError', 'Please enter your password');
        return;
    }

    setLoading('loginBtn', true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        showSuccess('loginSuccess', 'Login successful!');
        
        // Update UI and close modal
        updateUserInterface(user);
        setTimeout(() => {
            hideLoginModal();
            loginFormElement.reset();
        }, 1500);

    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password. Please check your credentials.';
                break;
        }
        
        showError('loginError', errorMessage);
    } finally {
        setLoading('loginBtn', false);
    }
});

// Logout functionality
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        resetToGuestInterface();
        dropdownMenu.classList.remove('show');
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        updateUserInterface(user);
    } else {
        // User is signed out
        resetToGuestInterface();
    }
});

// Check if user is already logged in on page load
window.addEventListener('load', () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        // Show login modal if no user is logged in
        setTimeout(() => {
            showLoginModal();
        }, 1000);
    }
});

// Chatbot functionality
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatClose = document.getElementById('chat-close');

// Your deployed API link
const chatbotApiUrl = "https://uniconnect-rltc.onrender.com/chat";

chatbotToggle.addEventListener('click', () => {
  chatbotWindow.style.display = chatbotWindow.style.display === 'none' ? 'flex' : 'none';
});

chatClose.addEventListener('click', () => {
  chatbotWindow.style.display = 'none';
});

sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  const userTime = getCurrentTime();
  chatMessages.innerHTML += `<div class="user-msg">${message} <span class="timestamp">${userTime}</span></div>`;
  chatInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
    // Show Typing Indicator
  const typingElem = document.createElement('div');
  typingElem.className = 'bot-msg typing';
  typingElem.innerHTML = `<span class="dots"></span>`;
  chatMessages.appendChild(typingElem);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch(chatbotApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
        // Remove typing indicator
    typingElem.remove();

    const botTime = getCurrentTime();
    chatMessages.innerHTML += `<div class="bot-msg">${data.reply} <span class="timestamp">${botTime}</span></div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (error) {
    typingElem.remove();
    chatMessages.innerHTML += `<div class="bot-msg">Error contacting chatbot.</div>`;
  }
}

const chatWindow = document.getElementById('chatbot-window');
const chatHeader = document.getElementById('chat-header');

let isDragging = false;
let offsetX, offsetY;

chatHeader.style.cursor = "move";

chatHeader.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - chatWindow.getBoundingClientRect().left;
  offsetY = e.clientY - chatWindow.getBoundingClientRect().top;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    chatWindow.style.left = (e.clientX - offsetX) + 'px';
    chatWindow.style.top = (e.clientY - offsetY) + 'px';
    chatWindow.style.bottom = 'auto';
    chatWindow.style.right = 'auto';
    chatWindow.style.position = 'fixed';
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Chatbot profile picture
const botImage = './static/ana-avatar.png';