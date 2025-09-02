const express = require('express');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
// Render sets the PORT environment variable. Use it, or default to 3000 for local testing.
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---

// JOB #2: THE STATIC FILE SERVER (THE "MAILROOM")
// This is the most important line for fixing your CSS/JS errors.
// It tells Express that for any request for a static file (like .css, .js, .png),
// it should look for that file in the corresponding folder relative to the root directory.
app.use(express.static(__dirname));

// This allows the server to understand JSON in request bodies.
app.use(express.json());

// Rate limiting for your API endpoint to prevent abuse.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many API requests, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);


// --- API ROUTE (FOR SERVING PDFS) ---

app.get('/api/getPdf', (req, res) => {
    try {
        const { subject, unit, type } = req.query;
        if (!subject || !unit || !type) {
            return res.status(400).json({ error: 'Missing required parameters: subject, unit, or type.' });
        }
        
        // Security: Sanitize inputs to prevent users from accessing files outside the 'Resources' folder.
        const safeSubject = path.basename(subject);
        const safeUnit = path.basename(unit);
        const safeType = path.basename(type) + '.pdf'; // Add the .pdf extension
        
        const filePath = path.join(__dirname, 'Resources', safeSubject, safeUnit, safeType);

        console.log(`Request received for: ${filePath}`);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        } else {
            console.error(`File not found: ${filePath}`);
            res.status(404).json({ error: 'The requested PDF was not found.' });
        }
    } catch (error) {
        console.error('Server error fetching PDF:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


// --- HTML PAGE ROUTING (JOB #1: THE "RECEPTIONIST") ---
// This section sends the correct HTML file for each clean URL.

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Landing', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dashboard', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Login', 'index.html'));
});

app.get('/studyRes', (req, res) => {
    res.sendFile(path.join(__dirname, 'StudyRes', 'index.html'));
});

app.get('/units', (req, res) => {
    res.sendFile(path.join(__dirname, 'Units', 'index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'Notes', 'index.html'));
});

app.get('/pdf-viewer', (req, res) => {
    res.sendFile(path.join(__dirname, 'Pdfview', 'index.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'Profile', 'index.html'));
});


// --- START THE SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 UniConnect Server is live on http://localhost:${PORT}`);
});

