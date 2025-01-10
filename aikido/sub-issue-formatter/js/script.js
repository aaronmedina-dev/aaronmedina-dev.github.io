function processInput() {
    const inputText = document.getElementById('inputText').value;
    const outputText = document.getElementById('outputText');

    // Regex pattern
    const regex = /^(.*?)(?:\n\n)?(?:High|Critical|Medium|Low)\nLine (\d+) in (.*?)\n([\s\S]*?)View file/gm;
    let matches;
    let output = '';
    let count = 0;

    while ((matches = regex.exec(inputText)) !== null) {
        const filePath = matches[1].trim();
        const lineNumber = matches[2];
        const codeSnippet = matches[4].trim();
        count++;

        output += `Issue ${count} Line ${lineNumber} ${filePath}\n\`${codeSnippet}\`\n\n\n`;
    }

    if (!output) {
        output = 'No matches found. Ensure input format is correct.';
    }

    outputText.textContent = output.trim();
}

function copyOutput() {
    const outputText = document.getElementById('outputText');
    navigator.clipboard.writeText(outputText.textContent)
        .then(() => alert('Output copied to clipboard!'))
        .catch(err => alert('Failed to copy output: ' + err));
}