document.addEventListener('DOMContentLoaded', () => {
    const unitsGrid = document.getElementById('unitsGrid');
    const subjectNameTitle = document.getElementById('subjectNameTitle');

    // 1. Check if a user is logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            // 2. If logged in, get the subject code from the URL
            getSubjectFromUrlAndFetchUnits();
        } else {
            // 3. If not logged in, redirect to the login page
            console.log("User not authenticated. Redirecting to login page...");
            window.location.href = '/login';
        }
    });

    /**
     * Reads the 'subject' query parameter from the URL and triggers the data fetch.
     */
    function getSubjectFromUrlAndFetchUnits() {
        const urlParams = new URLSearchParams(window.location.search);
        const subjectCode = urlParams.get('subject');

        if (subjectCode) {
            // A subject code was found in the URL, now fetch its units
            fetchUnits(subjectCode);
        } else {
            // Handle cases where the URL is missing the subject code
            console.error("No subject code was provided in the URL.");
            subjectNameTitle.textContent = "Subject Not Found";
            unitsGrid.innerHTML = '<p>Could not load units. Please go back and select a subject.</p>';
        }
    }

    /**
     * Fetches the specific subject document from the 'units' collection in Firestore.
     * @param {string} subjectCode The unique identifier for the subject (e.g., "CHEM101").
     */
    async function fetchUnits(subjectCode) {
        try {
            const subjectDocRef = db.collection('units').doc(subjectCode);
            const doc = await subjectDocRef.get();

            if (doc.exists) {
                const subjectData = doc.data();
                const unitsArray = subjectData.units;
                
                // Update the page title with the subject's full name from Firestore
                subjectNameTitle.textContent = subjectData.name || subjectCode;

                if (unitsArray && Array.isArray(unitsArray) && unitsArray.length > 0) {
                    // If units exist, display them
                    displayUnits(unitsArray, subjectCode);
                } else {
                    // Handle case where subject exists but has no units
                    unitsGrid.innerHTML = '<p>No units have been added for this subject yet.</p>';
                }
            } else {
                // Handle case where the subject code does not match any document
                console.error(`Document for subject code "${subjectCode}" not found.`);
                subjectNameTitle.textContent = "Subject Not Found";
                unitsGrid.innerHTML = `<p>We couldn't find any information for the subject: ${subjectCode}.</p>`;
            }
        } catch (error) {
            console.error("Error fetching units from Firestore:", error);
            subjectNameTitle.textContent = "Error";
            unitsGrid.innerHTML = '<p>There was an error loading the units. Please try again later.</p>';
        }
    }

    /**
     * Dynamically creates and injects the unit cards into the grid.
     * @param {Array<Object>} units An array of unit objects (e.g., [{ name: 'Introduction', number: 1 }, ...]).
     * @param {string} subjectCode The code of the parent subject.
     */
    function displayUnits(units, subjectCode) {
        unitsGrid.innerHTML = ''; // Clear the "Fetching units..." message

        // A color palette to cycle through for the unit number backgrounds
        const cardColors = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #a8edea, #fed6e3)'
        ];

        // Sort units by number to ensure they appear in order
        units.sort((a, b) => a.number - b.number);

        units.forEach((unit, index) => {
            const card = document.createElement('div');
            card.className = 'unit-card';
            card.style.animationDelay = `${index * 0.1}s`; // Staggered animation effect

            const unitId = `unit${unit.number}`; 

            card.innerHTML = `
                <div class="unit-info">
                    <div class="unit-number" style="background: ${cardColors[index % cardColors.length]};">
                        ${unit.number}
                    </div>
                    <div class="unit-title">${unit.name}</div>
                </div>
                <svg class="arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            `;

            // Add click listener to navigate to the next page, passing both subject and unit info
            card.addEventListener('click', () => {
                window.location.href = `/notes/?subject=${subjectCode}&unit=${unitId}`;
            });

            unitsGrid.appendChild(card);
        });
    }
});

