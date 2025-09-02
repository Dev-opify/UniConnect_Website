// Import the shared auth and db instances from your config file
import { auth, db } from '../firebase-config.js';
// Import the necessary functions from the Firebase SDK
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const subjectsGrid = document.getElementById('subjectsGrid');

    onAuthStateChanged(auth, user => {
        if (user) {
            // User is signed in, fetch their subjects
            fetchUserSubjects(user.uid);
        } else {
            // No user is signed in, redirect to login page
            console.log("User not logged in. Redirecting...");
            window.location.href = '/login';
        }
    });

    /**
     * Fetches the user's document from Firestore and displays their subjects.
     * @param {string} uid The user's unique ID.
     */
    async function fetchUserSubjects(uid) {
        if (!subjectsGrid) return;

        try {
            // Use the modern 'doc' and 'getDoc' functions, which is the correct syntax
            const userDocRef = doc(db, 'users', uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                const subjects = userData.subjects;

                if (subjects && Array.isArray(subjects) && subjects.length > 0) {
                    displaySubjects(subjects);
                } else {
                    subjectsGrid.innerHTML = '<p class="loading-container">You have not added any subjects. Please update your profile.</p>';
                }
            } else {
                console.error("User document not found!");
                subjectsGrid.innerHTML = '<p class="loading-container">Could not find your user profile.</p>';
            }
        } catch (error) {
            console.error("Error fetching user subjects:", error);
            let userMessage = 'There was an error loading your subjects. Please try again later.';
            // Provide specific feedback if the error is permission-related
            if (error.code === 'permission-denied') {
                userMessage = 'Permission denied. Please check your Firestore Security Rules.';
            }
            subjectsGrid.innerHTML = `<p class="loading-container">${userMessage}</p>`;
        }
    }

    /**
     * Clears the grid and populates it with subject cards.
     * @param {Array<Object>} subjects An array of subject objects.
     */
    function displaySubjects(subjects) {
        subjectsGrid.innerHTML = ''; // Clear the loading indicator

        const cardStyles = [
            { icon: 'fa-laptop-code', color: 'linear-gradient(135deg, #667eea, #764ba2)' },
            { icon: 'fa-microchip', color: 'linear-gradient(135deg, #f093fb, #f5576c)' },
            { icon: 'fa-database', color: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
            { icon: 'fa-atom', color: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
            { icon: 'fa-terminal', color: 'linear-gradient(135deg, #fa709a, #fee140)' },
            { icon: 'fa-mobile-alt', color: 'linear-gradient(135deg, #a8edea, #fed6e3)' }
        ];

        subjects.forEach((subject, index) => {
            // Cycle through the predefined styles for visual variety
            const style = cardStyles[index % cardStyles.length];
            
            const card = document.createElement('a');
            // Construct the correct URL for the next page, passing the subject code
            card.href = `/Units?subject=${encodeURIComponent(subject.code)}`;
            card.className = 'subject-card';
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="card-content">
                    <div class="icon-container" style="background: ${style.color};">
                        <i class="fas ${style.icon}"></i>
                    </div>
                    <div class="card-text">
                        <h3 class="subject-title">${subject.name}</h3>
                    </div>
                    <div class="arrow-icon">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            `;
            subjectsGrid.appendChild(card);
        });
    }
});

