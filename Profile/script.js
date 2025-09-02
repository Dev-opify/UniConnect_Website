// Import specific functions we need from Firebase SDKs
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Import our initialized auth and db from the central config file
// The path '../' goes up one directory from /Profile to /public
import { auth, db } from '../firebase-config.js';

// Subject mapping for display
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

// Utility functions for showing messages and loading states
function showMessage(elementId, message, isError = false) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.display = 'block';
    setTimeout(() => {
        el.style.display = 'none';
    }, isError ? 5000 : 3000);
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (loading) {
        btn.innerHTML = `Saving... <div class="loading"></div>`;
        btn.disabled = true;
    } else {
        btn.innerHTML = 'Save Changes';
        btn.disabled = false;
    }
}

// Check authentication state when the page loads
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadUserProfile(user.uid);
    } else {
        // If not logged in, redirect to the login page
        window.location.href = '/Login/index.html'; // Adjust path if needed
    }
});

// Load user data from Firestore
async function loadUserProfile(uid) {
    try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            populateForm(userData);
        } else {
            // Pre-fill for a new user who has just signed up
            document.getElementById('email').value = currentUser.email;
            document.getElementById('fullName').value = currentUser.displayName || '';
            document.getElementById('profileName').textContent = currentUser.displayName || 'New Student';
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        showMessage('errorMessage', "Failed to load profile data.", true);
    }
}

// Populate the form fields with user data
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
    
    if (userData.subjects && Array.isArray(userData.subjects)) {
        selectedSubjects = userData.subjects;
        updateSubjectsDisplay();
    }
}

// --- Subject management functions exposed to the window ---
window.addSubject = function() {
    const select = document.getElementById('subjectSelect');
    const code = select.value;
    const name = subjectMapping[code];
    
    if (code && !selectedSubjects.find(s => s.code === code)) {
        selectedSubjects.push({ code, name });
        updateSubjectsDisplay();
    }
    select.value = ''; // Reset dropdown
};

window.removeSubject = function(button) {
    const subjectCode = button.parentElement.dataset.code;
    selectedSubjects = selectedSubjects.filter(subject => subject.code !== subjectCode);
    const subjectTag = button.parentElement;
    subjectTag.style.animation = 'popOut 0.3s ease-out forwards';
    setTimeout(updateSubjectsDisplay, 300);
};

function updateSubjectsDisplay() {
    const container = document.getElementById('selectedSubjects');
    container.innerHTML = '';
    selectedSubjects.forEach(subject => {
        const tag = document.createElement('div');
        tag.className = 'subject-tag';
        tag.dataset.code = subject.code;
        tag.innerHTML = `${subject.name} <button type="button" class="remove-btn" onclick="removeSubject(this)">×</button>`;
        container.appendChild(tag);
    });
}

// --- Navigation functions ---
window.goBack = function() {
    document.querySelector('.container').style.animation = 'slideDown 0.5s ease-out forwards';
    setTimeout(() => {
        window.location.href = '/Dashboard/index.html'; // Adjust path if needed
    }, 500);
};

// --- Form submission logic ---
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!currentUser) return;

    // Validation
    const requiredFields = ['fullName', 'rollNumber', 'section', 'branch', 'phoneNumber', 'semester'];
    for (const id of requiredFields) {
        if (!document.getElementById(id).value.trim()) {
            return showMessage('errorMessage', 'Please fill in all required fields (*).', true);
        }
    }
    
    setLoading('saveBtn', true);
    
    const profileData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim(),
        section: document.getElementById('section').value.trim(),
        branch: document.getElementById('branch').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        semester: parseInt(document.getElementById('semester').value),
        dateOfBirth: document.getElementById('dateOfBirth').value || "",
        subjects: selectedSubjects,
        updatedAt: new Date().toISOString()
    };

    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, profileData, { merge: true });
        
        document.getElementById('profileName').textContent = profileData.fullName;
        
        setLoading('saveBtn', false);
        showMessage('successMessage', 'Profile updated successfully!');
        
    } catch (error) {
        console.error("Error saving profile:", error);
        setLoading('saveBtn', false);
        showMessage('errorMessage', "Failed to save profile. Please try again.", true);
    }
});
