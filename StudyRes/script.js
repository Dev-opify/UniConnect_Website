document.addEventListener('DOMContentLoaded', () => {
    const subjectsGrid = document.getElementById('subjectsGrid');

    // Listen for authentication state changes
    auth.onAuthStateChanged(user => {
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
            const userDocRef = db.collection('users').doc(uid);
            const doc = await userDocRef.get();

            if (doc.exists) {
                const userData = doc.data();
                const subjects = userData.subjects;

                // Check if the user has a subjects array
                if (subjects && Array.isArray(subjects) && subjects.length > 0) {
                    displaySubjects(subjects);
                } else {
                    subjectsGrid.innerHTML = '<p>You are not enrolled in any subjects yet.</p>';
                }
            } else {
                console.error("No such user document!");
                subjectsGrid.innerHTML = '<p>Could not find your user profile.</p>';
            }
        } catch (error) {
            console.error("Error fetching user subjects:", error);
            subjectsGrid.innerHTML = '<p>There was an error loading your subjects. Please try again later.</p>';
        }
    }

    /**
     * Clears the grid and populates it with subject cards.
     * @param {Array<Object>} subjects An array of subject objects.
     */
    function displaySubjects(subjects) {
        // Clear the loading indicator
        subjectsGrid.innerHTML = '';

        // Predefined styles for the cards to cycle through
        const cardStyles = [
            { icon: 'fa-calculator', color: 'linear-gradient(135deg, #667eea, #764ba2)' },
            { icon: 'fa-flask', color: 'linear-gradient(135deg, #f093fb, #f5576c)' },
            { icon: 'fa-book-open', color: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
            { icon: 'fa-landmark', color: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
            { icon: 'fa-palette', color: 'linear-gradient(135deg, #fa709a, #fee140)' },
            { icon: 'fa-laptop-code', color: 'linear-gradient(135deg, #a8edea, #fed6e3)' }
        ];

        subjects.forEach((subject, index) => {
            // Cycle through the styles array
            const style = cardStyles[index % cardStyles.length];

            const card = document.createElement('a');
            card.href = `/Units/index.html?subject=${encodeURIComponent(subject.code)}`; // Example of dynamic link
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
