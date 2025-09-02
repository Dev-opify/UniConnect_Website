const express = require('express');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---

// This tells Express to serve all static files (CSS, JS, images) from the project's root directory.
// For example, a request for /Dashboard/style.css will serve the file ./Dashboard/style.css
app.use(express.static(__dirname));

app.use(express.json());

// Rate limiting for the API endpoint
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);


// --- API ROUTES ---

app.get('/api/getPdf', (req, res) => {
    try {
        const { subject, unit, type } = req.query;
        if (!subject || !unit || !type) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }
        
        const safeSubject = path.basename(subject);
        const safeUnit = path.basename(unit);
        const safeType = path.basename(type) + '.pdf';
        
        // IMPORTANT: The path now includes 'Resources', as per your project structure
        const filePath = path.join(__dirname, 'Resources', safeSubject, safeUnit, safeType);

        console.log(`Attempting to serve file from: ${filePath}`);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Cache-Control', 'private, no-store');
            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        } else {
            console.error(`File not found: ${filePath}`);
            res.status(404).json({ error: 'The requested resource was not found.' });
        }
    } catch (error) {
        console.error('❌ Server error fetching PDF:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});


// --- PAGE ROUTING ---
// This section sends the correct HTML file for each page URL.

app.get('/', (req, res) => {
    // Assuming your landing page is in a 'Landing' folder
    res.sendFile(path.join(__dirname, 'Landing', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dashboard', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Login', 'index.html'));
});

app.get('/StudyRes', (req, res) => {
    res.sendFile(path.join(__dirname, 'StudyRes', 'index.html'));
});

app.get('/Units', (req, res) => {
    res.sendFile(path.join(__dirname, 'Units', 'index.html'));
});

app.get('/Notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'Notes', 'index.html'));
});

app.get('/pdf-viewer', (req, res) => {
    res.sendFile(path.join(__dirname, 'Pdfview', 'index.html'));
});

app.get('/Profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'Profile', 'index.html'));
});


// --- START THE SERVER ---
// This is the line that Vercel couldn't use but Render needs.
app.listen(PORT, () => {
    console.log(`🚀 UniConnect Server running on http://localhost:${PORT}`);
});

