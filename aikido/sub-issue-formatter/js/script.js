/*
 * Aikido Sub-Issue Formatter - App-specific logic
 * Shared utilities loaded from /assets/js/utils.js
 */

function processInput() {
    const inputText = document.getElementById('inputText').value;
    const outputText = document.getElementById('outputText');

    // Updated regex pattern to handle multiple line code snippets
    const regex = /^(.*?)\n\n(?:High|Critical|Medium|Low)\nLine (\d+(?: - \d+)?) in (.*?)\n([\s\S]*?)View (?:file|commit)/gm;
    let matches;
    let output = '';
    let count = 0;

    while ((matches = regex.exec(inputText)) !== null) {
        const filePath = matches[1].trim();
        const lineRange = matches[2];
        const codeSnippet = matches[4].trim();
        count++;

        output += `**Issue ${count} Line ${lineRange} ${filePath}**
${codeSnippet}


`;
    }

    if (!output) {
        output = 'No matches found. Ensure input format is correct.';
    }

    outputText.textContent = output.trim();
}

function copyOutput() {
    const outputText = document.getElementById('outputText').textContent;
    copyTextToClipboard(outputText, 'Output copied to clipboard!');
}
