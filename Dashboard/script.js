document.addEventListener('DOMContentLoaded', () => {

    // --- 1. AUTHENTICATION & DATA LOADING ---
    // The 'auth' and 'db' constants are now available globally 
    // from firebase-config.js, so we can use them directly.

    auth.onAuthStateChanged(user => {
        if (user) {
            // If user is logged in, fetch their data
            fetchAndDisplayUserData(user.uid);
            setupLogout();
        } else {
            // If user is not logged in, redirect to the login page
            console.log("No user is signed in. Redirecting to login page.");
            // Make sure you have a login.html page in your project's root
            window.location.href = '/login'; 
        }
    });

    /**
     * Fetches user data from Firestore and updates the UI.
     * @param {string} uid - The user's unique ID from Firebase Auth.
     */
    async function fetchAndDisplayUserData(uid) {
        try {
            // Use the 'db' constant from firebase-config.js
            const userDocRef = db.collection('users').doc(uid);
            const doc = await userDocRef.get();

            if (doc.exists) {
                const userData = doc.data();

                // Update user profile in the sidebar
                document.getElementById('userName').textContent = userData.fullName || 'Student Name';
                document.getElementById('userMajor').textContent = userData.branch || 'Branch/Major';
                document.getElementById('userID').textContent = `ID: ${userData.SID || 'N/A'}`;

                // Dynamically generate resource cards from the user's 'subjects' array
                const resourcesGrid = document.getElementById('resourcesGrid');
                if (userData.subjects && Array.isArray(userData.subjects)) {
                    resourcesGrid.innerHTML = ''; // Clear the "Loading..." message
                    userData.subjects.forEach(subject => {
                        const cardHTML = `
                            <div class="resource-card">
                                <div class="card-header">
                                    <i class="fas fa-book"></i>
                                    <h3>${subject.name}</h3>
                                </div>
                                <div class="card-body">
                                    <p>Notes, assignments, and papers for ${subject.code}.</p>
                                    <a href="#" class="btn">View Resources</a>
                                </div>
                            </div>`;
                        resourcesGrid.insertAdjacentHTML('beforeend', cardHTML);
                    });
                } else {
                     resourcesGrid.innerHTML = '<p>No subjects found for this user.</p>';
                }

            } else {
                console.error("User document not found in Firestore!");
                document.getElementById('userName').textContent = 'Profile Not Found';
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
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
                // Use the 'auth' constant from firebase-config.js
                auth.signOut().catch(error => console.error('Sign out error', error));
                // The onAuthStateChanged listener will handle the redirect automatically.
            });
        });
    }

    // --- 2. ORIGINAL DASHBOARD FUNCTIONALITY ---
    
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

    // Tab Switching
    const navLinks = document.querySelectorAll('nav a:not(.logout-btn)');
    const tabContents = document.querySelectorAll('.tab-content');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (!targetId || !targetId.startsWith('#')) return;
            
            e.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            link.classList.add('active');
            
            const targetContent = document.getElementById(`${targetId.substring(1)}Content`);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    if(mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => mainNav.classList.toggle('open'));
    }

    // Chatbot functionality (unchanged)
    // ...
});
