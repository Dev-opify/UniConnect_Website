// Global variables
let currentPdf = null;
let currentScale = 1.0;

document.addEventListener('DOMContentLoaded', function() {
    // Disable context menu for security
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Disable common developer/printing shortcuts
    document.addEventListener('keydown', function(e) {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u') ||
            (e.ctrlKey && e.key === 's') ||
            (e.ctrlKey && e.key === 'p')
        ) {
            e.preventDefault();
        }
    });

    // Auto-load the PDF based on URL parameters
    loadPdf();
});

// Load PDF function
async function loadPdf() {
    showLoading();
    hideError();
    clearPdfContainer();

    // 1. Get parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    const unit = urlParams.get('unit');
    const type = urlParams.get('type');

    if (!subject || !unit || !type) {
        showError("Document details are missing. Please go back and try again.");
        hideLoading();
        return;
    }

    // Update titles
    document.getElementById('pdf-title').textContent = `${subject} - ${type.replace('.pdf', '')}`;
    document.getElementById('pdf-subtitle').textContent = `Showing content for ${unit}`;

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // 2. Construct the dynamic API URL
        const proxyUrl = `/api/getPdf?subject=${subject}&unit=${unit}&type=${type}`;
        
        const loadingTask = pdfjsLib.getDocument(proxyUrl);
        currentPdf = await loadingTask.promise;
        
        console.log(`PDF loaded with ${currentPdf.numPages} pages`);
        
        // Update UI
        document.getElementById('pageInfo').textContent = `${currentPdf.numPages} pages`;
        
        await renderAllPages();
        hideLoading();
        
    } catch (error) {
        console.error('Error loading PDF:', error);
        hideLoading();
        showError('Failed to load the document. It might not exist. Please try again.');
    }
}

// Render all pages
async function renderAllPages() {
    const container = document.getElementById('pdf-container');
    for (let pageNum = 1; pageNum <= currentPdf.numPages; pageNum++) {
        const page = await currentPdf.getPage(pageNum);
        await renderPage(page, pageNum, container);
    }
}

// Render individual page
async function renderPage(page, pageNum, container) {
    const viewport = page.getViewport({ scale: currentScale });
    
    const pageWrapper = document.createElement('div');
    pageWrapper.className = 'page-wrapper';
    
    const pageNumber = document.createElement('div');
    pageNumber.className = 'page-number';
    pageNumber.textContent = `Page ${pageNum}`;
    pageWrapper.appendChild(pageNumber);
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    pageWrapper.appendChild(canvas);
    container.appendChild(pageWrapper);
    
    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };
    await page.render(renderContext).promise;
}

// Zoom functionality
function changeZoom(delta) {
    if (!currentPdf) return;
    currentScale = Math.max(0.5, Math.min(3.0, currentScale + delta));
    document.getElementById('zoomLevel').textContent = `${Math.round(currentScale * 100)}%`;
    clearPdfContainer();
    renderAllPages();
}

// UI Utility functions
function showLoading() { document.getElementById('loading').style.display = 'block'; }
function hideLoading() { document.getElementById('loading').style.display = 'none'; }
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('error').style.display = 'block';
}
function hideError() { document.getElementById('error').style.display = 'none'; }
function clearPdfContainer() { document.getElementById('pdf-container').innerHTML = ''; }
