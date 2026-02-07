/*
 * Shared Utilities - Common functions for all tools
 * aaronmedina-dev.github.io
 */

/**
 * Copy text to clipboard with notification
 * @param {string} text - Text to copy
 * @param {string} [message='Copied to clipboard!'] - Success message
 * @returns {Promise<boolean>} - Success status
 */
async function copyTextToClipboard(text, message = 'Copied to clipboard!') {
    try {
        await navigator.clipboard.writeText(text);
        alert(message);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy: ' + err.message);
        return false;
    }
}

/**
 * Copy HTML content to clipboard as rich text
 * @param {string} html - HTML content to copy
 * @param {string} [message='Copied as rich text!'] - Success message
 * @returns {Promise<boolean>} - Success status
 */
async function copyHtmlToClipboard(html, message = 'Copied as rich text!') {
    try {
        const blob = new Blob([html], { type: 'text/html' });
        const item = new ClipboardItem({ 'text/html': blob });
        await navigator.clipboard.write([item]);
        alert(message);
        return true;
    } catch (err) {
        console.error('Failed to copy HTML:', err);
        alert('Failed to copy: ' + err.message);
        return false;
    }
}

/**
 * Copy JSON to clipboard
 * @param {object} data - Data object to copy as JSON
 * @param {string} [message='Copied as JSON!'] - Success message
 * @returns {Promise<boolean>} - Success status
 */
async function copyJsonToClipboard(data, message = 'Copied as JSON!') {
    try {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const item = new ClipboardItem({ 'application/json': blob });
        await navigator.clipboard.write([item]);
        alert(message);
        return true;
    } catch (err) {
        // Fallback to text copy
        return copyTextToClipboard(JSON.stringify(data, null, 2), message);
    }
}

/**
 * Download data as a file
 * @param {string} content - File content
 * @param {string} filename - File name with extension
 * @param {string} [mimeType='text/plain'] - MIME type
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download JSON data as a file
 * @param {object} data - Data object
 * @param {string} filename - File name (without extension)
 */
function downloadJson(data, filename) {
    downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
}

/**
 * Download CSV data as a file
 * @param {string} csvContent - CSV content
 * @param {string} filename - File name (without extension)
 */
function downloadCsv(csvContent, filename) {
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}
