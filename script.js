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

// chatbot profile picture
const botImage = './static/ana-avatar.png';

