// Profile page script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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

// Utility functions
function showError(msg) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

function showSuccess(msg) {
    const successEl = document.getElementById('successMessage');
    successEl.textContent = msg;
    successEl.style.display = 'block';
    setTimeout(() => {
        successEl.style.display = 'none';
    }, 3000);
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
        window.location.href = 'login.html';
    }
});

async function loadUserProfile(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            populateForm(userData);
        } else {
            // New user, populate with basic info
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
    document.getElementById('fullName').value = userData.fullName || userData.name || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('rollNumber').value = userData.rollNumber || '';
    document.getElementById('section').value = userData.section || '';
    document.getElementById('branch').value = userData.branch || '';
    document.getElementById('phoneNumber').value = userData.phoneNumber || '';
    document.getElementById('semester').value = userData.semester || '';
    document.getElementById('dateOfBirth').value = userData.dateOfBirth || '';
    document.getElementById('profileName').textContent = userData.fullName || userData.name || 'Student';
    
    if (userData.subjects && Array.isArray(userData.subjects)) {
        selectedSubjects = userData.subjects.map(subject => ({
            code: subject.code,
            name: subject.name
        }));
        updateSubjectsDisplay();
    }
}

// Subject management functions
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
        
        // Add animation feedback
        select.style.transform = 'scale(1.05)';
        setTimeout(() => {
            select.style.transform = 'scale(1)';
        }, 200);
    }
};

window.removeSubject = function(button) {
    const subjectTag = button.parentElement;
    const subjectCode = subjectTag.dataset.code;
    
    // Remove from array
    selectedSubjects = selectedSubjects.filter(subject => subject.code !== subjectCode);
    
    // Add exit animation
    subjectTag.style.animation = 'popOut 0.3s ease-out forwards';
    setTimeout(() => {
        updateSubjectsDisplay();
    }, 300);
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

// Navigation functions
window.goBack = function() {
    const container = document.querySelector('.container');
    container.style.animation = 'slideDown 0.5s ease-out forwards';
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
};

window.logout = async function(event) {
    if (confirm('Are you sure you want to logout?')) {
        const logoutBtn = event.target;
        setLoading('', true, 'Logging out...', '🚪 Logout');
        logoutBtn.innerHTML = '🚪 Logging out... <div class="loading"></div>';
        logoutBtn.disabled = true;
        
        try {
            await signOut(auth);
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Logout error:", error);
            showError("Logout failed. Please try again.");
            logoutBtn.innerHTML = '🚪 Logout';
            logoutBtn.disabled = false;
        }
    }
};

// Form submission
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate required fields
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
    
    // Validate phone number (should be digits only)
    if (!/^\d{10}$/.test(phoneNumber)) {
        showError('Please enter a valid 10-digit phone number');
        return;
    }
    
    // Validate semester
    if (semester < 1 || semester > 8) {
        showError('Please enter a valid semester (1-8)');
        return;
    }
    
    const saveBtn = document.getElementById('saveBtn');
    setLoading('saveBtn', true, 'Saving...', 'Save Changes');
    
    try {
        const profileData = {
            fullName: fullName,
            email: document.getElementById('email').value.trim(),
            rollNumber: rollNumber,
            section: section,
            branch: branch,
            phoneNumber: phoneNumber,
            semester: parseInt(semester),
            dateOfBirth: document.getElementById('dateOfBirth').value || "",
            subjects: selectedSubjects,
            updatedAt: new Date().toISOString()
        };

        // Add createdAt if it's a new document
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (!userDoc.exists()) {
            profileData.createdAt = new Date().toISOString();
        }

        await setDoc(doc(db, "users", currentUser.uid), profileData, { merge: true });
        
        // Update profile name display
        document.getElementById('profileName').textContent = profileData.fullName;
        
        // Update session storage
        sessionStorage.setItem('userName', profileData.fullName);
        sessionStorage.setItem('userEmail', profileData.email);
        sessionStorage.setItem('userRollNumber', profileData.rollNumber);
        
        setLoading('saveBtn', false);
        saveBtn.innerHTML = '✓ Saved!';
        saveBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        
        showSuccess('Profile updated successfully!');
        
        setTimeout(() => {
            saveBtn.innerHTML = 'Save Changes';
            saveBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        }, 2000);
        
    } catch (error) {
        console.error("Save error:", error);
        setLoading('saveBtn', false);
        showError("Failed to save profile. Please try again.");
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize subjects display
    updateSubjectsDisplay();
    
    // Set current date as max for date of birth
    const dateInput = document.getElementById('dateOfBirth');
    const today = new Date().toISOString().split('T')[0];
    dateInput.max = today;
});