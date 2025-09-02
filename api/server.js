const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// This file will now ONLY handle the PDF logic.
// All page routing is handled by vercel.json.

app.get('/api/getPdf', (req, res) => {
    try {
        const { subject, unit, type } = req.query;

        // 1. Validate input
        if (!subject || !unit || !type) {
            return res.status(400).json({ error: 'Missing required parameters: subject, unit, or type.' });
        }

        // 2. Sanitize inputs to prevent path traversal
        const safeSubject = path.basename(subject);
        const safeUnit = path.basename(unit);
        const safeType = path.basename(type) + '.pdf'; // Add .pdf extension here

        // 3. Construct the full, safe file path
        // It looks for the 'public' folder relative to the project root
        const filePath = path.join(process.cwd(), 'public', 'Resources', safeSubject, safeUnit, safeType);

        console.log(`Attempting to serve file from: ${filePath}`);

        // 4. Check if file exists and serve it
        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            
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

// IMPORTANT: This line exports the Express app as a serverless function
module.exports = app;

