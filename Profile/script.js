// Profile page script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Firebase config (only for authentication)
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

// Subject mapping
const subjectMapping = {
    'DSA101': 'Data Structures and Algorithms',
    'OOP201': 'Object Oriented Programming',
    'DBMS301': 'Database Management System',
    'CN401': 'Computer Networks',
    'OS501': 'Operating Systems',
    'SE601': 'Software Engineering',
    'MATH101': 'Mathematics',
    'PHY101': 'Physics',
    'CHEM101': 'Chemistry',
    'DECO201': 'Digital Electronics',
    'MP301': 'Microprocessors',
    'CA401': 'Computer Architecture',
    'AI501': 'Artificial Intelligence',
    'ML501': 'Machine Learning',
    'WD701': 'Web Development',
    'MAD801': 'Mobile App Development',
    'PY101': 'Python Programming',
    'JAVA201': 'Java Programming',
    'CPP301': 'C++ Programming',
    'DS401': 'Data Science'
};

let selectedSubjects = [];
let currentUser = null;

// Utility functions
function showError(msg) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    setTimeout(() => { errorEl.style.display = 'none'; }, 5000);
}

function showSuccess(msg) {
    const successEl = document.getElementById('successMessage');
    successEl.textContent = msg;
    successEl.style.display = 'block';
    setTimeout(() => { successEl.style.display = 'none'; }, 3000);
}

function setLoading(btnId, loading, loadingText = 'Processing...', normalText = 'Save Changes') {
    const btn = document.getElementById(btnId);
    if (loading) {
        btn.innerHTML = `${loadingText} <div class="loading"></div>`;
        btn.disabled = true;
    } else {
        btn.innerHTML = normalText;
        btn.disabled = false;
    }
}

// Check authentication
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadUserProfile(user.uid);
    } else {
        window.location.href = '/Login';
    }
});

async function loadUserProfile(uid) {
    try {
        const res = await fetch(`/api/profile?uid=${uid}`);
        const data = await res.json();
        if (data.success && data.data) {
            populateForm(data.data);
        } else {
            // New user
            document.getElementById('email').value = currentUser.email;
            document.getElementById('fullName').value = currentUser.displayName || '';
            document.getElementById('profileName').textContent = currentUser.displayName || 'Student';
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        showError("Failed to load profile data");
    }
}

function populateForm(userData) {
    document.getElementById('fullName').value = userData.fullName || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('rollNumber').value = userData.rollNumber || '';
    document.getElementById('section').value = userData.section || '';
    document.getElementById('branch').value = userData.branch || '';
    document.getElementById('phoneNumber').value = userData.phoneNumber || '';
    document.getElementById('semester').value = userData.semester || '';
    document.getElementById('dateOfBirth').value = userData.dateOfBirth || '';
    document.getElementById('profileName').textContent = userData.fullName || 'Student';

    if (Array.isArray(userData.subjects)) {
        selectedSubjects = userData.subjects;
        updateSubjectsDisplay();
    }
}

// Subject management
window.addSubject = function() {
    const select = document.getElementById('subjectSelect');
    const selectedValue = select.value;
    if (selectedValue && !selectedSubjects.find(s => s.code === selectedValue)) {
        selectedSubjects.push({
            name: subjectMapping[selectedValue],
            code: selectedValue
        });
        updateSubjectsDisplay();
        select.value = '';
    }
};

window.removeSubject = function(button) {
    const subjectCode = button.parentElement.dataset.code;
    selectedSubjects = selectedSubjects.filter(subject => subject.code !== subjectCode);
    updateSubjectsDisplay();
};

function updateSubjectsDisplay() {
    const container = document.getElementById('selectedSubjects');
    container.innerHTML = '';
    selectedSubjects.forEach(subject => {
        const tag = document.createElement('div');
        tag.className = 'subject-tag';
        tag.dataset.code = subject.code;
        tag.innerHTML = `
            ${subject.name} 📚
            <button type="button" class="remove-btn" onclick="removeSubject(this)">×</button>
        `;
        container.appendChild(tag);
    });
}

// Navigation
window.goBack = function() {
    const container = document.querySelector('.container');
    container.style.animation = 'slideDown 0.5s ease-out forwards';
    setTimeout(() => { window.location.href = '/dashboard'; }, 500);
};

window.logout = async function(event) {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await signOut(auth);
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = '/Login';
        } catch (error) {
            console.error("Logout error:", error);
            showError("Logout failed. Please try again.");
        }
    }
};

// Form submission → MongoDB API
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const rollNumber = document.getElementById('rollNumber').value.trim();
    const section = document.getElementById('section').value.trim();
    const branch = document.getElementById('branch').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const semester = document.getElementById('semester').value;

    if (!fullName || !rollNumber || !section || !branch || !phoneNumber || !semester) {
        showError('Please fill in all required fields');
        return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
        showError('Please enter a valid 10-digit phone number');
        return;
    }
    if (semester < 1 || semester > 8) {
        showError('Please enter a valid semester (1-8)');
        return;
    }

    setLoading('saveBtn', true, 'Saving...', 'Save Changes');

    try {
        const profileData = {
            uid: currentUser.uid,
            fullName,
            email: document.getElementById('email').value.trim(),
            rollNumber,
            section,
            branch,
            phoneNumber,
            semester: parseInt(semester),
            dateOfBirth: document.getElementById('dateOfBirth').value || "",
            subjects: selectedSubjects
        };

        const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData)
        });

        const result = await res.json();
        if (result.success) {
            document.getElementById('profileName').textContent = profileData.fullName;
            sessionStorage.setItem('userName', profileData.fullName);
            sessionStorage.setItem('userEmail', profileData.email);
            sessionStorage.setItem('userRollNumber', profileData.rollNumber);
            showSuccess('Profile updated successfully!');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error("Save error:", error);
        showError("Failed to save profile. Please try again.");
    } finally {
        setLoading('saveBtn', false);
    }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateSubjectsDisplay();
    const dateInput = document.getElementById('dateOfBirth');
    dateInput.max = new Date().toISOString().split('T')[0];
});
