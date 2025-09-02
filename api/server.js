const express = require('express');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// --- MODIFIED DYNAMIC PDF PROXY ENDPOINT ---
app.get('/api/getPdf', (req, res) => {
    try {
        const { subject, unit, type } = req.query;

        // 1. Validate input parameters
        if (!subject || !unit || !type) {
            return res.status(400).json({ error: 'Missing required parameters: subject, unit, or type.' });
        }

        // 2. Security: Sanitize inputs to prevent path traversal attacks.
        // path.basename will strip out any directory manipulation attempts like '../'
        const safeSubject = path.basename(subject);
        const safeUnit = path.basename(unit);
        const safeType = path.basename(type);
        
        // 3. Construct the full, safe file path
        const filePath = path.join(__dirname, 'public', 'Resources', safeSubject, safeUnit, safeType);

        console.log(`Attempting to serve file from: ${filePath}`);

        // 4. Check if the file exists and serve it
        if (fs.existsSync(filePath)) {
            // Set security headers for the PDF response
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            
            // Create a read stream and pipe it to the response
            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
        } else {
            // 5. If the file doesn't exist, return a 404 error
            console.error(`File not found: ${filePath}`);
            res.status(404).json({ error: 'The requested resource was not found.' });
        }
    } catch (error) {
        console.error('❌ Server error fetching PDF:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// Serve the main application pages by routing them to your public folder
// This ensures that when a user goes to /Units, it serves /public/Units/index.html etc.
// Corrected Routes to Match Your File Structure

app.get(['/', '/dashboard'], (req, res) => {
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
app.get('/Notes', (req, res) => { // Corrected from '/Resources' to match your folder
    res.sendFile(path.join(__dirname, 'Notes', 'index.html'));
});
app.get('/pdf-viewer', (req, res) => {
    res.sendFile(path.join(__dirname, 'Pdfview', 'index.html')); // Corrected to match your 'Pdfview' folder
});
