document.addEventListener('DOMContentLoaded', () => {

    const subjectTitleEl = document.getElementById('subjectTitle');
    const unitSubtitleEl = document.getElementById('unitSubtitle');
    const backLinkEl = document.getElementById('backLink');

    let subjectCode, unitId;

    // This assumes your firebase-config.js has already initialized 'auth' globally
    if (typeof auth === 'undefined') {
        console.error("Firebase has not been initialized. Make sure firebase-config.js is loaded before this script.");
        subjectTitleEl.textContent = "Configuration Error";
        return;
    }

    // 1. Check for an authenticated user
    auth.onAuthStateChanged(user => {
        if (user) {
            // 2. If the user is logged in, get the context from the URL
            initializePageFromUrl();
        } else {
            // 3. If no user is logged in, redirect them to the login page
            console.log("User not authenticated. Redirecting to login page...");
            window.location.href = '/login.html'; // Adjust this path if your login page is elsewhere
        }
    });

    /**
     * Reads subject and unit information from the URL's query parameters to set up the page.
     */
    function initializePageFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        subjectCode = urlParams.get('subject');
        unitId = urlParams.get('unit'); // This will be like "unit3"

        if (subjectCode && unitId) {
            // Extract the number from the unitId string (e.g., "unit3" becomes "3")
            const unitNumber = unitId.replace('unit', '');
            
            // Update the page header with the specific subject and unit information
            subjectTitleEl.textContent = subjectCode; // For a better UX, you could fetch the full subject name from Firestore here
            unitSubtitleEl.textContent = `Resources for Unit ${unitNumber}`;
            
            // Set the "Back" link to correctly point to the previous Units page
            backLinkEl.href = `/Units/index.html?subject=${encodeURIComponent(subjectCode)}`;

            // Attach the click listeners that will build the URL for the PDF viewer
            setupCardClickListeners(subjectCode, `Unit ${unitNumber}`);

        } else {
            // This is an error case in case someone navigates to this page directly
            subjectTitleEl.textContent = "Error";
            unitSubtitleEl.textContent = "Could not identify the subject or unit. Please go back.";
            console.error("Missing 'subject' or 'unit' from URL parameters.");
        }
    }

    /**
     * Attaches click event listeners to each of the resource cards.
     * @param {string} currentSubject - The subject code from the URL (e.g., "PHYS101").
     * @param {string} currentUnit - The unit folder name (e.g., "Unit 3").
     */
    function setupCardClickListeners(currentSubject, currentUnit) {
        const resourceMapping = {
            'notes-card': 'note.pdf',
            'tutorials-card': 'tutorial.pdf',
            'pyq-card': 'pyq.pdf',
            'study-materials-card': 'studymaterial.pdf'
        };

        for (const cardId in resourceMapping) {
            const cardElement = document.getElementById(cardId);
            if (cardElement) {
                cardElement.addEventListener('click', () => {
                    const fileName = resourceMapping[cardId];
                    
                    // MODIFIED: Construct the URL for the PDF viewer page, passing parameters
                    const viewerUrl = `/pdf-viewer/index.html?subject=${encodeURIComponent(currentSubject)}&unit=${encodeURIComponent(currentUnit)}&type=${encodeURIComponent(fileName)}`;
                    
                    console.log(`Navigating to PDF viewer: ${viewerUrl}`);
                    
                    // Navigate to the new viewer page
                    window.location.href = viewerUrl;
                });
            }
        }
    }
});

