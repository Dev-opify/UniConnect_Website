// Import the shared auth and db instances from your config file
import { auth, db } from '../firebase-config.js';
// Import the necessary functions from the Firebase SDK
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const subjectTitleEl = document.getElementById('subjectTitle');
    const unitsGridEl = document.getElementById('unitsGrid');
    const backLinkEl = document.getElementById('backLink');

    let subjectCode = null;

    // First, check for an authenticated user
    onAuthStateChanged(auth, user => {
        if (!user) {
            // If no user is logged in, redirect them
            console.log("User not authenticated. Redirecting to login...");
            window.location.href = '/login';
        } else {
            // If the user is logged in, get the context from the URL
            initializePageFromUrl();
        }
    });

    /**
     * Reads subject information from the URL and triggers the data fetch.
     */
    function initializePageFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        subjectCode = urlParams.get('subject');

        if (subjectCode) {
            subjectTitleEl.textContent = `Units for ${subjectCode}`; // Set a temporary title
            fetchUnitsForSubject(subjectCode);
        } else {
            console.error("No 'subject' code found in URL parameters.");
            unitsGridEl.innerHTML = '<p class="loading-container">Could not identify the subject. Please go back.</p>';
        }
    }

    /**
     * Fetches the document for the specific subject from the '/units' collection in Firestore.
     * @param {string} currentSubjectCode The subject code (e.g., "PHYS101").
     */
    async function fetchUnitsForSubject(currentSubjectCode) {
        try {
            // Construct the reference to the document in the 'units' collection
            const unitDocRef = doc(db, 'units', currentSubjectCode);
            const docSnap = await getDoc(unitDocRef);

            if (docSnap.exists()) {
                const unitData = docSnap.data();
                // Update the page title with the full subject name from the database
                subjectTitleEl.textContent = unitData.subjectName || currentSubjectCode;
                
                if (unitData.units && Array.isArray(unitData.units) && unitData.units.length > 0) {
                    displayUnits(unitData.units);
                } else {
                    unitsGridEl.innerHTML = '<p class="loading-container">No units found for this subject.</p>';
                }
            } else {
                console.error(`Document for subject '${currentSubjectCode}' not found in 'units' collection.`);
                unitsGridEl.innerHTML = '<p class="loading-container">Units for this subject are not available yet.</p>';
            }
        } catch (error) {
            console.error("Error fetching units:", error);
            unitsGridEl.innerHTML = '<p class="loading-container">There was an error loading the units.</p>';
        }
    }

    /**
     * Clears the grid and populates it with unit cards.
     * @param {Array<Object>} units An array of unit objects from Firestore.
     */
    function displayUnits(units) {
        unitsGridEl.innerHTML = ''; // Clear loading indicator

        units.forEach((unit, index) => {
            const card = document.createElement('a');
            // The href now points to the Notes page, passing BOTH subject and unit info
            card.href = `/Notes?subject=${encodeURIComponent(subjectCode)}&unit=${encodeURIComponent(unit.id)}`;
            card.className = 'unit-card'; // Assumes you have styling for .unit-card
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="unit-info">
                    <div class="unit-number unit-${index + 1}">${index + 1}</div>
                    <div class="unit-title">${unit.name}</div>
                </div>
                <svg class="arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            `;
            unitsGridEl.appendChild(card);
        });
    }
});

