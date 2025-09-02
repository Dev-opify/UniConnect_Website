// Import the shared auth and db instances from your config file
import { auth, db } from '../firebase-config.js';
// Import the necessary functions from the Firebase SDK
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. AUTHENTICATION & DATA LOADING ---
    onAuthStateChanged(auth, user => {
        if (user) {
            // If user is logged in, fetch their data
            fetchAndDisplayUserData(user.uid);
            setupLogout();
        } else {
            // If user is not logged in, redirect to the login page
            console.log("No user is signed in. Redirecting to login page.");
            window.location.href = '/login'; 
        }
    });

    /**
     * Fetches user data from Firestore and updates the UI.
     * @param {string} uid - The user's unique ID from Firebase Auth.
     */
    async function fetchAndDisplayUserData(uid) {
        try {
            // Construct the document reference using the modern syntax
            const userDocRef = doc(db, 'users', uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();

                // Update user profile in the sidebar with all details
                document.getElementById('userName').textContent = userData.fullName || 'Student Name';
                document.getElementById('userMajor').textContent = userData.branch || 'Branch/Major';
                document.getElementById('userID').textContent = `ID: ${userData.rollNumber || 'N/A'}`;
                document.getElementById('userSemester').textContent = `Semester: ${userData.semester || 'N/A'}`;


                // Dynamically generate resource cards from the user's 'subjects' array
                const resourcesGrid = document.getElementById('resourcesGrid');
                if (userData.subjects && Array.isArray(userData.subjects) && userData.subjects.length > 0) {
                    resourcesGrid.innerHTML = ''; // Clear the "Loading..." message
                    userData.subjects.forEach(subject => {
                        const cardHTML = `
                            <div class="resource-card">
                                <div class="card-header">
                                    <i class="fas fa-book"></i>
                                    <h3>${subject.name}</h3>
                                </div>
                                <div class="card-body">
                                    <p>View notes, assignments, and papers for ${subject.code}.</p>
                                    <a href="/Units?subject=${subject.code}" class="btn">View Units</a>
                                </div>
                            </div>`;
                        resourcesGrid.insertAdjacentHTML('beforeend', cardHTML);
                    });
                } else {
                     resourcesGrid.innerHTML = '<p>You are not enrolled in any subjects. Please update your profile.</p>';
                }

            } else {
                console.error("User document not found in Firestore!");
                document.getElementById('userName').textContent = 'Profile Not Found';
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            document.getElementById('userName').textContent = 'Error loading profile';
        }
    }

    /**
     * Attaches the sign-out functionality to all logout buttons.
     */
    function setupLogout() {
        const logoutButtons = document.querySelectorAll('.logout-btn');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                signOut(auth).catch(error => console.error('Sign out error', error));
                // The onAuthStateChanged listener will handle the redirect automatically.
            });
        });
    }

    // --- 2. ORIGINAL DASHBOARD UI FUNCTIONALITY ---
    
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    if (themeToggle && body) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const icon = themeToggle.querySelector('i');
            if (body.classList.contains('dark-mode')) {
                icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    if(mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => mainNav.classList.toggle('open'));
    }
});
