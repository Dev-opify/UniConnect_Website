document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENT SELECTORS ---
    const wrapper = document.querySelector('.wrapper');
    const registerLink = document.querySelector('.register-link');
    const loginLink = document.querySelector('.login-link');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("User already signed in. Redirecting to dashboard.");
            window.location.href = '/dashboard'; // Redirect to your dashboard page
        }
    });

    // --- UI INTERACTION ---
    if (registerLink) {
        registerLink.onclick = (e) => {
            e.preventDefault();
            wrapper.classList.add('active');
        };
    }

    if (loginLink) {
        loginLink.onclick = (e) => {
            e.preventDefault();
            wrapper.classList.remove('active');
        };
    }
    
    // --- UTILITY FUNCTIONS ---
    function showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            setTimeout(() => errorEl.textContent = '', 5000);
        }
    }
    
    function showSuccess(elementId, message) {
        const successEl = document.getElementById(elementId);
        if (successEl) {
            successEl.textContent = message;
            setTimeout(() => successEl.textContent = '', 3000);
        }
    }

    function setLoading(buttonId, isLoading) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            if (isLoading) {
                btn.disabled = true;
                btn.innerHTML = '<span class="loading"></span>';
            } else {
                btn.disabled = false;
                btn.innerHTML = buttonId === 'loginBtn' ? 'Login' : 'Sign Up';
            }
        }
    }

    // --- FORM SUBMISSION LOGIC ---

    // Registration Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Basic validation
            if (!name) return showError('registerError', 'Full Name is required.');
            if (password.length < 6) return showError('registerError', 'Password must be at least 6 characters.');
            if (password !== confirmPassword) return showError('registerError', 'Passwords do not match.');

            setLoading('registerBtn', true);
            showError('registerError', ''); // Clear previous errors

            try {
                // 1. Create user in Firebase Authentication
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // 2. Create a corresponding user document in Firestore
                const userDocRef = db.collection('users').doc(user.uid);

                // Default data structure for a new user
                const newUser = {
                    fullName: name,
                    email: user.email,
                    SID: `SID${new Date().getTime().toString().slice(-6)}`, // Simple unique student ID
                    branch: "Not specified",
                    section: "N/A",
                    semester: 1,
                    subjects: [],
                    createdAt: new Date().toISOString(),
                };

                await userDocRef.set(newUser);
                
                showSuccess('registerSuccess', 'Account created! Redirecting to dashboard...');
                setTimeout(() => window.location.href = '/dashboard', 2000);

            } catch (error) {
                console.error("Registration Error:", error);
                let msg = 'Registration failed. Please try again.';
                if (error.code === 'auth/email-already-in-use') {
                    msg = 'This email is already registered. Please login.';
                } else if (error.code === 'auth/invalid-email') {
                    msg = 'Please enter a valid email address.';
                }
                showError('registerError', msg);
            } finally {
                setLoading('registerBtn', false);
            }
        });
    }

    // Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) return showError('loginError', 'Please enter both email and password.');

            setLoading('loginBtn', true);
            showError('loginError', ''); // Clear previous errors

            try {
                await auth.signInWithEmailAndPassword(email, password);
                showSuccess('loginSuccess', 'Login successful! Redirecting...');
                // The onAuthStateChanged listener will handle the redirect.
                // We add a small delay here for the user to see the success message.
                setTimeout(() => window.location.href = '/dashboard', 1500);

            } catch (error) {
                console.error("Login Error:", error);
                let msg = 'Invalid credentials. Please try again.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    msg = 'Incorrect email or password.';
                } else if (error.code === 'auth/too-many-requests') {
                    msg = 'Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.';
                }
                showError('loginError', msg);
            } finally {
                setLoading('loginBtn', false);
            }
        });
    }
});
