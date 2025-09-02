// --- Firebase Configuration ---
// This file centralizes the Firebase setup for the entire application.

// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsNHMQKy4x2uYP2kdiNe_jbUeArpYjrbw",
    authDomain: "uniconnect-a880a.firebaseapp.com",
    projectId: "uniconnect-a880a",
    storageBucket: "uniconnect-a880a.firebasestorage.app",
    messagingSenderId: "358941920538",
    appId: "1:358941920538:web:7b2da20230edcf1a61b0a3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export the initialized services so they can be used in other files
const auth = firebase.auth();
const db = firebase.firestore();
