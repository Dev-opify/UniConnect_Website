// Import the shared auth instance from your config file
import { auth } from '../firebase-config.js';
// Import the necessary function from the Firebase SDK
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const subjectTitleEl = document.getElementById('subjectTitle');
    const unitSubtitleEl = document.getElementById('unitSubtitle');
    const backLinkEl = document.getElementById('backLink');

    // 1. Check for an authenticated user first
    onAuthStateChanged(auth, user => {
        if (user) {
            // 2. If the user is logged in, set up the page using URL parameters
            initializePageFromUrl();
        } else {
            // 3. If no user is logged in, redirect them
            console.log("User not authenticated. Redirecting to login...");
            window.location.href = '/login';
        }
    });

    /**
     * Reads subject and unit info from the URL to set up page titles and links.
     */
    function initializePageFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const subjectCode = urlParams.get('subject');
        const unitId = urlParams.get('unit'); // This will be like "Unit 1"

        if (subjectCode && unitId) {
            // Update the page header with the context
            subjectTitleEl.textContent = subjectCode;
            unitSubtitleEl.textContent = `Resources for ${unitId}`;
            
            // Set the "Back" link to correctly point to the previous Units page
            backLinkEl.href = `/Units?subject=${encodeURIComponent(subjectCode)}`;

            // Attach click listeners to the cards
            setupCardClickListeners(subjectCode, unitId);
        } else {
            // Handle cases where the URL is missing information
            subjectTitleEl.textContent = "Error";
            unitSubtitleEl.textContent = "Could not identify the subject or unit.";
            console.error("Missing 'subject' or 'unit' from URL parameters.");
        }
    }

    /**
     * Attaches click event listeners to each resource card.
     * @param {string} currentSubject - The subject code (e.g., "PHYS101").
     * @param {string} currentUnit - The unit folder name (e.g., "Unit 3").
     */
    function setupCardClickListeners(currentSubject, currentUnit) {
        // Maps the ID of the card to the filename it represents
        const resourceMapping = {
            'notes-card': 'note',
            'tutorials-card': 'tutorial',
            'pyq-card': 'pyq',
            'study-materials-card': 'studymaterial'
        };

        for (const cardId in resourceMapping) {
            const cardElement = document.getElementById(cardId);
            if (cardElement) {
                cardElement.addEventListener('click', () => {
                    const fileType = resourceMapping[cardId];
                    let viewerUrl;

                    // Add a special condition for the Previous Year Questions card
                    if (cardId === 'pyq-card') {
                        // This URL format omits the 'unit' parameter as requested
                        viewerUrl = `/pdf-viewer?subject=${encodeURIComponent(currentSubject)}&type=${encodeURIComponent(fileType)}`;
                        console.log(`Navigating to PYQ viewer (unit-independent): ${viewerUrl}`);
                    } else {
                        // This is the standard URL format for all other resource types
                        viewerUrl = `/pdf-viewer?subject=${encodeURIComponent(currentSubject)}&unit=${encodeURIComponent(currentUnit)}&type=${encodeURIComponent(fileType)}`;
                        console.log(`Navigating to PDF viewer: ${viewerUrl}`);
                    }
                    
                    // Navigate to the viewer page
                    window.location.href = viewerUrl;
                });
            }
        }
    }
});

