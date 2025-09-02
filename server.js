const express = require('express');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
// Render sets the PORT environment variable. Use it, or default to 3000 for local testing.
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---

// This serves static files like CSS, client-side JS, and images from their respective folders.
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

        // Validation: Subject and Type are always required.
        if (!subject || !type) {
            return res.status(400).json({ error: 'Missing required parameters: subject or type.' });
        }
        
        // Security: Sanitize all inputs to prevent path traversal attacks.
        const safeSubject = path.basename(subject);
        const safeType = path.basename(type) + '.pdf'; // Add the .pdf extension
        
        let filePath;

        // --- THIS IS THE CRITICAL FIX ---
        // Conditionally build the path based on whether a 'unit' was provided.
        if (unit) {
            // Standard case: Path includes the unit folder.
            // e.g., /Resources/MATHS_0101/Unit 1/note.pdf
            const safeUnit = path.basename(unit);
            filePath = path.join(__dirname, 'Resources', safeSubject, safeUnit, safeType);
        } else {
            // Special case for PYQ: Path does not include a unit folder.
            // e.g., /Resources/MATHS_0101/pyq.pdf
            filePath = path.join(__dirname, 'Resources', safeSubject, safeType);
        }

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


// --- HTML PAGE ROUTING ---
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

